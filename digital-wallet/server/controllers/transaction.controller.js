// server/controllers/transaction.controller.js

import transactionRepository from '../repositories/transaction.repository.js';

class TransactionController {

  async getHistory(req, res) {
    try {
      const history = await transactionRepository.getHistoryByUser(req.user.id);
      res.status(200).json({ transactions: history });
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  }
}

export default new TransactionController();