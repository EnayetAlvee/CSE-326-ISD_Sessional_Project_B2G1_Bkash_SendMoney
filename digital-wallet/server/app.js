// server/app.js
import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { supabase } from './config/supabase.js';
import config from './config/index.js';
import authRoutes from './routes/auth.routes.js';
import walletRoutes from './routes/wallet.routes.js';
import priyoRoutes from './routes/priyo.routes.js';
import profileRoutes from './routes/profile.routes.js';


const app = express();   //Initializes the app instance.
const port = config.port || 3000;
app.use(cors());
app.use(express.json()); // lets Express read JSON request bodies



// Rate limiting — max 100 requests per 15 minutes per IP
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: config.rateLimitMax,
  message: { message: 'Too many requests, please try again later.' },
});
app.use(limiter);



// Routes
app.use('/api/auth', authRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/priyo', priyoRoutes);
app.use('/api/profile', profileRoutes);

app.get('/', (req, res) => res.send('Server is running!'));

// Simple health check (tests Supabase connection without needing tables)
app.get('/api/health', async (req, res) => {
  try {
    // Just check if we can connect (no table needed)
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;

    res.json({
      status: 'healthy_now',
      environment: config.env,
      supabase_connected: true,
      message: 'Backend + Supabase ready!'
    });
  } catch (err) {
    console.error('Health check failed', err);
    res.status(500).json({ status: 'error', supabase_connected: false });
  }
});


// Global error handler — catches anything not handled in controllers
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong' });
});



app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
});