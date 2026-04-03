import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import config from './config/index.js';
import otpRoutes from './routes/otp_routes.js';

const app = express();
const port = config.port || 3003;

app.use(cors());
app.use(express.json());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: config.rateLimitMax || 100,
  message: { message: 'Too many requests, please try again later.' },
});
app.use(limiter);

// Routes
app.use('/internal/otp', otpRoutes);

app.get('/', (req, res) => res.send('SMS Service running!'));

app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    environment: config.env,
    message: 'SMS service is ready!'
  });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong' });
});

app.listen(port, () => {
  console.log(`SMS Service listening on http://localhost:${port}`);
});
