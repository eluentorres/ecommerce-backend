import swaggerJsdoc from "swagger-jsdoc";

const bearerAuth = [{ bearerAuth: [] }];

const response = (description) => ({ description });

const protectedResponses = {
  "401": response("No autenticado"),
  "500": response("Error interno del servidor")
};

const productId = {
  name: "id",
  in: "path",
  required: true,
  schema: { type: "string" },
  description: "Identificador del producto"
};

const productIdForWishlist = {
  name: "productId",
  in: "path",
  required: true,
  schema: { type: "string" }
};

const jsonBody = (properties, required = []) => ({
  required: true,
  content: {
    "application/json": {
      schema: {
        type: "object",
        properties,
        required
      }
    }
  }
});

const productProperties = {
  name: { type: "string", example: "Camiseta" },
  description: { type: "string", example: "Camiseta de algodón" },
  price: { type: "number", example: 19.99 },
  stock: { type: "integer", example: 10 }
};

const options = {
  definition: {
    openapi: "3.0.3",

    info: {
      title: "E-commerce Backend API",
      version: "1.1.0",
      description:
        "API REST preparada para React. Node.js, Express, Prisma, Supabase, MongoDB, JWT y Cloudinary."
    },

    servers: [
      {
        url: "https://ecommerce-backend-50sl.onrender.com",
        description: "Producción - Render"
      },
      {
        url: "http://localhost:3000",
        description: "Desarrollo local"
      }
    ],

    tags: [
      { name: "Sistema", description: "Estado del servidor" },
      { name: "Autenticación", description: "Registro, login y usuario" },
      { name: "Productos", description: "Gestión de productos" },
      { name: "Reviews", description: "Reseñas de productos" },
      { name: "Wishlist", description: "Lista de favoritos" },
      { name: "Carrito", description: "Carrito de compra" },
      { name: "Pedidos", description: "Checkout y pedidos" }
    ],

    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "Introduce el token JWT obtenido en el login"
        }
      },

      schemas: {
        ApiSuccess: {
          type: "object",
          properties: {
            ok: { type: "boolean", example: true },
            data: { type: "object" }
          }
        },

        ApiError: {
          type: "object",
          properties: {
            ok: { type: "boolean", example: false },
            error: {
              type: "object",
              properties: {
                message: {
                  type: "string",
                  example: "Product not found"
                }
              }
            }
          }
        }
      }
    },

    paths: {
      "/health": {
        get: {
          tags: ["Sistema"],
          summary: "Comprobar el estado del servidor",
          responses: {
            "200": response("Servidor funcionando")
          }
        }
      },

      "/api/auth/register": {
        post: {
          tags: ["Autenticación"],
          summary: "Registrar un usuario",
          requestBody: jsonBody({
            name: { type: "string", example: "Usuario" },
            email: {
              type: "string",
              format: "email",
              example: "usuario@ejemplo.com"
            },
            password: {
              type: "string",
              format: "password"
            }
          }, ["email", "password"]),
          responses: {
            "201": response("Usuario registrado"),
            "400": response("Datos de registro inválidos"),
            "409": response("Usuario ya registrado")
          }
        }
      },

      "/api/auth/login": {
        post: {
          tags: ["Autenticación"],
          summary: "Iniciar sesión y obtener JWT",
          requestBody: jsonBody({
            email: {
              type: "string",
              format: "email",
              example: "usuario@ejemplo.com"
            },
            password: {
              type: "string",
              format: "password"
            }
          }, ["email", "password"]),
          responses: {
            "200": response("Inicio de sesión correcto"),
            "400": response("Datos inválidos"),
            "401": response("Credenciales incorrectas")
          }
        }
      },

      "/api/auth/me": {
        get: {
          tags: ["Autenticación"],
          summary: "Consultar usuario autenticado",
          security: bearerAuth,
          responses: {
            "200": response("Datos del usuario"),
            ...protectedResponses
          }
        }
      },

      "/api/me": {
        get: {
          tags: ["Autenticación"],
          summary: "Consultar usuario - ruta compatible con React",
          security: bearerAuth,
          responses: {
            "200": response("Datos del usuario"),
            ...protectedResponses
          }
        }
      },

      "/api/products": {
        get: {
          tags: ["Productos"],
          summary: "Listar productos",
          responses: {
            "200": response("Lista de productos"),
            "500": response("Error del servidor")
          }
        },

        post: {
          tags: ["Productos"],
          summary: "Crear producto - ADMIN",
          security: bearerAuth,
          requestBody: jsonBody(productProperties, [
            "name",
            "price",
            "stock"
          ]),
          responses: {
            "201": response("Producto creado"),
            "400": response("Datos inválidos"),
            "403": response("Permisos insuficientes"),
            ...protectedResponses
          }
        }
      },

      "/api/products/{id}": {
        parameters: [productId],

        get: {
          tags: ["Productos"],
          summary: "Consultar un producto",
          responses: {
            "200": response("Producto encontrado"),
            "404": response("Producto no encontrado")
          }
        },

        put: {
          tags: ["Productos"],
          summary: "Actualizar producto - ADMIN",
          security: bearerAuth,
          requestBody: jsonBody(productProperties),
          responses: {
            "200": response("Producto actualizado"),
            "400": response("Datos inválidos"),
            "403": response("Permisos insuficientes"),
            "404": response("Producto no encontrado"),
            ...protectedResponses
          }
        },

        delete: {
          tags: ["Productos"],
          summary: "Eliminar producto - ADMIN",
          security: bearerAuth,
          responses: {
            "200": response("Producto eliminado"),
            "403": response("Permisos insuficientes"),
            "404": response("Producto no encontrado"),
            ...protectedResponses
          }
        }
      },

      "/api/products/{id}/image": {
        post: {
          tags: ["Productos"],
          summary: "Subir imagen de producto a Cloudinary - ADMIN",
          security: bearerAuth,
          parameters: [productId],
          requestBody: {
            required: true,
            content: {
              "multipart/form-data": {
                schema: {
                  type: "object",
                  properties: {
                    image: {
                      type: "string",
                      format: "binary"
                    }
                  },
                  required: ["image"]
                }
              }
            }
          },
          responses: {
            "200": response("Imagen subida correctamente"),
            "400": response("Archivo inválido"),
            "403": response("Permisos insuficientes"),
            "404": response("Producto no encontrado"),
            ...protectedResponses
          }
        }
      },

      "/api/products/{id}/reviews": {
        parameters: [productId],

        get: {
          tags: ["Reviews"],
          summary: "Consultar reseñas de un producto",
          responses: {
            "200": response("Lista de reseñas")
          }
        },

        post: {
          tags: ["Reviews"],
          summary: "Publicar una reseña",
          security: bearerAuth,
          requestBody: jsonBody({
            rating: {
              type: "integer",
              minimum: 1,
              maximum: 5,
              example: 5
            },
            comment: {
              type: "string",
              example: "Muy buen producto"
            }
          }, ["rating"]),
          responses: {
            "201": response("Reseña creada"),
            "400": response("Datos inválidos"),
            ...protectedResponses
          }
        }
      },

      "/api/wishlist": {
        get: {
          tags: ["Wishlist"],
          summary: "Consultar mis favoritos",
          security: bearerAuth,
          responses: {
            "200": response("Lista de favoritos"),
            ...protectedResponses
          }
        }
      },

      "/api/wishlist/{productId}": {
        parameters: [productIdForWishlist],

        post: {
          tags: ["Wishlist"],
          summary: "Añadir producto a favoritos",
          security: bearerAuth,
          responses: {
            "200": response("Producto añadido a favoritos"),
            ...protectedResponses
          }
        },

        delete: {
          tags: ["Wishlist"],
          summary: "Eliminar producto de favoritos",
          security: bearerAuth,
          responses: {
            "200": response("Producto eliminado de favoritos"),
            ...protectedResponses
          }
        }
      },

      "/api/cart": {
        get: {
          tags: ["Carrito"],
          summary: "Consultar mi carrito",
          security: bearerAuth,
          responses: {
            "200": response("Carrito del usuario"),
            ...protectedResponses
          }
        }
      },

      "/api/cart/items": {
        post: {
          tags: ["Carrito"],
          summary: "Añadir producto al carrito",
          security: bearerAuth,
          requestBody: jsonBody({
            productId: {
              type: "string",
              example: "ID_DEL_PRODUCTO"
            },
            quantity: {
              type: "integer",
              minimum: 1,
              example: 1
            }
          }, ["productId", "quantity"]),
          responses: {
            "200": response("Carrito actualizado"),
            "400": response("Datos inválidos o stock insuficiente"),
            "404": response("Producto no encontrado"),
            ...protectedResponses
          }
        }
      },

      "/api/cart/items/{productId}": {
        delete: {
          tags: ["Carrito"],
          summary: "Eliminar producto del carrito",
          security: bearerAuth,
          parameters: [productIdForWishlist],
          responses: {
            "200": response("Producto eliminado del carrito"),
            ...protectedResponses
          }
        }
      },

      "/api/cart/checkout": {
        post: {
          tags: ["Pedidos"],
          summary: "Finalizar compra - ruta compatible con React",
          security: bearerAuth,
          responses: {
            "201": response("Pedido creado correctamente"),
            "400": response("Carrito vacío o stock insuficiente"),
            "404": response("Producto no encontrado"),
            ...protectedResponses
          }
        }
      },

      "/api/orders": {
        get: {
          tags: ["Pedidos"],
          summary: "Consultar mis pedidos",
          security: bearerAuth,
          responses: {
            "200": response("Pedidos del usuario"),
            ...protectedResponses
          }
        }
      },

      "/api/orders/checkout": {
        post: {
          tags: ["Pedidos"],
          summary: "Finalizar compra",
          security: bearerAuth,
          responses: {
            "201": response("Pedido creado correctamente"),
            "400": response("Carrito vacío o stock insuficiente"),
            "404": response("Producto no encontrado"),
            ...protectedResponses
          }
        }
      }
    }
  },

  apis: []
};

export const swaggerSpec = swaggerJsdoc(options);