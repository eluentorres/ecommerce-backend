import prisma from '../src/config/prismaClient.js'

const productos = [
  { id: 'cmv03w6p30000vpy8q4encte0', imageUrl: '/products/white-core-tee.png' },
  { id: 'cmv748lcs0000vpi0n9awp8rd', imageUrl: '/products/future-oversized.png' },
  { id: 'cmv748lha0001vpi0u6hyccyj', imageUrl: '/products/shadow-2040.png' },
  { id: 'cmv748ljz0002vpi000f0ly5x', imageUrl: '/products/wide-cargo-2040.png' },
  { id: 'cmv748lmo0003vpi0jlp0te80', imageUrl: '/products/architect-jacket.png' },
  { id: 'cmv748lpb0004vpi0a5wab5b2', imageUrl: '/products/void-cap.png' },
  { id: 'cmv748ls00005vpi0y3yilkah', imageUrl: '/products/zero-sweat.png' },
  { id: 'cmv748lup0006vpi0wrw3o3d0', imageUrl: '/products/future-runner.png' },
  { id: 'cmv748lxd0007vpi05x4ir07t', imageUrl: '/products/wide-denim.png' }
]

async function main() {
  console.log('Actualizando imagenes de NOVA 2040...')

  for (const producto of productos) {
    const actualizado = await prisma.product.update({
      where: { id: producto.id },
      data: { imageUrl: producto.imageUrl }
    })

    console.log('Imagen actualizada: ' + actualizado.name)
  }

  console.log('Las 9 imagenes estan conectadas.')
}

main()
  .catch((error) => {
    console.error('Error:', error)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
