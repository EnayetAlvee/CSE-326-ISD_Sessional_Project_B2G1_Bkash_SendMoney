// wallet-transaction-service/routes/wallet_routes.js
//
// Public wallet routes.

import express from "express";
import authMiddleware from "../middleware/auth_middleware.js";
import walletController from "../controllers/wallet_controller.js";

const router = express.Router();

router.use(authMiddleware);

router.get("/me", walletController.getMyWallet);
router.get("/transactions", walletController.listMyTransactions);
router.post("/send-money", walletController.sendMoney);

export default router;
