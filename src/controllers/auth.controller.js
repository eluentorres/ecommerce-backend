import * as authService from "../services/auth.service.js";

export async function register(req, res, next) {
  try {
    const { name, email, password } = req.body ?? {};

    if (
      typeof name !== "string" ||
      !name.trim() ||
      typeof email !== "string" ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) ||
      typeof password !== "string" ||
      password.length < 8
    ) {
      return res.status(400).json({
        ok: false,
        error: {
          message: "Name, valid email and password of at least 8 characters are required"
        }
      });
    }

    const user = await authService.register({ name, email, password });

    res.status(201).json({
      ok: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
}

export async function login(req, res, next) {
  try {
    const { email, password } = req.body ?? {};

    if (
      typeof email !== "string" ||
      !email.trim() ||
      typeof password !== "string" ||
      !password
    ) {
      return res.status(400).json({
        ok: false,
        error: { message: "Email and password are required" }
      });
    }

    const result = await authService.login({ email, password });

    res.json({
      ok: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
}
