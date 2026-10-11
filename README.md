# Ecommerce Backend

API REST de comercio electrónico desarrollada con Node.js y Express, preparada para conectarse a un frontend React.

## Tecnologías

- Node.js y Express
- PostgreSQL con Supabase y Prisma
- MongoDB Atlas y Mongoose
- Autenticación JWT
- Cloudinary para imágenes
- Swagger para documentación
- Jest y Supertest para pruebas
- Render para despliegue

## Funcionalidades

- Registro e inicio de sesión de usuarios
- Autenticación y autorización mediante roles USER y ADMIN
- Gestión de productos (CRUD)
- Reseñas de productos
- Lista de favoritos
- Carrito de compra
- Checkout y pedidos
- Subida de imágenes de productos
- Documentación de la API
- Pruebas automatizadas

## Instalación

1. Clonar el repositorio desde GitHub.
2. Instalar dependencias con `npm install` (en PowerShell puede utilizarse `npm.cmd install`).
3. Configurar las variables de entorno.
4. Ejecutar `npx prisma generate` (o `npx.cmd prisma generate` en PowerShell).
5. Iniciar el servidor con `node src/server.js`.

### Variables de entorno

Crear un archivo `.env` con las siguientes variables:

- `DATABASE_URL`
- `MONGODB_URI`
- `JWT_SECRET`
- `PORT`
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`

No publicar contraseñas ni claves privadas.

## Endpoints principales

| Método | Endpoint | Descripción |
|---|---|---|
| GET | `/health` | Estado del servidor |
| POST | `/api/auth/register` | Registrar usuario |
| POST | `/api/auth/login` | Iniciar sesión |
| GET | `/api/auth/me` | Usuario autenticado |
| GET | `/api/products` | Listar productos |
| GET | `/api/products/:id` | Obtener producto |
| POST | `/api/products` | Crear producto (ADMIN) |
| PUT | `/api/products/:id` | Actualizar producto (ADMIN) |
| DELETE | `/api/products/:id` | Eliminar producto (ADMIN) |
| POST | `/api/products/:id/image` | Subir imagen (ADMIN) |
| GET | `/api/products/:id/reviews` | Consultar reseñas |
| POST | `/api/products/:id/reviews` | Publicar reseña |
| GET | `/api/wishlist` | Consultar favoritos |
| POST | `/api/wishlist/:productId` | Añadir favorito |
| GET | `/api/cart` | Consultar carrito |
| POST | `/api/cart/items` | Añadir producto al carrito |
| DELETE | `/api/cart/items/:productId` | Eliminar producto |
| GET | `/api/orders` | Consultar pedidos |
| POST | `/api/orders/checkout` | Finalizar compra |

Los endpoints protegidos utilizan la cabecera `Authorization: Bearer TOKEN`.

## Pruebas automatizadas

Ejecutar:

`node --experimental-vm-modules node_modules/jest/bin/jest.js --runInBand`

## Enlaces

**Repositorio GitHub:**  
https://github.com/eluentorres/ecommerce-backend

**Backend en Render:**  
https://ecommerce-backend-50sl.onrender.com

**Documentación Swagger:**  
https://ecommerce-backend-50sl.onrender.com/api/docs

**Estado del servidor:**  
https://ecommerce-backend-50sl.onrender.com/health