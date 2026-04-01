
//server/config/index.js
import dotenv from 'dotenv';

dotenv.config();

export default {
  port: process.env.PORT || 5000,
  env: process.env.NODE_ENV || 'nothingdev',

  supabaseUrl: process.env.SUPABASE_URL,
  supabaseAnonKey: process.env.SUPABASE_ANON_KEY,
  supabaseServiceKey: process.env.SUPABASE_SERVICE_ROLE_KEY,

  jwtSecret: process.env.JWT_SECRET,
  jwtExpire: process.env.JWT_EXPIRE,

  rateLimitMax: parseInt(process.env.RATE_LIMIT_MAX) || 100,

  // Email config for sending OTPs
  emailHost: process.env.EMAIL_HOST,
  emailPort: parseInt(process.env.EMAIL_PORT) || 587,
  emailUser: process.env.EMAIL_USER,
  emailPass: process.env.EMAIL_PASS,
  emailFrom: process.env.EMAIL_FROM,
};