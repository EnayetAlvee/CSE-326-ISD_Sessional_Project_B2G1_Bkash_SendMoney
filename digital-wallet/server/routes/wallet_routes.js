// server/routes/wallet.routes.js

import { Router } from 'express';
import walletController from '../controllers/wallet_controller.js';
import sendMoneyController from '../controllers/sendmoney_controller.js';
import transactionController from '../controllers/transaction_controller.js';
import authMiddleware from '../middleware/auth_middleware.js';

const router = Router();

// All routes here require login
router.get('/balance', authMiddleware, (req, res) => walletController.getBalance(req, res));
router.post('/add-money', authMiddleware, (req, res) => walletController.addMoney(req, res));
router.post('/send-money', authMiddleware, (req, res) => sendMoneyController.sendMoney(req, res));
router.get('/transactions', authMiddleware, (req, res) => transactionController.getHistory(req, res));

export default router;