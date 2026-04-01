// account-service/routes/priyo_routes.js
//
// Maps priyo (favourite contacts) HTTP endpoints to PriyoController methods.
// All routes here are PROTECTED — authMiddleware is applied to each.
//
// Mounted at: /api/priyo  (in app.js)
//
// Full endpoint list:
//   GET    /api/priyo               — list all priyo contacts
//   POST   /api/priyo/add           — add a new priyo contact by phone
//   DELETE /api/priyo/remove        — remove a priyo contact by phone
//   PATCH  /api/priyo/update-label  — update or clear a contact's label

import { Router }       from "express";
import priyoController  from "../controllers/priyo_controller.js";
import authMiddleware   from "../middleware/auth_middleware.js";

const router = Router();

// ─── Protected Priyo Routes ───────────────────────────────────────────────────

router.get(    "/",             authMiddleware, (req, res) => priyoController.list(req, res));
router.post(   "/add",          authMiddleware, (req, res) => priyoController.add(req, res));
router.delete( "/remove",       authMiddleware, (req, res) => priyoController.remove(req, res));
router.patch(  "/update-label", authMiddleware, (req, res) => priyoController.updateLabel(req, res));

export default router;
