import { Router } from "express";
import Stripe from "stripe";
import prisma from "../config/prismaClient.js";
import { requireAuth } from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/create-checkout-session", requireAuth, async (req, res, next) => {
  try {
    if (!process.env.STRIPE_SECRET_KEY) {
      return res.status(503).json({
        ok: false,
        error: { message: "Stripe no configurado" }
      });
    }

    const cart = await prisma.cart.findUnique({
      where: { userId: req.user.id },
      include: { items: true }
    });

    if (!cart?.items.length) {
      return res.status(400).json({
        ok: false,
        error: { message: "El carrito está vacío" }
      });
    }

    const lineItems = [];

    for (const item of cart.items) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId }
      });

      if (!product || product.stock < item.quantity) {
        return res.status(400).json({
          ok: false,
          error: { message: "Producto agotado o no disponible" }
        });
      }

      lineItems.push({
        price_data: {
          currency: "eur",
          product_data: { name: product.name, metadata: { productId: product.id } },
          unit_amount: Math.round(product.price * 100)
        },
        quantity: item.quantity
      });
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const frontend = process.env.FRONTEND_URL;

    if (!frontend) {
      return res.status(503).json({
        ok: false,
        error: { message: "FRONTEND_URL no configurada" }
      });
    }

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: lineItems,
      client_reference_id: req.user.id,
      customer_email: req.user.email,
      success_url: `${frontend}/cart?payment=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${frontend}/cart?payment=cancelled`,
      metadata: { userId: req.user.id }
    });

    res.json({
      ok: true,
      data: { url: session.url }
    });
  } catch (error) {
    next(error);
  }
});

export default router;
