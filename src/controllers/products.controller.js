import * as productsService from "../services/products.service.js";
import { registerAdminAction } from "../services/adminLog.service.js";

function validateProduct(body, partial = false) {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return false;
  }

  if (!partial || body.name !== undefined) {
    if (typeof body.name !== "string" || !body.name.trim()) {
      return false;
    }
  }

  if (!partial || body.price !== undefined) {
    if (
      typeof body.price !== "number" ||
      !Number.isFinite(body.price) ||
      body.price < 0
    ) {
      return false;
    }
  }

  if (
    body.stock !== undefined &&
    (!Number.isInteger(body.stock) || body.stock < 0)
  ) {
    return false;
  }

  if (
    body.description !== undefined &&
    body.description !== null &&
    typeof body.description !== "string"
  ) {
    return false;
  }

  if (
    body.imageUrl !== undefined &&
    body.imageUrl !== null &&
    typeof body.imageUrl !== "string"
  ) {
    return false;
  }

  return true;
}

export async function getAllProducts(req, res, next) {
  try {
    const products = await productsService.getAllProducts();
    res.json({ ok: true, data: products });
  } catch (error) {
    next(error);
  }
}

export async function getProductById(req, res, next) {
  try {
    const product = await productsService.getProductById(req.params.id);

    if (!product) {
      return res.status(404).json({
        ok: false,
        error: { message: "Product not found" }
      });
    }

    res.json({ ok: true, data: product });
  } catch (error) {
    next(error);
  }
}

export async function createProduct(req, res, next) {
  try {
    if (!validateProduct(req.body)) {
      return res.status(400).json({
        ok: false,
        error: { message: "Invalid product data" }
      });
    }

    const product = await productsService.createProduct(req.body);

    await registerAdminAction({
      adminId: req.user.id,
      action: "CREATE_PRODUCT",
      targetId: product.id,
      details: { name: product.name }
    });

    res.status(201).json({ ok: true, data: product });
  } catch (error) {
    next(error);
  }
}

export async function updateProduct(req, res, next) {
  try {
    if (!validateProduct(req.body, true)) {
      return res.status(400).json({
        ok: false,
        error: { message: "Invalid product data" }
      });
    }

    const product = await productsService.updateProduct(
      req.params.id,
      req.body
    );

    if (!product) {
      return res.status(404).json({
        ok: false,
        error: { message: "Product not found" }
      });
    }

    await registerAdminAction({
      adminId: req.user.id,
      action: "UPDATE_PRODUCT",
      targetId: product.id,
      details: { name: product.name }
    });

    res.json({ ok: true, data: product });
  } catch (error) {
    next(error);
  }
}

export async function deleteProduct(req, res, next) {
  try {
    const product = await productsService.deleteProduct(req.params.id);

    if (!product) {
      return res.status(404).json({
        ok: false,
        error: { message: "Product not found" }
      });
    }

    await registerAdminAction({
      adminId: req.user.id,
      action: "DELETE_PRODUCT",
      targetId: product.id,
      details: { name: product.name }
    });

    res.json({ ok: true, data: product });
  } catch (error) {
    next(error);
  }
}
