import { jest, describe, test, expect } from "@jest/globals";

jest.unstable_mockModule("../src/config/prismaClient.js", () => ({
  default: {
    product: {},
    user: {},
    cart: {},
    cartItem: {},
    order: {}
  }
}));

jest.unstable_mockModule("../src/models/Review.js", () => ({
  default: {}
}));

jest.unstable_mockModule("../src/models/Wishlist.js", () => ({
  default: {}
}));

jest.unstable_mockModule("../src/models/AdminLog.js", () => ({
  default: {}
}));

const { default: request } = await import("supertest");
const { default: app } = await import("../src/app.js");

describe("API - Pruebas básicas", () => {
  test("GET /health devuelve 200", async () => {
    const response = await request(app).get("/health");

    expect(response.status).toBe(200);
    expect(response.body.ok).toBe(true);
  });

  test("GET /api/cart sin token devuelve 401", async () => {
    const response = await request(app).get("/api/cart");

    expect(response.status).toBe(401);
    expect(response.body.ok).toBe(false);
  });

  test("Una ruta inexistente devuelve 404", async () => {
    const response = await request(app).get("/ruta-inexistente");

    expect(response.status).toBe(404);
    expect(response.body.ok).toBe(false);
  });
});
