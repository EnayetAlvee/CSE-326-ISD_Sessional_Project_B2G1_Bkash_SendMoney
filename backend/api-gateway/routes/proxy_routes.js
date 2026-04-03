import express from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import config from '../config/index.js';

const router = express.Router();

const commonProxyOptions = {
  changeOrigin: true,
  xfwd: true,
};

router.use(
  '/auth',
  createProxyMiddleware({
    ...commonProxyOptions,
    target: config.accountServiceUrl,
    pathRewrite: { '^/auth': '/api/auth' },
  })
);

router.use(
  '/profile',
  createProxyMiddleware({
    ...commonProxyOptions,
    target: config.accountServiceUrl,
    pathRewrite: { '^/profile': '/api/profile' },
  })
);

router.use(
  '/priyo',
  createProxyMiddleware({
    ...commonProxyOptions,
    target: config.accountServiceUrl,
    pathRewrite: { '^/priyo': '/api/priyo' },
  })
);

router.use(
  '/wallet',
  createProxyMiddleware({
    ...commonProxyOptions,
    target: config.walletServiceUrl,
    pathRewrite: { '^/wallet': '/api/wallet' },
  })
);

router.use(
  '/otp',
  createProxyMiddleware({
    ...commonProxyOptions,
    target: config.smsServiceUrl,
    pathRewrite: { '^/otp': '/internal/otp' },
  })
);

export default router;
