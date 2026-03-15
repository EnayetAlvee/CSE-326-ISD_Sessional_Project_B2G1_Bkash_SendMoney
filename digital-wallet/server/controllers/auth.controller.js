// server/controllers/auth.controller.js

/*
  WHAT THIS FILE DOES:
  Receives HTTP requests, calls the service, sends HTTP responses.
  Controllers should be thin — no business logic here.
  Pattern: get input → call service → send response
*/

import authService from '../services/auth.service.js';

class AuthController {

 // Only update the signup method — rest stays the same

async signup(req, res) {
  try {
    // ✅ UPDATED — extract new fields from request body
    const { email, password, full_name, phone, date_of_birth, nid_number } = req.body;

    // Basic validation
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }
    if (!phone) {
      return res.status(400).json({ message: 'Phone number is required' });
    }
    if (!full_name) {
      return res.status(400).json({ message: 'Full name is required' });
    }
    if (!date_of_birth) {
      return res.status(400).json({ message: 'Date of birth is required' });
    }
    if (!nid_number) {
      return res.status(400).json({ message: 'NID number is required' });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    const result = await authService.signup(
      email,
      password,
      full_name,
      phone,
      date_of_birth,
      nid_number
    );

    res.status(201).json(result);

  } catch (err) {
    res.status(400).json({ message: err.message });
  }
}

  async verifyOtp(req, res) {
    try {
      const { email, otp } = req.body;
      if (!email || !otp) {
        return res.status(400).json({ message: 'Email and OTP are required' });
      }

      const result = await authService.verifyOtp(email, otp);
      res.status(200).json(result);

    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  }

  async login(req, res) {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
      }

      const result = await authService.login(email, password);
      res.status(200).json(result);

    } catch (err) {
      res.status(401).json({ message: err.message });
    }
  }

  async verify2FA(req, res) {
    try {
      const { email, otp } = req.body;
      if (!email || !otp) {
        return res.status(400).json({ message: 'Email and OTP are required' });
      }

      const result = await authService.verify2FA(email, otp);
      res.status(200).json(result);

    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  }

  async forgotPassword(req, res) {
    try {
      const { email } = req.body;
      if (!email) {
        return res.status(400).json({ message: 'Email is required' });
      }

      const result = await authService.forgotPassword(email);
      res.status(200).json(result);

    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  }

  async resetPassword(req, res) {
    try {
      const { email, otp, new_password } = req.body;
      if (!email || !otp || !new_password) {
        return res.status(400).json({ message: 'Email, OTP and new password are required' });
      }

      if (new_password.length < 6) {
        return res.status(400).json({ message: 'Password must be at least 6 characters' });
      }

      const result = await authService.resetPassword(email, otp, new_password);
      res.status(200).json(result);

    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  }
}

export default new AuthController();