// server/services/auth.service.js

/*
  WHAT THIS FILE DOES:
  All the business logic for authentication.
  Controllers call these methods — they don't touch the DB directly.
  
  Flow:
  signup() → creates auth user + profile + wallet + sends OTP
  verifyOtp() → marks account verified
  login() → checks password → returns JWT (or triggers 2FA)
  forgotPassword() → sends reset OTP
  resetPassword() → verifies OTP → updates password
*/// server/services/auth.service.js

import { supabaseAdmin } from '../config/supabase.js';
import userRepository from '../repositories/user.repository.js';
import walletRepository from '../repositories/wallet.repository.js';
import otpRepository from '../repositories/otp.repository.js';
import { generateOtp } from '../utils/otp.js';
import { generateToken } from '../utils/jwt.js';
import { sendOtpEmail } from '../utils/email.js';

class AuthService {

  // ✅ UPDATED — now accepts date_of_birth and nid_number
  async signup(email, password, fullName, phone, dateOfBirth, nidNumber) {

    // 1. Validate required fields
    if (!phone) throw new Error('Phone number is required');
    if (!dateOfBirth) throw new Error('Date of birth is required');
    if (!nidNumber) throw new Error('NID number is required');

    // 2. Check email already exists
    const existing = await userRepository.findByEmail(email);
    if (existing) throw new Error('Email already registered');

    // 3. Check phone already exists
    const existingPhone = await userRepository.findByPhone(phone);
    if (existingPhone) throw new Error('Phone number already registered');

    // 4. Create user in Supabase Auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: email.toLowerCase().trim(),
      password,
      email_confirm: false,
    });

    if (authError) throw new Error(authError.message);

    const userId = authData.user.id;

    // 5. Create Profile row with all fields
    await userRepository.createProfile(
      userId,
      email,
      fullName,
      phone,
      dateOfBirth,
      nidNumber
    );

    // 6. Create wallet
    await walletRepository.createWallet(userId);

    // 7. Generate and send OTP
    const otp = generateOtp();
    await otpRepository.create(email, otp, 'verification');
    await sendOtpEmail(email, otp, 'verification');

    return { message: 'Account created. Check your email for the OTP.' };
  }

  // ✅ UPDATED — now sets is_verified = true in your own Profiles table
  async verifyOtp(email, otp) {

    // 1. Find valid OTP
    const record = await otpRepository.findValid(email, otp, 'verification');
    if (!record) throw new Error('Invalid or expired OTP');

    // 2. Mark OTP as used
    await otpRepository.markUsed(record.id);

    // 3. Get the profile
    const profile = await userRepository.findByEmail(email);
    if (!profile) throw new Error('User not found');

    // 4. Mark verified in YOUR Profiles table
    await userRepository.markVerified(profile.id);

    // 5. Also confirm in Supabase Auth (keeps both in sync)
    await supabaseAdmin.auth.admin.updateUserById(profile.id, {
      email_confirm: true,
    });

    return { message: 'Email verified successfully. You can now login.' };
  }

  // ✅ UPDATED — now checks is_verified from your own Profiles table
  async login(email, password) {

    // 1. Verify password with Supabase Auth
    const { data, error } = await supabaseAdmin.auth.signInWithPassword({
      email: email.toLowerCase().trim(),
      password,
    });

    if (error) throw new Error('Invalid email or password');

    // 2. Get profile from YOUR table
    const profile = await userRepository.findById(data.user.id);
    if (!profile) throw new Error('Profile not found');

    // 3. Check is_verified from YOUR Profiles table (not Supabase internal)
    if (!profile.is_verified) {
      // Resend OTP so user isn't stuck
      const otp = generateOtp();
      await otpRepository.create(email, otp, 'verification');
      await sendOtpEmail(email, otp, 'verification');
      throw new Error('Email not verified. A new OTP has been sent to your email.');
    }

    // 4. Check if 2FA is enabled
    if (profile.two_fa_enabled) {
      const otp = generateOtp();
      await otpRepository.create(email, otp, '2fa');
      await sendOtpEmail(email, otp, '2fa');
      return { requires2FA: true, message: 'OTP sent to your email' };
    }

    // 5. Generate JWT
    const token = generateToken({ userId: profile.id, email: profile.email });

    return {
      token,
      user: {
        id: profile.id,
        email: profile.email,
        full_name: profile.full_name,
        phone: profile.phone,
        is_verified: profile.is_verified,
      },
    };
  }

  // no change needed below this line
  async verify2FA(email, otp) {
    const record = await otpRepository.findValid(email, otp, '2fa');
    if (!record) throw new Error('Invalid or expired OTP');

    await otpRepository.markUsed(record.id);

    const profile = await userRepository.findByEmail(email);
    const token = generateToken({ userId: profile.id, email: profile.email });

    return {
      token,
      user: {
        id: profile.id,
        email: profile.email,
        full_name: profile.full_name,
      },
    };
  }

  async forgotPassword(email) {
    const profile = await userRepository.findByEmail(email);

    if (profile) {
      const otp = generateOtp();
      await otpRepository.create(email, otp, 'reset');
      await sendOtpEmail(email, otp, 'reset');
    }

    return { message: 'If that email is registered, an OTP has been sent.' };
  }

  async resetPassword(email, otp, newPassword) {
    const record = await otpRepository.findValid(email, otp, 'reset');
    if (!record) throw new Error('Invalid or expired OTP');

    const profile = await userRepository.findByEmail(email);
    if (!profile) throw new Error('User not found');

    const { error } = await supabaseAdmin.auth.admin.updateUserById(profile.id, {
      password: newPassword,
    });
    if (error) throw new Error(error.message);

    await otpRepository.markUsed(record.id);

    return { message: 'Password reset successfully' };
  }
}

export default new AuthService();