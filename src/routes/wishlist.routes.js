import { Router } from "express";
import Wishlist from "../models/Wishlist.js";
import prisma from "../config/prismaClient.js";
import { requireAuth } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(requireAuth);

// Ver mis favoritos
router.get("/", async (req, res, next) => {
  try {
    const wishlist = await Wishlist.findOne({ userId: req.user.id });

    res.json({
      ok: true,
      data: wishlist?.productIds ?? []
    });
  } catch (error) {
    next(error);
  }
});

// Añadir un producto a favoritos
router.post("/:productId", async (req, res, next) => {
  try {
    const { productId } = req.params;

    const product = await prisma.product.findUnique({
      where: { id: productId }
    });

    if (!product) {
      return res.status(404).json({
        ok: false,
        error: { message: "Product not found" }
      });
    }

    const wishlist = await Wishlist.findOneAndUpdate(
      { userId: req.user.id },
      { $addToSet: { productIds: productId } },
      { upsert: true, new: true, runValidators: true }
    );

    res.json({ ok: true, data: wishlist.productIds });
  } catch (error) {
    next(error);
  }
});

// Eliminar un producto de favoritos
router.delete("/:productId", async (req, res, next) => {
  try {
    const wishlist = await Wishlist.findOneAndUpdate(
      { userId: req.user.id },
      { $pull: { productIds: req.params.productId } },
      { new: true }
    );

    res.json({
      ok: true,
      data: wishlist?.productIds ?? []
    });
  } catch (error) {
    next(error);
  }
});

export default router;
