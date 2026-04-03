import express from 'express';
import otpController from '../controllers/otp_controller.js';
import { requireInternalSecret } from '../middleware/internal_middleware.js';

const router = express.Router();

router.use(requireInternalSecret);

router.post('/request', (req, res) => otpController.requestOtp(req, res));
router.post('/verify', (req, res) => otpController.verifyOtp(req, res));

export default router;
