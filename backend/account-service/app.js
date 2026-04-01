// account-service/app.js
//
// Entry point for the Account Service.
// Responsibilities:
//   • Bootstrap Express with global middleware (CORS, JSON, rate-limit, helmet, morgan)
//   • Mount all route groups
//   • Expose a /health endpoint
//   • Start listening on PORT 5001
//
// This service has NO queue consumers and NO cache connections.
// It only owns: Supabase (PostgreSQL) + outbound HTTP calls to sms-service and wallet-service.

import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";

import config from "./config/index.js";
import { supabase } from "./config/supabase.js";

import authRoutes from "./routes/auth_routes.js";
import profileRoutes from "./routes/profile_routes.js";
import priyoRoutes from "./routes/priyo_routes.js";
import internalRoutes from "./routes/internal_routes.js";

// ─── App Setup ────────────────────────────────────────────────────────────────

const app = express();

// ─── Global Middleware ────────────────────────────────────────────────────────

// Security headers — sets X-Content-Type-Options, X-Frame-Options, etc.
app.use(helmet());

// CORS — allow all origins in development; tighten in production via env
app.use(cors());

// Parse incoming JSON request bodies
app.use(express.json());

// HTTP request logging — "dev" format in development, "combined" in production
app.use(morgan(config.env === "production" ? "combined" : "dev"));

// Rate limiting — applied globally to every route in this service.
// The API gateway has its own rate limiting on top of this.
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15-minute sliding window
  max: config.rateLimitMax, // max requests per IP per window
  standardHeaders: true, // return rate limit info in RateLimit-* headers
  legacyHeaders: false,
  message: { message: "Too many requests. Please try again later." },
});
app.use(limiter);

// ─── Routes ───────────────────────────────────────────────────────────────────

// Public auth routes  — signup, login, OTP verify, forgot/reset password
app.use("/api/auth", authRoutes);

// Protected profile routes — get profile, update profile
app.use("/api/profile", profileRoutes);

// Protected priyo routes  — list, add, remove, update-label
app.use("/api/priyo", priyoRoutes);

// Internal routes — called by wallet-service only, blocked at gateway from public
// /internal/users/by-phone   → resolve phone → userId
// /internal/priyo/check      → check priyo status for charge calculation
app.use("/internal", internalRoutes);

// ─── Health Check ─────────────────────────────────────────────────────────────
//
// Used by Docker, load balancers, and UptimeRobot.
// Tests the Supabase connection so a failed DB connection returns unhealthy.

app.get("/health", async (req, res) => {
  try {
    // Lightweight check — just confirm we can reach Supabase
    const { error } = await supabase.auth.getSession();
    if (error) throw error;

    res.status(200).json({
      status: "healthy",
      service: "account-service",
      port: config.port,
      env: config.env,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error("[Health] Check failed:", err.message);
    res.status(503).json({
      status: "unhealthy",
      service: "account-service",
      error: err.message,
    });
  }
});

// ─── 404 Handler ──────────────────────────────────────────────────────────────

app.use((req, res) => {
  res
    .status(404)
    .json({ message: `Route ${req.method} ${req.path} not found.` });
});

// ─── Global Error Handler ─────────────────────────────────────────────────────
//
// Catches any error that was passed to next(err) or thrown inside async handlers.
// This is the last line of defence — controllers should handle their own errors,
// but this prevents unhandled errors from crashing the process.

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error("[Error]", err.stack);
  res.status(500).json({ message: "An unexpected error occurred." });
});

// ─── Start Server ─────────────────────────────────────────────────────────────

app.listen(config.port, () => {
  console.log(`[account-service] Listening on http://localhost:${config.port}`);
  console.log(`[account-service] Environment : ${config.env}`);
  console.log(`[account-service] SMS Service : ${config.smsServiceUrl}`);
  console.log(`[account-service] Wallet Svc  : ${config.walletServiceUrl}`);
});
