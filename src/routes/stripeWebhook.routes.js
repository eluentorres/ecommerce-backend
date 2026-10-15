import express from "express";
import { Router } from "express";
import Stripe from "stripe";
import prisma from "../config/prismaClient.js";

const router = Router();

router.post("/webhook", express.raw({ type: "application/json" }), async (req, res) => {
  if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_WEBHOOK_SECRET) {
    return res.status(503).send("Stripe no configurado");
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      req.headers["stripe-signature"],
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch {
    return res.status(400).send("Firma de Stripe inválida");
  }

  if (event.type !== "checkout.session.completed" &&
      event.type !== "checkout.session.async_payment_succeeded") {
    return res.json({ received: true });
  }

  const session = event.data.object;
  if (session.payment_status !== "paid") {
    return res.json({ received: true });
  }

  try {
    const existing = await prisma.order.findUnique({
      where: { stripeSessionId: session.id }
    });

    if (existing) return res.json({ received: true });

    const userId = session.client_reference_id;
    if (!userId) return res.status(400).send("Usuario no identificado");

    const lineItems = await stripe.checkout.sessions.listLineItems(session.id, {
      expand: ["data.price.product"],
      limit: 100
    });

    if (!lineItems.data.length || lineItems.has_more) {
      throw new Error("Artículos del pago incompletos");
    }

    const paidItems = [];
    let totalCents = 0;

    for (const item of lineItems.data) {
      const productId = item.price?.product?.metadata?.productId;
      const quantity = item.quantity;
      const unitAmount = item.price?.unit_amount;

      if (!productId || !Number.isInteger(quantity) || quantity < 1 ||
          !Number.isInteger(unitAmount) || unitAmount < 0 ||
          item.price?.currency !== "eur") {
        throw new Error("Artículo de Stripe inválido");
      }

      paidItems.push({ productId, quantity, unitAmount });
      totalCents += unitAmount * quantity;
    }

    if (totalCents !== session.amount_total || session.currency !== "eur") {
      throw new Error("El importe pagado no coincide");
    }

    await prisma.$transaction(async (tx) => {
      const duplicate = await tx.order.findUnique({
        where: { stripeSessionId: session.id }
      });

      if (duplicate) return;

      const orderItems = [];

      for (const item of paidItems) {
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
          throw new Error("Stock insuficiente para un pago realizado");
        }

        orderItems.push({
          productId: item.productId,
          quantity: item.quantity,
          price: item.unitAmount / 100
        });
      }

      await tx.order.create({
        data: {
          userId,
          stripeSessionId: session.id,
          total: totalCents / 100,
          status: "CONFIRMED",
          items: { create: orderItems }
        }
      });

      // Eliminar únicamente los artículos pagados del carrito.
      const cart = await tx.cart.findUnique({ where: { userId } });

      if (cart) {
        for (const item of paidItems) {
          const current = await tx.cartItem.findUnique({
            where: {
              cartId_productId: {
                cartId: cart.id,
                productId: item.productId
              }
            }
          });

          if (!current) continue;

          if (current.quantity <= item.quantity) {
            await tx.cartItem.delete({ where: { id: current.id } });
          } else {
            await tx.cartItem.update({
              where: { id: current.id },
              data: { quantity: { decrement: item.quantity } }
            });
          }
        }
      }
    }, { isolationLevel: "Serializable" });

    return res.json({ received: true });
  } catch (error) {
    if (error.code === "P2002") {
      const existing = await prisma.order.findUnique({
        where: { stripeSessionId: session.id }
      });

      if (existing) return res.json({ received: true });
    }

    if (error.message === "Stock insuficiente para un pago realizado") {
      console.error("Pago recibido sin stock suficiente:", session.id);

      try {
        const refunds = await stripe.refunds.list({
          payment_intent: session.payment_intent,
          limit: 10
        });

        if (refunds.data.length === 0) {
          await stripe.refunds.create(
            { payment_intent: session.payment_intent },
            { idempotencyKey: `stock-refund-${session.id}` }
          );
        }

        return res.json({ received: true, refunded: true });
      } catch (refundError) {
        console.error("Error al reembolsar:", refundError);
        return res.status(500).json({ received: false });
      }
    }

    console.error("Stripe webhook:", error);
    return res.status(500).json({ received: false });
  }
});

export default router;
