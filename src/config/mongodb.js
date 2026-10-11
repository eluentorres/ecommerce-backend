import "dotenv/config";
import dns from "node:dns";
import mongoose from "mongoose";

dns.setServers(["1.1.1.1", "8.8.8.8"]);

export async function connectMongoDB() {
  if (!process.env.MONGODB_URI) {
    throw new Error("Falta MONGODB_URI en .env");
  }

  await mongoose.connect(process.env.MONGODB_URI, {
    serverSelectionTimeoutMS: 10000
  });

  console.log("MongoDB conectado correctamente");
}
