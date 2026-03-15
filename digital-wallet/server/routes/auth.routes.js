// server/routes/auth.routes.js

/*
  WHAT THIS FILE DOES:
  Maps URLs to controller methods.
  Think of this as a directory: "POST /signup → authController.signup"
*/

import { Router } from 'express';
import authController from '../controllers/auth.controller.js';

const router = Router();

router.post('/signup', (req, res) => authController.signup(req, res));
router.post('/verify-otp', (req, res) => authController.verifyOtp(req, res));
router.post('/login', (req, res) => authController.login(req, res));
router.post('/verify-2fa', (req, res) => authController.verify2FA(req, res));
router.post('/forgot-password', (req, res) => authController.forgotPassword(req, res));
router.post('/reset-password', (req, res) => authController.resetPassword(req, res));

export default router;