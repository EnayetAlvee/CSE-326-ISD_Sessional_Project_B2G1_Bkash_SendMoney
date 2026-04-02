// wallet-transaction-service/middleware/internal_middleware.js
//
// Protects /internal/* routes so only trusted services can call them.

import config from "../config/index.js";

export const INTERNAL_HEADER = "x-internal-secret";

const internalMiddleware = (req, res, next) => {
  const secret = req.headers[INTERNAL_HEADER];

  if (!secret) {
    return res.status(403).json({
      message: "Forbidden. Missing internal service header.",
    });
  }

  if (secret !== config.internalSecret) {
    return res.status(403).json({
      message: "Forbidden. Invalid internal service secret.",
    });
  }

  next();
};

export default internalMiddleware;
