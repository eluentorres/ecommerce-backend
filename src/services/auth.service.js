import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "../config/prismaClient.js";

function publicUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role
  };
}

export async function register({ name, email, password }) {
  const normalizedEmail = email.trim().toLowerCase();

  const existing = await prisma.user.findUnique({
    where: { email: normalizedEmail }
  });

  if (existing) {
    const error = new Error("Email already registered");
    error.status = 409;
    throw error;
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  const user = await prisma.user.create({
    data: {
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword
    }
  });

  return publicUser(user);
}

export async function login({ email, password }) {
  const user = await prisma.user.findUnique({
    where: { email: email.trim().toLowerCase() }
  });

  const validPassword = user
    ? await bcrypt.compare(password, user.password)
    : false;

  if (!validPassword) {
    const error = new Error("Invalid credentials");
    error.status = 401;
    throw error;
  }

  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not configured");
  }

  const token = jwt.sign(
    { sub: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );

  return {
    token,
    user: publicUser(user)
  };
}
