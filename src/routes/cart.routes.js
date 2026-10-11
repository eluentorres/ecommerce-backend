import { Router } from "express";
import prisma from "../config/prismaClient.js";
import { requireAuth } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(requireAuth);

router.get("/", async (req, res, next) => {
  try {
    const cart = await prisma.cart.findUnique({
      where: { userId: req.user.id },
      include: { items: true }
    });

    res.json({ ok: true, data: cart ?? { items: [] } });
  } catch (error) {
    next(error);
  }
});

router.post("/items", async (req, res, next) => {
  try {
    const { productId, quantity } = req.body ?? {};

    if (
      typeof productId !== "string" ||
      !productId.trim() ||
      !Number.isInteger(quantity) ||
      quantity < 1
    ) {
      return res.status(400).json({
        ok: false,
        error: { message: "Invalid cart item" }
      });
    }

    const product = await prisma.product.findUnique({
      where: { id: productId }
    });

    if (!product) {
      return res.status(404).json({
        ok: false,
        error: { message: "Product not found" }
      });
    }

    const cart = await prisma.cart.upsert({
      where: { userId: req.user.id },
      update: {},
      create: { userId: req.user.id }
    });

    const existing = await prisma.cartItem.findUnique({
      where: {
        cartId_productId: { cartId: cart.id, productId }
      }
    });

    const newQuantity = (existing?.quantity ?? 0) + quantity;

    if (newQuantity > product.stock) {
      return res.status(400).json({
        ok: false,
        error: { message: "Insufficient stock" }
      });
    }

    await prisma.cartItem.upsert({
      where: {
        cartId_productId: { cartId: cart.id, productId }
      },
      update: { quantity: newQuantity },
      create: { cartId: cart.id, productId, quantity }
    });

    const updatedCart = await prisma.cart.findUnique({
      where: { id: cart.id },
      include: { items: true }
    });

    res.json({ ok: true, data: updatedCart });
  } catch (error) {
    next(error);
  }
});

router.delete("/items/:productId", async (req, res, next) => {
  try {
    const cart = await prisma.cart.findUnique({
      where: { userId: req.user.id }
    });

    if (cart) {
      await prisma.cartItem.deleteMany({
        where: {
          cartId: cart.id,
          productId: req.params.productId
        }
      });
    }

    res.json({
      ok: true,
      data: { message: "Product removed from cart" }
    });
  } catch (error) {
    next(error);
  }
});

export default router;
