import jwt from "jsonwebtoken";
import prisma from "../config/prismaClient.js";

export async function requireAuth(req, res, next) {
  try {
    const authorization = req.headers.authorization;

    const bearerToken = authorization?.startsWith("Bearer ")
      ? authorization.slice(7)
      : null;

    const token = req.cookies?.nova_token || bearerToken;

    if (!token) {
      return res.status(401).json({
        ok: false,
        error: { message: "Authentication required" }
      });
    }

    const payload = jwt.verify(token, process.env.JWT_SECRET);

    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      select: {
        id: true,
        name: true,
        email: true,
        role: true
      }
    });

    if (!user) {
      return res.status(401).json({
        ok: false,
        error: { message: "Invalid user" }
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      ok: false,
      error: { message: "Invalid or expired token" }
    });
  }
}

export function requireAdmin(req, res, next) {
  if (req.user?.role !== "ADMIN") {
    return res.status(403).json({
      ok: false,
      error: { message: "Admin access required" }
    });
  }

  next();
}
