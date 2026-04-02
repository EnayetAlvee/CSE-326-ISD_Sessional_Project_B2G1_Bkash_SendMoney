// wallet-transaction-service/app.js
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";

import { supabase } from "./config/supabase.js";
import config from "./config/index.js";
import internalRoutes from "./routes/internal_routes.js";

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan(config.env === "production" ? "combined" : "dev"));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: config.rateLimitMax,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many requests. Please try again later." },
});
app.use(limiter);

app.use("/internal", internalRoutes);

app.get("/health", async (req, res) => {
  try {
    const { error } = await supabase.auth.getSession();
    if (error) throw error;

    res.status(200).json({
      status: "healthy",
      service: "wallet-transaction-service",
      port: config.port,
      env: config.env,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error("[Health] Check failed:", err.message);
    res.status(503).json({
      status: "unhealthy",
      service: "wallet-transaction-service",
      error: err.message,
    });
  }
});

app.use((req, res) => {
  res.status(404).json({ message: `Route ${req.method} ${req.path} not found.` });
});

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error("[Error]", err.stack);
  res.status(500).json({ message: "An unexpected error occurred." });
});

app.listen(config.port, () => {
  console.log(
    `[wallet-transaction-service] Listening on http://localhost:${config.port}`,
  );
});