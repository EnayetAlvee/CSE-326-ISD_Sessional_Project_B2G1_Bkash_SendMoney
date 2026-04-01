// account-service/middleware/internal_middleware.js
//
// Guards all /internal/* routes — these endpoints are only meant to be called
// by trusted services inside the private network (e.g. wallet-transaction-service).
// They must NEVER be reachable from the public internet.
//
// How it works:
//   The calling service attaches a shared secret in the request header:
//     x-internal-secret: <value of INTERNAL_SECRET env var>
//
//   This middleware checks that header. If it is missing or wrong → 403.
//
// Network-level protection (required in production):
//   The API Gateway (Nginx) must be configured to STRIP or BLOCK the
//   x-internal-secret header on any request arriving from outside the
//   private Docker/VPC network. That way even if someone knows the secret
//   value, they cannot use it from the public internet.
//
// Usage:
//   import internalMiddleware from "../middleware/internal_middleware.js";
//   router.get("/users/by-phone", internalMiddleware, handler);

import config from "../config/index.js";

// ─── Header Name ─────────────────────────────────────────────────────────────
// Exported as a constant so every service that calls /internal/* routes can
// import this name instead of hard-coding the string in multiple places.
export const INTERNAL_HEADER = "x-internal-secret";

// ─── Middleware ───────────────────────────────────────────────────────────────

const internalMiddleware = (req, res, next) => {

  const secret = req.headers[INTERNAL_HEADER];

  // ── 1. Header must be present ─────────────────────────────────────────────
  if (!secret) {
    return res.status(403).json({
      message: "Forbidden. Missing internal service header.",
    });
  }

  // ── 2. Value must match the configured secret ─────────────────────────────
  if (secret !== config.internalSecret) {
    return res.status(403).json({
      message: "Forbidden. Invalid internal service secret.",
    });
  }

  next();
};

export default internalMiddleware;
