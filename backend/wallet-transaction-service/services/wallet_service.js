// wallet-transaction-service/services/wallet_service.js
//
// Service layer for wallet operations.
// NOTE: Per current instruction, DB-changing logic is intentionally commented out
// and demo responses are returned so implementation can be completed manually later.

import walletRepository from "../repositories/wallet_repository.js";
import transactionRepository from "../repositories/transaction_repository.js";

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

  const numericAmount = Number(amount);
  if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
    throw new Error("amount must be a positive number.");
  }

  // Original logic (kept for reference, disabled intentionally):
  // const senderWallet = await walletRepository.getByUserId(senderUserId);
  // if (!senderWallet) throw new Error("Sender wallet not found.");
  //
  // const receiverWallet = await walletRepository.getByPhone(toPhone);
  // if (!receiverWallet) throw new Error("Receiver wallet not found.");
  //
  // if (senderWallet.id === receiverWallet.id) {
  //   throw new Error("Cannot send money to your own wallet.");
  // }
  //
  // const charge = 0; // Replace with your charge rule
  // const totalDeducted = numericAmount + charge;
  //
  // if (Number(senderWallet.balance) < totalDeducted) {
  //   throw new Error("Insufficient balance.");
  // }
  //
  // const senderNextBalance = Number(senderWallet.balance) - totalDeducted;
  // const receiverNextBalance = Number(receiverWallet.balance) + numericAmount;
  //
  // await walletRepository.updateBalanceById({
  //   walletId: senderWallet.id,
  //   nextBalance: senderNextBalance,
  // });
  //
  // await walletRepository.updateBalanceById({
  //   walletId: receiverWallet.id,
  //   nextBalance: receiverNextBalance,
  // });
  //
  // const txn = await transactionRepository.create({
  //   senderWalletId: senderWallet.id,
  //   receiverWalletId: receiverWallet.id,
  //   amount: numericAmount,
  //   charge,
  //   type: "send_money",
  //   status: "completed",
  // });
  //
  // return {
  //   message: "Money sent successfully.",
  //   transaction_id: txn.id,
  //   sent_to: toPhone,
  //   amount: numericAmount,
  //   charge,
  //   total_deducted: totalDeducted,
  //   your_new_balance: senderNextBalance,
  // };

  return {
    message: "Demo mode: send money logic not executed.",
    sent_to: toPhone,
    amount: numericAmount,
    charge: 0,
    total_deducted: numericAmount,
    your_new_balance: 0,
    source: "demo-response",
  };
};

const listTransactionsByUserId = async ({ userId, limit = 20, offset = 0 }) => {
  if (!userId) {
    throw new Error("userId is required.");
  }

  // Original logic (kept for reference, disabled intentionally):
  // const wallet = await walletRepository.getByUserId(userId);
  // if (!wallet) throw new Error("Wallet not found.");
  // return transactionRepository.listByWalletId({
  //   walletId: wallet.id,
  //   limit,
  //   offset,
  // });

  return [
    {
      id: "demo-txn-id",
      sender_wallet_id: "demo-sender-wallet",
      receiver_wallet_id: "demo-receiver-wallet",
      amount: 100,
      charge: 0,
      txn_type: "send_money",
      status: "completed",
      created_at: new Date().toISOString(),
      source: "demo-response",
    },
  ];
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

const listTransactionsByUserId = async ({ userId, limit = 20, offset = 0 }) => {
  if (!userId) {
    throw new Error("userId is required.");
  }

  // Original logic (kept for reference, disabled intentionally):
  // const wallet = await walletRepository.getByUserId(userId);
  // if (!wallet) throw new Error("Wallet not found.");
  // return transactionRepository.listByWalletId({
  //   walletId: wallet.id,
  //   limit,
  //   offset,
  // });

  return [
    {
      id: "demo-txn-id",
      sender_wallet_id: "demo-sender-wallet",
      receiver_wallet_id: "demo-receiver-wallet",
      amount: 100,
      charge: 0,
      txn_type: "send_money",
      status: "completed",
      created_at: new Date().toISOString(),
      source: "demo-response",
    },
  ];
};

export default {
  createWalletForUser,
  sendMoney,
  getWalletByUserId,
  listTransactionsByUserId,
};
