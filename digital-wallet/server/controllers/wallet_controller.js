// server/controllers/wallet.controller.js

import walletService from '../services/wallet_service.js';

class WalletController {

  async getBalance(req, res) {
    try {
      const balance = await walletService.getBalance(req.user.id);
      res.status(200).json({ balance });
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  }

  async addMoney(req, res) {
    try {
      const { amount } = req.body;

      if (!amount) {
        return res.status(400).json({ message: 'Amount is required' });
      }

      const result = await walletService.addMoney(req.user.id, amount);
      res.status(200).json(result);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  }
}

export default new WalletController();