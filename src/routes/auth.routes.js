import { Router } from "express";
import * as authController from "../controllers/auth.controller.js";
import { requireAuth } from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/register", authController.register);
router.post("/login", authController.login);

router.get("/me", requireAuth, (req, res) => {
  res.json({
    ok: true,
    data: req.user
  });
});

export default router;
