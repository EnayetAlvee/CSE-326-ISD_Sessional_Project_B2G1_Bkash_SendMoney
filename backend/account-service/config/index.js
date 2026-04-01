// account-service/config/index.js
//
// Central config — all environment variables are read here once.
// Every other file imports from here; nothing reads process.env directly.
//
// Required .env variables:
//   SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY
//   JWT_SECRET
//   SMS_SERVICE_URL      e.g. http://localhost:5003
//   WALLET_SERVICE_URL   e.g. http://localhost:5002
//   INTERNAL_SECRET      shared secret used by service-to-service internal routes

import dotenv from "dotenv";
dotenv.config();

export default {
  // ─── Server ───────────────────────────────────────────────────────────────
  port: parseInt(process.env.PORT) || 5001,
  env: process.env.NODE_ENV || "development",

  // ─── Supabase (PostgreSQL via Supabase) ───────────────────────────────────
  // account-service owns the "Profiles" and "priyo_numbers" tables.
  // All DB access goes through supabaseAdmin (service-role key) server-side.
  supabaseUrl: process.env.SUPABASE_URL,
  supabaseAnonKey: process.env.SUPABASE_ANON_KEY,
  supabaseServiceKey: process.env.SUPABASE_SERVICE_ROLE_KEY,

  // ─── JWT ──────────────────────────────────────────────────────────────────
  // jwtSecret MUST be the same value across every service that issues
  // or verifies tokens (account-service issues, wallet-service verifies).
  jwtSecret: process.env.JWT_SECRET,
  jwtExpire: process.env.JWT_EXPIRE || "7d",

  // ─── Downstream Service URLs ──────────────────────────────────────────────
  // account-service calls these services via HTTP — it owns no queues or cache.

  // sms-service  — OTP generation, verification, and notification delivery.
  //   POST /api/otp/request  ← fire & forget (we do not await delivery)
  //   POST /api/otp/verify   ← awaited     (we need the valid/invalid result)
  smsServiceUrl: process.env.SMS_SERVICE_URL || "http://localhost:5003",

  // wallet-transaction-service — called once during signup to create the wallet.
  //   POST /internal/wallets/create  ← fire & forget
  walletServiceUrl: process.env.WALLET_SERVICE_URL || "http://localhost:5002",

  // ─── Internal Service Secret ──────────────────────────────────────────────
  // wallet-service sends this in the X-Internal-Secret header when calling
  // our /internal/* routes. Set the same value in every service's .env.
  // The API gateway MUST block this header from reaching services externally.
  internalSecret: process.env.INTERNAL_SECRET || "change-me-in-production",

  // ─── Rate Limiting ────────────────────────────────────────────────────────
  rateLimitMax: parseInt(process.env.RATE_LIMIT_MAX) || 100,
};
