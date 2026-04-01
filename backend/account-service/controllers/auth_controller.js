// account-service/controllers/auth_controller.js
//
// Thin HTTP layer for all authentication endpoints.
//
// Responsibilities (only these three):
//   1. Read and validate input from req.body
//   2. Call the appropriate auth_service method
//   3. Send the HTTP response
//
// What does NOT belong here:
//   • Business logic          → auth_service.js
//   • Database access         → repositories/
//   • HTTP calls to sms/wallet → utils/notification_client.js, utils/wallet_client.js

import authService from "../services/auth_service.js";

class AuthController {

  // ─── POST /api/auth/signup ────────────────────────────────────────────────
  async signup(req, res) {
    try {
      const { email, password, full_name, phone, date_of_birth, nid_number } = req.body;

      if (!email)         return res.status(400).json({ message: "Email is required." });
      if (!password)      return res.status(400).json({ message: "Password is required." });
      if (!full_name)     return res.status(400).json({ message: "Full name is required." });
      if (!phone)         return res.status(400).json({ message: "Phone number is required." });
      if (!date_of_birth) return res.status(400).json({ message: "Date of birth is required." });
      if (!nid_number)    return res.status(400).json({ message: "NID number is required." });

      if (password.length < 6) {
        return res.status(400).json({ message: "Password must be at least 6 characters." });
      }

      const result = authService.signup(
        email,
        password,
        full_name,
        phone,
        date_of_birth,
        nid_number,
      );

      res.status(201).json(result);

    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  }

  // ─── POST /api/auth/verify-otp ────────────────────────────────────────────
  async verifyOtp(req, res) {
    try {
      const { email, otp } = req.body;

      if (!email) return res.status(400).json({ message: "Email is required." });
      if (!otp)   return res.status(400).json({ message: "OTP is required." });

      const result = await authService.verifyOtp(email, otp);
      res.status(200).json(result);

    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  }

  // ─── POST /api/auth/login ─────────────────────────────────────────────────
  async login(req, res) {
    try {
      const { email, password } = req.body;

      if (!email)    return res.status(400).json({ message: "Email is required." });
      if (!password) return res.status(400).json({ message: "Password is required." });

      const result = await authService.login(email, password);
      res.status(200).json(result);

    } catch (err) {
      // Return 401 specifically for credential failures, 400 for everything else
      const status = err.message === "Invalid email or password." ? 401 : 400;
      res.status(status).json({ message: err.message });
    }
  }

  // ─── POST /api/auth/verify-2fa ────────────────────────────────────────────
  async verify2FA(req, res) {
    try {
      const { email, otp } = req.body;

      if (!email) return res.status(400).json({ message: "Email is required." });
      if (!otp)   return res.status(400).json({ message: "OTP is required." });

      const result = await authService.verify2FA(email, otp);
      res.status(200).json(result);

    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  }

  // ─── POST /api/auth/forgot-password ──────────────────────────────────────
  async forgotPassword(req, res) {
    try {
      const { email } = req.body;

      if (!email) return res.status(400).json({ message: "Email is required." });

      const result = authService.forgotPassword(email);
      res.status(200).json(result);

    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  }

  // ─── POST /api/auth/reset-password ───────────────────────────────────────
  async resetPassword(req, res) {
    try {
      const { email, otp, new_password } = req.body;

      if (!email)        return res.status(400).json({ message: "Email is required." });
      if (!otp)          return res.status(400).json({ message: "OTP is required." });
      if (!new_password) return res.status(400).json({ message: "New password is required." });

      if (new_password.length < 6) {
        return res.status(400).json({ message: "Password must be at least 6 characters." });
      }

      const result = authService.resetPassword(email, otp, new_password);
      res.status(200).json(result);

    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  }

}

export default new AuthController();
