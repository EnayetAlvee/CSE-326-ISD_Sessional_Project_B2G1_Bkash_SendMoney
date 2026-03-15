// server/routes/profile.routes.js

import { Router } from 'express';
import profileController from '../controllers/profile.controller.js';
import authMiddleware from '../middleware/auth.middleware.js';

const router = Router();

router.get('/', authMiddleware, (req, res) => profileController.getProfile(req, res));
router.patch('/update', authMiddleware, (req, res) => profileController.updateProfile(req, res));

export default router;