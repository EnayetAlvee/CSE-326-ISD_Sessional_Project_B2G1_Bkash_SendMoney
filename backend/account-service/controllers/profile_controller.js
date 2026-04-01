// account-service/controllers/profile_controller.js
//
// Thin HTTP layer for profile endpoints.
//
// Responsibilities (only these three):
//   1. Read and validate input from req.body / req.user
//   2. Call the appropriate repository or service method
//   3. Send the HTTP response
//
// req.user is populated by authMiddleware before these handlers run.
// Phone number is intentionally excluded from updates — it cannot be
// changed after registration.

import userRepository from "../repositories/user_repository.js";

class ProfileController {

  // ─── GET /api/profile ─────────────────────────────────────────────────────
  //
  // Returns the authenticated user's full profile.
  // No extra DB call needed — authMiddleware already hydrated req.user.
  async getProfile(req, res) {
    try {
      res.status(200).json({ user: req.user });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }

  // ─── PATCH /api/profile/update ────────────────────────────────────────────
  //
  // Partially update allowed profile fields.
  // Only fields present in the request body are updated — others are untouched.
  // Checking for undefined (not just falsy) so callers can explicitly clear a
  // field by sending null.
  async updateProfile(req, res) {
    try {
      const { full_name, date_of_birth, nid_number, picture_url } = req.body;

      // ── Build update payload from only the fields actually sent ─────────────
      const updates = {};
      if (full_name     !== undefined) updates.full_name     = full_name;
      if (date_of_birth !== undefined) updates.date_of_birth = date_of_birth;
      if (nid_number    !== undefined) updates.nid_number    = nid_number;
      if (picture_url   !== undefined) updates.picture_url   = picture_url;

      if (Object.keys(updates).length === 0) {
        return res.status(400).json({
          message:
            "No valid fields provided. " +
            "Updatable fields: full_name, date_of_birth, nid_number, picture_url.",
        });
      }

      const updated = await userRepository.updateProfile(req.user.id, updates);

      res.status(200).json({
        message: "Profile updated successfully.",
        user:    updated,
      });

    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  }

}

export default new ProfileController();
