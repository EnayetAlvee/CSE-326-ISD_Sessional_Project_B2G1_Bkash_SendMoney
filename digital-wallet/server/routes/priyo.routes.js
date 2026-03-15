// server/routes/priyo.routes.js

import { Router } from 'express';
import priyoController from '../controllers/priyo.controller.js';
import authMiddleware from '../middleware/auth.middleware.js';

const router = Router();

router.get('/', authMiddleware, (req, res) => priyoController.list(req, res));
router.post('/add', authMiddleware, (req, res) => priyoController.add(req, res));
router.delete('/remove', authMiddleware, (req, res) => priyoController.remove(req, res));
router.patch('/update-label', authMiddleware, (req, res) => priyoController.updateLabel(req, res));

export default router;