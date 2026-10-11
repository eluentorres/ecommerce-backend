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

    res.json({ ok: true, data: orders });
  } catch (error) {
    next(error);
  }
});

// Finalizar compra
router.post("/checkout", async (req, res, next) => {
  try {
    const result = await prisma.$transaction(async (tx) => {
      const cart = await tx.cart.findUnique({
        where: { userId: req.user.id },
        include: { items: true }
      });

      if (!cart || cart.items.length === 0) {
        return { error: "Cart is empty", status: 400 };
      }

      const orderItems = [];
      let total = 0;

      for (const item of cart.items) {
        const product = await tx.product.findUnique({
          where: { id: item.productId }
        });

        if (!product) {
          return { error: "Product not found", status: 404 };
        }

        const updated = await tx.product.updateMany({
          where: {
            id: item.productId,
            stock: { gte: item.quantity }
          },
          data: {
            stock: { decrement: item.quantity }
          }
        });

        if (updated.count !== 1) {
          return { error: "Insufficient stock", status: 400 };
        }

        orderItems.push({
          productId: product.id,
          quantity: item.quantity,
          price: product.price
        });

        total += product.price * item.quantity;
      }

      const order = await tx.order.create({
        data: {
          userId: req.user.id,
          total: Math.round(total * 100) / 100,
          status: "CONFIRMED",
          items: { create: orderItems }
        },
        include: { items: true }
      });

      await tx.cartItem.deleteMany({
        where: { cartId: cart.id }
      });

      return { order };
    });

    if (result.error) {
      return res.status(result.status).json({
        ok: false,
        error: { message: result.error }
      });
    }

    res.status(201).json({ ok: true, data: result.order });
  } catch (error) {
    next(error);
  }
});

export default router;
