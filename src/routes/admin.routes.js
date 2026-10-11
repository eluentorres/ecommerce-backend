import { Router } from "express";
import AdminLog from "../models/AdminLog.js";
import { requireAuth, requireAdmin } from "../middlewares/auth.middleware.js";

const router = Router();

router.get("/logs", requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const logs = await AdminLog.find()
      .sort({ createdAt: -1 })
      .limit(100);

    res.json({ ok: true, data: logs });
  } catch (error) {
    next(error);
  }
});

export default router;
