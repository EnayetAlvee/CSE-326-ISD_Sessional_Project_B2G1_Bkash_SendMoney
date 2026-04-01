// account-service/services/auth_service.js
//
// Business logic for all authentication flows.
// Controllers call these methods — they never touch the DB, HTTP clients, or queues directly.
//
// ─── OTP Architecture ────────────────────────────────────────────────────────
//
//   SENDING  (fire & forget):
//     We call notificationClient.requestOtp(email, purpose) WITHOUT await.
//     The function dispatches an HTTP request to sms-service and returns void.
//     The user gets their response before the OTP is even generated.
//     sms-service handles: OTP generation → Redis TTL storage → SendGrid/Twilio delivery.
//
//   VERIFYING (awaited):
//     We call notificationClient.verifyOtp(email, otp) WITH await.
//     sms-service checks Redis, deletes the key on match (single-use), and returns
//     { valid: boolean, reason?: string }.
//     We must wait because the entire flow depends on the result.
//
// ─── Wallet Creation ─────────────────────────────────────────────────────────
//
//   On signup we call walletClient.createWallet(userId, phone) WITHOUT await.
//   wallet-transaction-service creates the wallet in the background.
//   The signup response is sent before the wallet exists — that is intentional.
//

import { supabaseAdmin }    from "../config/supabase.js";
import { generateToken }    from "../utils/jwt.js";
import * as notificationClient from "../utils/notification_client.js";
import { createWallet }     from "../utils/wallet_client.js";
import userRepository       from "../repositories/user_repository.js";

class AuthService {

  // ─── Signup ────────────────────────────────────────────────────────────────

  /**
   * Register a new user account.
   *
   * Flow:
   *   1. Validate that email + phone are not already taken (parallel DB checks)
   *   2. Create the user in Supabase Auth
   *   3. Create the Profile row in our own table
   *   4. Fire & forget → wallet-service creates the user's wallet
   *   5. Fire & forget → sms-service sends a verification OTP
   *   6. Return immediately
   *
   * @param {string} email
   * @param {string} password
   * @param {string} fullName
   * @param {string} phone
   * @param {string} dateOfBirth   ISO date string e.g. "1995-06-15"
   * @param {string} nidNumber
   * @returns {{ message: string }}
   */
  async signup(email, password, fullName, phone, dateOfBirth, nidNumber) {

    // ── 1. Check uniqueness in parallel ─────────────────────────────────────
    const [existingEmail, existingPhone] = await Promise.all([
      userRepository.findByEmail(email),
      userRepository.findByPhone(phone),
    ]);

    if (existingEmail) throw new Error("Email is already registered.");
    if (existingPhone) throw new Error("Phone number is already registered.");

    // ── 2. Create Supabase Auth user ─────────────────────────────────────────
    const { data: authData, error: authError } =
      await supabaseAdmin.auth.admin.createUser({
        email:         email.toLowerCase().trim(),
        password,
        email_confirm: false, // We handle verification ourselves via OTP
      });

    if (authError) throw new Error(authError.message);

    const userId = authData.user.id;

    // ── 3. Create Profile row ────────────────────────────────────────────────
    await userRepository.createProfile(
      userId,
      email,
      fullName,
      phone,
      dateOfBirth,
      nidNumber,
    );

    // ── 4. Create wallet (fire & forget) ─────────────────────────────────────
    // wallet-service handles this asynchronously — we do NOT await.
    // phone is sent so wallet-service can denormalize it without calling back.
    createWallet(userId, phone);

    // ── 5. Request OTP delivery (fire & forget) ──────────────────────────────
    // sms-service generates the OTP, stores it in Redis, and sends it via email/SMS.
    // We do NOT await — the user gets a response immediately.
    notificationClient.requestOtp(email, "verification");

    return {
      message: "Account created. Check your email for the verification OTP.",
    };
  }

  // ─── Verify OTP (account activation) ──────────────────────────────────────

  /**
   * Confirm a user's email address using the OTP they received.
   *
   * Calls sms-service to verify the OTP (awaited — we need the result).
   * On success: marks the account as verified and syncs with Supabase Auth.
   *
   * @param {string} email
   * @param {string} otp   The 6-digit code the user submitted
   * @returns {{ message: string }}
   */
  async verifyOtp(email, otp) {

    // ── 1. Verify OTP via sms-service (awaited) ──────────────────────────────
    // sms-service reads from Redis and deletes the key on a match.
    const result = await notificationClient.verifyOtp(email, otp);
    if (!result.valid) throw new Error(result.reason);

    // ── 2. Load profile ──────────────────────────────────────────────────────
    const profile = await userRepository.findByEmail(email);
    if (!profile) throw new Error("User not found.");

    // ── 3. Mark verified in our Profiles table ───────────────────────────────
    await userRepository.markVerified(profile.id);

    // ── 4. Sync with Supabase Auth ───────────────────────────────────────────
    // Keeps both systems consistent — Supabase Auth's own verified flag is
    // updated to match ours. Not strictly required but prevents confusion
    // if Supabase Auth is ever queried directly.
    await supabaseAdmin.auth.admin.updateUserById(profile.id, {
      email_confirm: true,
    });

    return { message: "Email verified successfully. You can now log in." };
  }

