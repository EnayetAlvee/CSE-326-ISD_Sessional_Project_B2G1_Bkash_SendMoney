// server/utils/otp.js

/*
  WHAT THIS FILE DOES:
  Generates a random 6-digit OTP number.
  We store OTPs in Supabase (no Redis needed).
*/

// Generates a random 6-digit OTP
export const generateOtp = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};