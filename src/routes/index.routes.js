import { Router } from "express";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "../config/swagger.js";

import productsRoutes from "./products.routes.js";
import authRoutes from "./auth.routes.js";
import reviewsRoutes from "./reviews.routes.js";
import wishlistRoutes from "./wishlist.routes.js";
import adminRoutes from "./admin.routes.js";
import cartRoutes from "./cart.routes.js";
import ordersRoutes from "./orders.routes.js";
import stripeRoutes from "./stripe.routes.js";
import uploadRoutes from "./upload.routes.js";

const router = Router();

router.get("/health", (req, res) => {
  res.json({ ok: true, data: { status: "up" } });
});

router.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

router.use("/api/products", uploadRoutes);
router.use("/api/products", productsRoutes);

router.use("/api/auth", authRoutes);

// Compatibilidad con el frontend React
// Reutiliza las rutas existentes sin duplicar su lógica.
router.use("/api/me", (req, res, next) => {
  req.url = "/me";
  authRoutes(req, res, next);
});

router.use("/api/cart/checkout", (req, res, next) => {
  req.url = "/checkout";
  ordersRoutes(req, res, next);
});

router.use("/api", reviewsRoutes);
router.use("/api/wishlist", wishlistRoutes);
router.use("/api/admin", adminRoutes);
router.use("/api/cart", cartRoutes);
router.use("/api/orders", ordersRoutes);
router.use("/api/stripe", stripeRoutes);

export default router;
