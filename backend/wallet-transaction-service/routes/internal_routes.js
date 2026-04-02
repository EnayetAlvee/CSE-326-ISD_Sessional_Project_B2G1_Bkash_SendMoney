// wallet-transaction-service/routes/internal_routes.js
//
// Internal-only routes used by trusted services (e.g., account-service).

import express from "express";
import walletController from "../controllers/wallet_controller.js";
import internalMiddleware from "../middleware/internal_middleware.js";

const router = express.Router();

router.use(internalMiddleware);

// Called by account-service during signup to ensure wallet exists.
router.post("/wallets/create", walletController.createInternalWallet);

export default router;
