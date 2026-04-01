// account-service/utils/wallet_client.js
//
// HTTP client wrapper for communicating with wallet-transaction-service.
//
// account-service calls wallet-service in exactly ONE place:
//   During signup → create the user's wallet (fire & forget).
//
// We do NOT await this call — the user gets their signup response immediately.
// wallet-service creates the wallet in the background.
// If wallet-service is down, the error is logged. The message will be retried
// when wallet-service comes back up (handled at the infrastructure level).
//
// The X-Internal-Secret header is attached to every request so wallet-service
// knows this is a trusted service-to-service call, not a public request.

import axios from "axios";
import config from "../config/index.js";

// ─── Axios instance scoped to wallet-transaction-service ─────────────────────
const walletClient = axios.create({
  baseURL: config.walletServiceUrl,
  timeout: 5000,
  headers: {
    "Content-Type":    "application/json",
    "x-internal-secret": config.internalSecret, // verified by internal_middleware in wallet-service
  },
});

// ─── createWallet  (fire & forget) ───────────────────────────────────────────

/**
 * Ask wallet-service to create a new wallet for a freshly registered user.
 *
 * Call this WITHOUT await immediately after creating the user's profile.
 * The user's signup response is sent before the wallet is created —
 * that is intentional and acceptable.
 *
 * Failures are logged and swallowed — a wallet creation failure must not
 * cause the signup endpoint to return an error to the user.
 * wallet-service is responsible for idempotent wallet creation.
 *
 * @param {string} userId  UUID from Supabase Auth (shared primary key)
 * @param {string} phone   Denormalized so wallet-service doesn't need to call back
 */
export const createWallet = (userId, phone) => {
  walletClient
    .post("/internal/wallets/create", { userId, phone })
    .catch((err) => {
      console.error(
        `[WalletClient] Wallet creation failed — userId: ${userId}, error: ${err.message}`,
      );
    });
  // No return value. No await. Caller continues immediately.
};
