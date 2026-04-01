// account-service/middleware/auth_middleware.js
//
// Protects routes that require an authenticated user.
//
// How it works:
//   1. Reads the JWT from the "Authorization: Bearer <token>" header
//   2. Verifies the signature and expiry using the shared jwtSecret
//   3. Loads the full profile from DB (confirms the account still exists)
//   4. Attaches the profile to req.user so downstream handlers can use it
//   5. Calls next() to proceed, or returns 401 if anything fails
//
// Usage:
//   import authMiddleware from "../middleware/auth_middleware.js";
//   router.get("/profile", authMiddleware, controller.getProfile);

import { verifyToken } from "../utils/jwt.js";
import userRepository  from "../repositories/user_repository.js";

const authMiddleware = async (req, res, next) => {
  try {

    // ── 1. Extract token ───────────────────────────────────────────────────────
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "Access denied. No token provided.",
      });
    }

    const token = authHeader.split(" ")[1]; // "Bearer <token>" → "<token>"

    // ── 2. Verify signature and decode payload ─────────────────────────────────
    // Throws TokenExpiredError or JsonWebTokenError on failure — caught below
    const decoded = verifyToken(token);

    // ── 3. Hydrate user from DB ────────────────────────────────────────────────
    // Confirms the account still exists and hasn't been deleted or suspended
    // since the token was issued. Small DB hit but prevents stale tokens from
    // granting access after account removal.
    const user = await userRepository.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({
        message: "Access denied. Account not found.",
      });
    }

    // ── 4. Attach to request object ────────────────────────────────────────────
    // Downstream controllers and services access req.user.id, req.user.email, etc.
    req.user = user;

    next();

  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({
        message: "Session expired. Please log in again.",
      });
    }
    // Covers JsonWebTokenError (bad signature, malformed token, wrong secret)
    return res.status(401).json({
      message: "Access denied. Invalid token.",
    });
  }
};

export default authMiddleware;
