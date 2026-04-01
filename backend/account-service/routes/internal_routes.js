// account-service/routes/internal_routes.js
//
// Service-to-service endpoints — called by wallet-transaction-service only.
// These routes are NEVER exposed to the public internet.
//
// Protection:
//   • internalMiddleware checks the X-Internal-Secret header on every request
//   • The API Gateway (Nginx) must strip this header from all external requests
//
// Mounted at: /internal  (in app.js)
//
// Full endpoint list:
//   GET /internal/users/by-phone?phone=   — resolve a phone number to a user profile
//   GET /internal/priyo/check?userId=&targetId=  — check priyo status for charge calculation

import { Router }           from "express";
import internalMiddleware   from "../middleware/internal_middleware.js";
import userRepository       from "../repositories/user_repository.js";
import priyoRepository      from "../repositories/priyo_repository.js";

const router = Router();

// Apply internalMiddleware to every route in this file
router.use(internalMiddleware);

// ─── GET /internal/users/by-phone ────────────────────────────────────────────
//
// Resolves a phone number to a user's id and basic profile info.
//
// Called by wallet-transaction-service during send-money to get the
// recipient's userId from their phone number — wallet-service only
// receives a phone number from the client, not a userId directly.
//
// Query params:
//   phone  (required)  — the phone number to look up
//
// Response 200:
//   { id, full_name, phone }
//
// Response 404:
//   { message: "No user found with that phone number." }
//
router.get("/users/by-phone", async (req, res) => {
  try {
    const { phone } = req.query;

    if (!phone) {
      return res.status(400).json({ message: "phone query param is required." });
    }

    const user = await userRepository.findByPhone(phone);

    if (!user) {
      return res.status(404).json({ message: "No user found with that phone number." });
    }

    // Return only what wallet-service needs — do not leak sensitive fields
    res.status(200).json({
      id:        user.id,
      full_name: user.full_name,
      phone:     user.phone,
    });

  } catch (err) {
    console.error("[Internal] /users/by-phone error:", err.message);
    res.status(500).json({ message: "Internal server error." });
  }
});

// ─── GET /internal/priyo/check ───────────────────────────────────────────────
//
// Checks whether targetId is in userId's priyo (favourite contacts) list.
//
// Called by wallet-transaction-service during send-money charge calculation:
//   • If the recipient IS priyo → free up to 25,000 BDT/month, then 5 BDT charge
//   • If the recipient is NOT priyo → always 5 BDT charge
//
// wallet-service owns no priyo data — it queries here instead of
// accessing account-service's DB directly (no cross-service DB access).
//
// Query params:
//   userId    (required)  — the sender's user ID
//   targetId  (required)  — the recipient's user ID
//
// Response 200:
//   { isPriyo: true | false }
//
router.get("/priyo/check", async (req, res) => {
  try {
    const { userId, targetId } = req.query;

    if (!userId)   return res.status(400).json({ message: "userId query param is required." });
    if (!targetId) return res.status(400).json({ message: "targetId query param is required." });

    const isPriyo = await priyoRepository.isPriyo(userId, targetId);

    res.status(200).json({ isPriyo });

  } catch (err) {
    console.error("[Internal] /priyo/check error:", err.message);
    res.status(500).json({ message: "Internal server error." });
  }
});

export default router;
