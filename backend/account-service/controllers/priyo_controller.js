// account-service/controllers/priyo_controller.js
//
// Thin HTTP layer for priyo (favourite contacts) endpoints.
//
// Responsibilities (only these three):
//   1. Read and validate input from req.body / req.user
//   2. Call the appropriate priyo_service method
//   3. Send the HTTP response
//
// req.user is populated by authMiddleware before these handlers run.

import priyoService from "../services/priyo_service.js";

class PriyoController {

  // ─── GET /api/priyo ───────────────────────────────────────────────────────
  //
  // Returns all priyo contacts for the authenticated user,
  // with each contact's profile data (name, phone, email) joined in.
  async list(req, res) {
    try {
      const result = await priyoService.list(req.user.id);
      res.status(200).json(result);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  }

  // ─── POST /api/priyo/add ──────────────────────────────────────────────────
  //
  // Add a new priyo contact by phone number.
  // Body: { phone: string, label?: string | null }
  async add(req, res) {
    try {
      const { phone, label } = req.body;

      if (!phone) {
        return res.status(400).json({ message: "Phone number is required." });
      }

      const result = await priyoService.add(
        req.user.id,
        phone,
        label !== undefined ? label : null,
      );
      res.status(201).json(result);

    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  }

  // ─── DELETE /api/priyo/remove ─────────────────────────────────────────────
  //
  // Remove a priyo contact by phone number.
  // Body: { phone: string }
  async remove(req, res) {
    try {
      const { phone } = req.body;

      if (!phone) {
        return res.status(400).json({ message: "Phone number is required." });
      }

      const result = await priyoService.remove(req.user.id, phone);
      res.status(200).json(result);

    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  }

  // ─── PATCH /api/priyo/update-label ────────────────────────────────────────
  //
  // Update (or clear) the nickname label for an existing priyo contact.
  // Body: { phone: string, label: string | null }
  //   Send null as label to clear it.
  async updateLabel(req, res) {
    try {
      const { phone, label } = req.body;

      if (!phone) {
        return res.status(400).json({ message: "Phone number is required." });
      }
      if (label === undefined) {
        return res.status(400).json({
          message: "Label is required. Send null to clear the existing label.",
        });
      }

      const result = await priyoService.updateLabel(req.user.id, phone, label);
      res.status(200).json(result);

    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  }

}

export default new PriyoController();
