// server/controllers/sendmoney.controller.js

import sendMoneyService from '../services/sendmoney_service.js';

class SendMoneyController {

  async sendMoney(req, res) {
    try {
      const { to_phone, amount } = req.body;

      if (!to_phone || !amount) {
        return res.status(400).json({ message: 'Recipient phone and amount are required' });
      }

      const result = await sendMoneyService.sendMoney(req.user.id, to_phone, amount);
      res.status(200).json(result);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  }
}

export default new SendMoneyController();