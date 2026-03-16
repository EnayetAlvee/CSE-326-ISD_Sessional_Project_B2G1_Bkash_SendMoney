// server/services/wallet.service.js

import walletRepository from '../repositories/wallet.repository.js';
import transactionRepository from '../repositories/transaction.repository.js';

class WalletService {

  async getBalance(userId) {
    const balance = await walletRepository.getBalance(userId);
    return balance;
  }

  async addMoney(userId, amount) {
    // 1. Validate amount
    amount = Number(amount);
    if (isNaN(amount) || amount <= 0) {
      throw new Error('Amount must be a positive number');
    }
    if (amount > 100000) {
      throw new Error('Cannot add more than 100,000 BDT at once');
    }

    // 2. Get current balance
    const currentBalance = await walletRepository.getBalance(userId);

    // 3. Update balance
    const newBalance = currentBalance + amount;
    await walletRepository.updateBalance(userId, newBalance);

    // 4. Record transaction
    await transactionRepository.create({
      fromUserId: null,       // null for add money — no sender
      toUserId: userId,
      amount,
      charge: 0,              // adding money is always free
      type: 'add money',
    });

    return {
      message: 'Money added successfully',
      added: amount,
      new_balance: newBalance,
    };
  }
}

export default new WalletService();