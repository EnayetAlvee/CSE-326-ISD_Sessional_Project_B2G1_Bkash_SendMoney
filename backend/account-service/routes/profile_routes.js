// account-service/routes/profile_routes.js
//
// Maps profile HTTP endpoints to ProfileController methods.
// All routes here are PROTECTED — authMiddleware is applied to each.
//
// Mounted at: /api/profile  (in app.js)
//
// Full endpoint list:
//   GET   /api/profile         — return the authenticated user's profile
//   PATCH /api/profile/update  — update allowed profile fields

import { Router }        from "express";
import profileController from "../controllers/profile_controller.js";
import authMiddleware    from "../middleware/auth_middleware.js";

const router = Router();

// ─── Protected Profile Routes ─────────────────────────────────────────────────

router.get(  "/",       authMiddleware, (req, res) => profileController.getProfile(req, res));
router.patch("/update", authMiddleware, (req, res) => profileController.updateProfile(req, res));

export default router;
