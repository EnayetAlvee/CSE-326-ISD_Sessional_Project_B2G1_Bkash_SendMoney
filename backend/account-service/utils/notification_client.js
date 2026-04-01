// account-service/utils/notification_client.js
//
// HTTP client wrapper for communicating with sms-service.
//
// account-service has NO knowledge of Redis, RabbitMQ, SendGrid, or Twilio.
// It only knows: "there is an sms-service at SMS_SERVICE_URL that handles OTPs".
//
// Two call patterns used here:
//
//   FIRE & FORGET  — requestOtp()
//     Called during signup, login (2FA), forgot-password.
//     We send the request and move on immediately.
//     The user gets a response before the OTP is even generated.
//     If sms-service is down, we log the error — we do NOT fail the user's request.
//
//   AWAITED        — verifyOtp()
//     Called during verify-otp, verify-2fa, reset-password.
//     We MUST wait for the result because the entire flow depends on it.
//     If sms-service is down here, we throw and return a 500 to the user.

import axios from "axios";
import config from "../config/index.js";

// ─── Axios instance scoped to sms-service ────────────────────────────────────
// All calls from this file go to sms-service — base URL is set once here.
const smsClient = axios.create({
  baseURL: config.smsServiceUrl,
  timeout: 5000, // 5 s — sms-service should respond fast (it only writes to Redis)
  headers: {
    "Content-Type": "application/json",
  },
});

// ─── requestOtp  (fire & forget) ─────────────────────────────────────────────

/**
 * Ask sms-service to generate and deliver an OTP to the given email.
 *
 * This function is INTENTIONALLY not async from the caller's perspective.
 * Call it WITHOUT await — it dispatches the HTTP request and returns void.
 * The actual OTP generation + Redis storage + email/SMS delivery happens
 * inside sms-service asynchronously.
 *
 * Failures are logged but never propagate — a broken sms-service must not
 * crash an auth request. The user can request a new OTP if they don't receive it.
 *
 * @param {string} email
 * @param {"verification"|"2fa"|"reset"} purpose
 */
export const requestOtp = (email, purpose) => {
  smsClient
    .post("/api/otp/request", { email, purpose })
    .catch((err) => {
      // Log the failure but swallow it — caller already returned to the user
      console.error(
        `[NotificationClient] OTP request failed — email: ${email}, purpose: ${purpose}, error: ${err.message}`,
      );
    });
  // No return value. No await. Caller continues immediately.
};

// ─── verifyOtp  (awaited) ─────────────────────────────────────────────────────

/**
 * Ask sms-service to verify an OTP the user submitted.
 *
 * This MUST be awaited — the caller needs to know if the OTP is valid
 * before it can proceed (mark account verified, issue JWT, reset password, etc.).
 *
 * sms-service checks the value in Redis and deletes it on a match (single-use).
 *
 * @param {string} email
 * @param {string} otp   The 6-digit code the user submitted
 * @returns {Promise<{ valid: boolean, reason?: string }>}
 * @throws  If sms-service is unreachable or returns an unexpected error
 */
export const verifyOtp = async (email, otp) => {
  try {
    const { data } = await smsClient.post("/api/otp/verify", { email, otp });
    // sms-service always returns { valid: boolean, reason?: string }
    return data;
  } catch (err) {
    // Distinguish between a clean "invalid OTP" response (4xx) and a real error
    if (err.response) {
      // sms-service responded with an error status — treat as invalid OTP
      return {
        valid: false,
        reason: err.response.data?.message || "OTP verification failed.",
      };
    }
    // Network error / timeout — sms-service is unreachable
    console.error(`[NotificationClient] verifyOtp network error: ${err.message}`);
    throw new Error("Verification service is temporarily unavailable. Please try again.");
  }
};