  // ─── Login ─────────────────────────────────────────────────────────────────

  /**
   * Authenticate a user with email + password.
   *
   * Cases:
   *   • Account not verified  → re-send OTP (fire & forget) and throw
   *   • 2FA enabled           → send OTP (fire & forget) and return { requires2FA: true }
   *   • Normal login          → return signed JWT immediately
   *
   * @param {string} email
   * @param {string} password
   * @returns {{ token: string, user: object } | { requires2FA: true, message: string }}
   */
  async login(email, password) {

    // ── 1. Verify credentials with Supabase Auth ─────────────────────────────
    const { data, error } = await supabaseAdmin.auth.signInWithPassword({
      email: email.toLowerCase().trim(),
      password,
    });

    if (error) throw new Error("Invalid email or password.");

    // ── 2. Load profile from our own table ───────────────────────────────────
    const profile = await userRepository.findById(data.user.id);
    if (!profile) throw new Error("Profile not found.");

    // ── 3. Guard — account must be verified ──────────────────────────────────
    if (!profile.is_verified) {
      // Re-send verification OTP so the user is not stuck (fire & forget)
      notificationClient.requestOtp(email, "verification");
      throw new Error(
        "Email not verified. A new OTP has been sent — please check your email.",
      );
    }

    // ── 4. 2FA path ───────────────────────────────────────────────────────────
    if (profile.two_fa_enabled) {
      // Send 2FA OTP (fire & forget) and tell the client to ask for it
      notificationClient.requestOtp(email, "2fa");
      return {
        requires2FA: true,
        message: "OTP sent to your email. Please verify to complete login.",
      };
    }

    // ── 5. Issue JWT ──────────────────────────────────────────────────────────
    const token = generateToken({ userId: profile.id, email: profile.email });

    return {
      token,
      user: {
        id:          profile.id,
        email:       profile.email,
        full_name:   profile.full_name,
        phone:       profile.phone,
        is_verified: profile.is_verified,
      },
    };
  }

  // ─── Verify 2FA ────────────────────────────────────────────────────────────

  /**
   * Confirm the 2FA OTP after a successful password login.
   * Issues a JWT on success.
   *
   * @param {string} email
   * @param {string} otp
   * @returns {{ token: string, user: object }}
   */
  async verify2FA(email, otp) {

    // ── 1. Verify OTP via sms-service (awaited) ──────────────────────────────
    const result = await notificationClient.verifyOtp(email, otp);
    if (!result.valid) throw new Error(result.reason);

    // ── 2. Load profile ──────────────────────────────────────────────────────
    const profile = await userRepository.findByEmail(email);
    if (!profile) throw new Error("User not found.");

    // ── 3. Issue JWT ──────────────────────────────────────────────────────────
    const token = generateToken({ userId: profile.id, email: profile.email });

    return {
      token,
      user: {
        id:        profile.id,
        email:     profile.email,
        full_name: profile.full_name,
        phone:     profile.phone,
      },
    };
  }

  // ─── Forgot Password ───────────────────────────────────────────────────────

  /**
   * Initiate a password reset — send an OTP to the user's email.
   *
   * Security: we always return the same message whether or not the email
   * exists. This prevents user-enumeration attacks.
   *
   * @param {string} email
   * @returns {{ message: string }}
   */
  async forgotPassword(email) {

    const profile = await userRepository.findByEmail(email);

    // Only publish if the account actually exists,
    // but always return the same generic response to the caller.
    if (profile) {
      notificationClient.requestOtp(email, "reset");
    }

    return {
      message: "If that email is registered, a password reset OTP has been sent.",
    };
  }

  // ─── Reset Password ────────────────────────────────────────────────────────

  /**
   * Verify the reset OTP and set a new password.
   *
   * @param {string} email
   * @param {string} otp
   * @param {string} newPassword
   * @returns {{ message: string }}
   */
  async resetPassword(email, otp, newPassword) {

    // ── 1. Verify OTP via sms-service (awaited) ──────────────────────────────
    const result = await notificationClient.verifyOtp(email, otp);
    if (!result.valid) throw new Error(result.reason);

    // ── 2. Load profile ──────────────────────────────────────────────────────
    const profile = await userRepository.findByEmail(email);
    if (!profile) throw new Error("User not found.");

    // ── 3. Update password in Supabase Auth ──────────────────────────────────
    const { error } = await supabaseAdmin.auth.admin.updateUserById(
      profile.id,
      { password: newPassword },
    );
    if (error) throw new Error(error.message);

    return { message: "Password reset successfully. You can now log in." };
  }

}

export default new AuthService();
