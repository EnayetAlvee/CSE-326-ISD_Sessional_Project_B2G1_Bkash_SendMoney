
// wallet-transaction-service/config/index.js
import dotenv from "dotenv";

dotenv.config();

export default {
  port: parseInt(process.env.PORT) || 5002,
  env: process.env.NODE_ENV || "development",

  supabaseUrl: process.env.SUPABASE_URL,
  supabaseAnonKey: process.env.SUPABASE_ANON_KEY,
  supabaseServiceKey: process.env.SUPABASE_SERVICE_ROLE_KEY,

  jwtSecret: process.env.JWT_SECRET,
  jwtExpire: process.env.JWT_EXPIRE || "7d",

  internalSecret: process.env.INTERNAL_SECRET || "change-me-in-production",

  rateLimitMax: parseInt(process.env.RATE_LIMIT_MAX) || 100,
};