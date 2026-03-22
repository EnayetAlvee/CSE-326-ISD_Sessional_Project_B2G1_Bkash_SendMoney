// server/controllers/priyo.controller.js

import priyoService from '../services/priyo_service.js';

class PriyoController {

  async list(req, res) {
    try {
      const result = await priyoService.list(req.user.id);
      res.status(200).json(result);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  }

  async add(req, res) {
    try {
      const { phone, label } = req.body;
      if (!phone) {
        return res.status(400).json({ message: 'Phone number is required' });
      }
      const result = await priyoService.add(req.user.id, phone, label);
      res.status(201).json(result);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  }

  async remove(req, res) {
    try {
      const { phone } = req.body;
      if (!phone) {
        return res.status(400).json({ message: 'Phone number is required' });
      }
      const result = await priyoService.remove(req.user.id, phone);
      res.status(200).json(result);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  }

  async updateLabel(req, res) {
    try {
      const { phone, label } = req.body;
      if (!phone || !label) {
        return res.status(400).json({ message: 'Phone and label are required' });
      }
      const result = await priyoService.updateLabel(req.user.id, phone, label);
      res.status(200).json(result);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  }
}

export default new PriyoController();