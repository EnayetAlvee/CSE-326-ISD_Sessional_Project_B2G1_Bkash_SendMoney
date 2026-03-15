// server/middleware/auth.middleware.js

/*
  WHAT THIS FILE DOES:
  Protects routes that require login.
  Reads the JWT token from the request header,
  verifies it, and attaches the user info to req.user.
  
  Usage: add it to any route that needs login:
  router.get('/balance', authMiddleware, walletController.getBalance)
*/

import { verifyToken } from '../utils/jwt.js';
import userRepository from '../repositories/user.repository.js';

const authMiddleware = async (req, res, next) => {
  try {
    // Token comes in the header as: Authorization: Bearer <token>
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const token = authHeader.split(' ')[1]; // Extract the token part
    const decoded = verifyToken(token);     // Verify and decode it

    // Fetch the actual user from DB to make sure they still exist
    const user = await userRepository.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    req.user = user; // Attach user to request so controllers can use it
    next();          // Move on to the actual route handler

  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired, please login again' });
    }
    return res.status(401).json({ message: 'Invalid token' });
  }
};

export default authMiddleware;