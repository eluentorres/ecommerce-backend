import express from "express";
import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import routes from "./routes/index.routes.js";

const app = express();

// Cabeceras de seguridad
app.use(helmet());

// Permitir peticiones desde otros orÃƒÂ­genes
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  credentials: true
}));

// Limitar peticiones para evitar abusos
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  standardHeaders: "draft-7",
  legacyHeaders: false
}));

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  const safeMethods = ["GET", "HEAD", "OPTIONS"];

  if (safeMethods.includes(req.method)) {
    return next();
  }

  // Solo exigimos comprobar el origen cuando se envía la cookie de sesión.
  if (!req.cookies?.nova_token) {
    return next();
  }

  const allowedOrigin = process.env.FRONTEND_URL || "http://localhost:5173";
  const origin = req.get("Origin");

  if (origin !== allowedOrigin) {
    return res.status(403).json({
      ok: false,
      error: { message: "Origin not allowed" }
    });
  }

  next();
});
app.use(routes);

// Ruta no encontrada
app.use((req, res) => {
  res.status(404).json({
    ok: false,
    error: { message: "Route not found" }
  });
});

// Manejo centralizado de errores
app.use((error, req, res, next) => {
  console.error(error);

  res.status(error.status || 500).json({
    ok: false,
    error: {
      message: error.status
        ? error.message
        : "Internal server error"
    }
  });
});

export default app;
