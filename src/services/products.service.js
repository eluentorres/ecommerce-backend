import prisma from "../config/prismaClient.js";

export async function getAllProducts() {
  return await prisma.product.findMany({
    orderBy: { createdAt: "desc" }
  });
}

export async function getProductById(id) {
  return await prisma.product.findUnique({
    where: { id }
  });
}

export async function createProduct(data) {
  return await prisma.product.create({
    data: {
      name: data.name,
      price: data.price,
      description: data.description ?? null,
      stock: data.stock ?? 0,
      imageUrl: data.imageUrl ?? null
    }
  });
}

export async function updateProduct(id, data) {
  const existing = await getProductById(id);
  if (!existing) return null;

  return await prisma.product.update({
    where: { id },
    data: {
      ...(data.name !== undefined && { name: data.name }),
      ...(data.price !== undefined && { price: data.price }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.stock !== undefined && { stock: data.stock }),
      ...(data.imageUrl !== undefined && { imageUrl: data.imageUrl })
    }
  });
}

export async function deleteProduct(id) {
  const existing = await getProductById(id);
  if (!existing) return null;

  return await prisma.product.delete({
    where: { id }
  });
}
