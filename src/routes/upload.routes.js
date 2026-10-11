import { Router } from "express";
import multer from "multer";
import prisma from "../config/prismaClient.js";
import { requireAuth, requireAdmin } from "../middlewares/auth.middleware.js";
import { uploadImage } from "../services/cloudinary.service.js";

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter(req, file, callback) {
    const allowed = ["image/jpeg", "image/png", "image/webp"];

    if (!allowed.includes(file.mimetype)) {
      return callback(new Error("Solo se permiten imágenes JPG, PNG o WEBP"));
    }

    callback(null, true);
  }
});

router.post(
  "/:id/image",
  requireAuth,
  requireAdmin,
  upload.single("image"),
  async (req, res, next) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          ok: false,
          error: { message: "Debes enviar una imagen" }
        });
      }

      const product = await prisma.product.findUnique({
        where: { id: req.params.id }
      });

      if (!product) {
        return res.status(404).json({
          ok: false,
          error: { message: "Producto no encontrado" }
        });
      }

      const result = await uploadImage(req.file.buffer);

      const updatedProduct = await prisma.product.update({
        where: { id: product.id },
        data: { imageUrl: result.secure_url }
      });

      res.json({ ok: true, data: updatedProduct });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
