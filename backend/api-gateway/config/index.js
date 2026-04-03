
import dotenv from 'dotenv';

dotenv.config();

export default {
  port: Number(process.env.PORT) || 3000,
  env: process.env.NODE_ENV || 'development',
  rateLimitMax: Number(process.env.RATE_LIMIT_MAX) || 200,
  accountServiceUrl: process.env.ACCOUNT_SERVICE_URL || 'http://localhost:3001',
  walletServiceUrl: process.env.WALLET_SERVICE_URL || 'http://localhost:3002',
  smsServiceUrl: process.env.SMS_SERVICE_URL || 'http://localhost:3003',
};