// server/utils/jwt.js

/*
  WHAT THIS FILE DOES:
  Creates and verifies JWT tokens.
  A JWT token = a signed string that proves who the user is.
  The server creates it at login. The client sends it with every request.
*/

import jwt from 'jsonwebtoken';
import config from '../config/index.js';

export const generateToken = (payload) => {
  return jwt.sign(payload, config.jwtSecret, {
    expiresIn: config.jwtExpire || '7d',
  });
};

export const verifyToken = (token) => {
  return jwt.verify(token, config.jwtSecret);
};