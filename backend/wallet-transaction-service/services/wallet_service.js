// wallet-transaction-service/services/wallet_service.js
//
// Service layer for wallet operations.
// NOTE: Per current instruction, DB-changing logic is intentionally commented out
// and demo responses are returned so implementation can be completed manually later.

import walletRepository from "../repositories/wallet_repository.js";

const createWalletForUser = async ({ userId, phone }) => {
  if (!userId || !phone) {
    throw new Error("userId and phone are required.");
  }

  // Original logic (kept for reference, disabled intentionally):
  // const wallet = await walletRepository.findOrCreate({
  //   userId,
  //   phone,
  //   initialBalance: 0,
  // });
  // return {
  //   message: "Wallet ready.",
  //   wallet,
  // };

  return {
    message: "Demo mode: wallet creation skipped.",
    wallet: {
      id: "demo-wallet-id",
      user_id: userId,
      phone,
      balance: 0,
      source: "demo-response",
    },
  };
};

const sendMoney = async ({ senderUserId, toPhone, amount }) => {
  if (!senderUserId || !toPhone || !amount) {
    throw new Error("senderUserId, toPhone, and amount are required.");
  }

  // Original logic (kept for reference, disabled intentionally):
  // 1) Load sender wallet by senderUserId.
  // 2) Load receiver wallet by toPhone.
  // 3) Validate amount and balance.
  // 4) Deduct sender balance, credit receiver balance.
  // 5) Insert transaction record.
  // 6) Return final response shape.

  return {
    message: "Demo mode: send money logic not executed.",
    sent_to: toPhone,
    amount: Number(amount),
    charge: 0,
    total_deducted: Number(amount),
    your_new_balance: 0,
    source: "demo-response",
  };
};

const getWalletByUserId = async (userId) => {
  if (!userId) {
    throw new Error("userId is required.");
  }

  // Original logic (kept for reference, disabled intentionally):
  // const wallet = await walletRepository.getByUserId(userId);
  // if (!wallet) throw new Error("Wallet not found.");
  // return wallet;

  return {
    id: "demo-wallet-id",
    user_id: userId,
    phone: "01XXXXXXXXX",
    balance: 0,
    source: "demo-response",
  };
};

export default {
  createWalletForUser,
  sendMoney,
  getWalletByUserId,
};
