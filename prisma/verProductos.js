import prisma from '../src/config/prismaClient.js'

async function main() {
  const productos = await prisma.product.findMany({
    select: {
      id: true,
      name: true,
      imageUrl: true
    }
  })

  console.log(JSON.stringify(productos, null, 2))
}

main()
  .catch((error) => {
    console.error('Error al consultar los productos:', error)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })