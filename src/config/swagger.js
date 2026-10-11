import swaggerJsdoc from "swagger-jsdoc";

const options = {
  definition: {
    openapi: "3.0.3",
    info: {
      title: "E-commerce Backend API",
      version: "1.0.0",
      description: "API REST con Express, Prisma, Supabase, MongoDB y JWT"
    },
    servers: [
      { url: "http://localhost:3000" }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT"
        }
      }
    },
    paths: {
      "/health": {
        get: {
          summary: "Comprobar el estado del servidor",
          responses: {
            "200": { description: "Servidor funcionando" }
          }
        }
      },
      "/api/products": {
        get: {
          summary: "Consultar productos",
          responses: {
            "200": { description: "Lista de productos" }
          }
        },
        post: {
          summary: "Crear producto (ADMIN)",
          security: [{ bearerAuth: [] }],
          responses: {
            "201": { description: "Producto creado" }
          }
        }
      },
      "/api/auth/register": {
        post: {
          summary: "Registrar usuario",
          responses: {
            "201": { description: "Usuario registrado" }
          }
        }
      },
      "/api/auth/login": {
        post: {
          summary: "Iniciar sesión y obtener JWT",
          responses: {
            "200": { description: "Inicio de sesión correcto" }
          }
        }
      },
      "/api/cart": {
        get: {
          summary: "Consultar mi carrito",
          security: [{ bearerAuth: [] }],
          responses: {
            "200": { description: "Carrito del usuario" }
          }
        }
      },
      "/api/cart/items": {
        post: {
          summary: "Añadir producto al carrito",
          security: [{ bearerAuth: [] }],
          responses: {
            "200": { description: "Producto añadido" }
          }
        }
      },
      "/api/orders": {
        get: {
          summary: "Consultar mis pedidos",
          security: [{ bearerAuth: [] }],
          responses: {
            "200": { description: "Pedidos del usuario" }
          }
        }
      },
      "/api/orders/checkout": {
        post: {
          summary: "Confirmar compra",
          security: [{ bearerAuth: [] }],
          responses: {
            "201": { description: "Pedido confirmado" }
          }
        }
      }
    }
  },
  apis: []
};

export const swaggerSpec = swaggerJsdoc(options);
