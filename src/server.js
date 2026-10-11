import "dotenv/config";
import app from "./app.js";
import { connectMongoDB } from "./config/mongodb.js";

const PORT = Number(process.env.PORT) || 3000;

try {
  await connectMongoDB();

  app.listen(PORT, () => {
    console.log(`Servidor funcionando en http://localhost:${PORT}`);
  });
} catch (error) {
  console.error("No se pudo iniciar el servidor:", error);
  process.exit(1);
}

