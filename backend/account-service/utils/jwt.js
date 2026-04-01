// account-service/utils/jwt.js
//
// Thin wrappers around the jsonwebtoken library.
//
// Rules:
//   • Payload shape is always { userId, email } — keep it minimal.
//     Never put sensitive data (password, PIN, balance) inside a JWT.
//   • jwtSecret MUST be the same value in every service that verifies tokens
//     (account-service issues them, wallet-service and others verify them).
//   • verifyToken throws on failure — callers (auth_middleware) must catch.

import jwt from "jsonwebtoken";
import config from "../config/index.js";

// ─── Generate ─────────────────────────────────────────────────────────────────

/**
 * Sign and return a new JWT token.
 *
 * @param {{ userId: string, email: string }} payload
 * @returns {string}  Signed JWT string
 */
export const generateToken = (payload) =>
  jwt.sign(payload, config.jwtSecret, {
    expiresIn: config.jwtExpire, // default "7d" — set JWT_EXPIRE in .env to override
  });

// ─── Verify ───────────────────────────────────────────────────────────────────

/**
 * Verify a JWT token and return the decoded payload.
 *
 * Throws:
 *   TokenExpiredError    — token is valid but has expired
 *   JsonWebTokenError    — token is malformed or the signature does not match
 *   NotBeforeError       — token is not yet valid (nbf claim)
 *
 * @param {string} token
 * @returns {{ userId: string, email: string, iat: number, exp: number }}
 */
export const verifyToken = (token) =>
  jwt.verify(token, config.jwtSecret);
