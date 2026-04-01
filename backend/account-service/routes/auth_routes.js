// account-service/routes/auth_routes.js
//
// Maps authentication HTTP endpoints to AuthController methods.
// All routes here are PUBLIC — no auth middleware applied.
//
// Mounted at: /api/auth  (in app.js)
//
// Full endpoint list:
//   POST /api/auth/signup
//   POST /api/auth/verify-otp
//   POST /api/auth/login
//   POST /api/auth/verify-2fa
//   POST /api/auth/forgot-password
//   POST /api/auth/reset-password

import { Router }      from "express";
import authController  from "../controllers/auth_controller.js";

const router = Router();

// ─── Public Auth Routes ───────────────────────────────────────────────────────

router.post("/signup",          (req, res) => authController.signup(req, res));
router.post("/verify-otp",      (req, res) => authController.verifyOtp(req, res));
router.post("/login",           (req, res) => authController.login(req, res));
router.post("/verify-2fa",      (req, res) => authController.verify2FA(req, res));
router.post("/forgot-password", (req, res) => authController.forgotPassword(req, res));
router.post("/reset-password",  (req, res) => authController.resetPassword(req, res));

export default router;
