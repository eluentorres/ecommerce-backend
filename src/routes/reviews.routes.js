import { Router } from "express";
import Review from "../models/Review.js";
import prisma from "../config/prismaClient.js";
import { requireAuth } from "../middlewares/auth.middleware.js";

const router = Router();

// Consultar reseñas de un producto
router.get("/products/:productId/reviews", async (req, res, next) => {
  try {
    const product = await prisma.product.findUnique({
      where: { id: req.params.productId }
    });

    if (!product) {
      return res.status(404).json({
        ok: false,
        error: { message: "Product not found" }
      });
    }

    const reviews = await Review.find({
      productId: req.params.productId
    }).sort({ createdAt: -1 });

    res.json({ ok: true, data: reviews });
  } catch (error) {
    next(error);
  }
});

// Crear una reseña con usuario autenticado
router.post("/products/:productId/reviews", requireAuth, async (req, res, next) => {
  try {
    const { rating, comment } = req.body ?? {};

    if (
      !Number.isInteger(rating) ||
      rating < 1 ||
      rating > 5 ||
      (comment !== undefined &&
        (typeof comment !== "string" || comment.length > 1000))
    ) {
      return res.status(400).json({
        ok: false,
        error: { message: "Invalid review data" }
      });
    }

    const product = await prisma.product.findUnique({
      where: { id: req.params.productId }
    });

    if (!product) {
      return res.status(404).json({
        ok: false,
        error: { message: "Product not found" }
      });
    }

    const existing = await Review.findOne({
      productId: req.params.productId,
      userId: req.user.id
    });

    if (existing) {
      return res.status(409).json({
        ok: false,
        error: { message: "You already reviewed this product" }
      });
    }

    const review = await Review.create({
      productId: req.params.productId,
      userId: req.user.id,
      rating,
      comment
    });

    res.status(201).json({ ok: true, data: review });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        ok: false,
        error: { message: "You already reviewed this product" }
      });
    }
    next(error);
  }
});

export default router;
