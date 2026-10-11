import { Router } from "express";
import * as controller from "../controllers/products.controller.js";
import {
  requireAuth,
  requireAdmin
} from "../middlewares/auth.middleware.js";

const router = Router();

// Rutas públicas
router.get("/", controller.getAllProducts);
router.get("/:id", controller.getProductById);

// Rutas exclusivas para administradores
router.post("/", requireAuth, requireAdmin, controller.createProduct);
router.put("/:id", requireAuth, requireAdmin, controller.updateProduct);
router.delete("/:id", requireAuth, requireAdmin, controller.deleteProduct);

export default router;
