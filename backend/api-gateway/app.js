import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import config from './config/index.js';
import proxyRoutes from './routes/proxy_routes.js';

const app = express();
const port = config.port;
app.use(cors());
app.use(express.json());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: config.rateLimitMax,
  message: { message: 'Too many requests, please try again later.' },
});
app.use(limiter);

app.use('/api', proxyRoutes);

app.get('/', (req, res) => res.send('API Gateway is running!'));

app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    environment: config.env,
    services: {
      accountServiceUrl: config.accountServiceUrl,
      walletServiceUrl: config.walletServiceUrl,
      smsServiceUrl: config.smsServiceUrl,
    },
  });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong' });
});

app.listen(port, () => {
  console.log(`API Gateway listening on http://localhost:${port}`);
});