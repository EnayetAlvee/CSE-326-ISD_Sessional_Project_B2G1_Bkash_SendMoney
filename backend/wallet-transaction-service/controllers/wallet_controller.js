// wallet-transaction-service/controllers/wallet_controller.js
//
// Controller layer for wallet APIs.
// Responsibilities:
// - Validate request payload presence
// - Delegate to service layer
// - Return consistent HTTP responses

import walletService from "../services/wallet_service.js";

const createInternalWallet = async (req, res) => {
  try {
    const { userId, phone } = req.body;

    if (!userId || !phone) {
      return res.status(400).json({
        message: "userId and phone are required.",
      });
    }

    const result = await walletService.createWalletForUser({ userId, phone });
    return res.status(201).json(result);
  } catch (err) {
    return res.status(400).json({ message: err.message });
  }
};

const sendMoney = async (req, res) => {
  try {
    const { toPhone, amount } = req.body;
    const senderUserId = req.user?.id || req.user?.userId;

    if (!senderUserId) {
      return res.status(401).json({ message: "Unauthorized." });
    }

    if (!toPhone || !amount) {
      return res.status(400).json({
        message: "toPhone and amount are required.",
      });
    }

    const result = await walletService.sendMoney({
      senderUserId,
      toPhone,
      amount,
    });

    return res.status(200).json(result);
  } catch (err) {
    return res.status(400).json({ message: err.message });
  }
};

const getMyWallet = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?.userId;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized." });
    }

    const wallet = await walletService.getWalletByUserId(userId);
    return res.status(200).json({ wallet });
  } catch (err) {
    return res.status(400).json({ message: err.message });
  }
};

const listMyTransactions = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?.userId;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized." });
    }

    const limit = Number(req.query.limit || 20);
    const offset = Number(req.query.offset || 0);

    const transactions = await walletService.listTransactionsByUserId({
      userId,
      limit,
      offset,
    });

    return res.status(200).json({
      transactions,
      pagination: { limit, offset },
    });
  } catch (err) {
    return res.status(400).json({ message: err.message });
  }
};

export default {
  createInternalWallet,
  sendMoney,
  getMyWallet,
  listMyTransactions,
};
