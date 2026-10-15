import { Router } from "express";
import prisma from "../config/prismaClient.js";
import { requireAuth } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(requireAuth);

// Consultar mis pedidos
router.get("/", async (req, res, next) => {
  try {
    const orders = await prisma.order.findMany({
      where: { userId: req.user.id },
      include: { items: true },
      orderBy: { createdAt: "desc" }
    });

    res.json({
      ok: true,
      data: orders
    });
  } catch (error) {
    next(error);
  }
});

// Checkout antiguo deshabilitado: requiere pago con Stripe.
router.post("/checkout", (req, res) => {
  res.status(410).json({
    ok: false,
    error: { message: "Utiliza Stripe para completar la compra" }
  });
});

export default router;
