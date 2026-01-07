import Fastify from "fastify";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "@fastify/cors";
import moviesRoutes from "./movie.js";

dotenv.config();

const app = Fastify({ logger: true });

await app.register(cors, {
  origin: "https://acelucid-frontend-6xyw.vercel.app",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
  optionsSuccessStatus: 204,
});

const mongo_uri = process.env.MONGODB_URI;

if (!mongo_uri) {
  console.error("❌ MONGODB_URI is not defined");
  process.exit(1);
}

mongoose
  .connect(mongo_uri)
  .then(() => console.log("🗃️ Connected to MongoDB Atlas"))
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  });


app.register(moviesRoutes, { prefix: "/api" });


app.get("/", async () => {
  return { status: "Backend running 🚀" };
});

const start = async () => {
  const port = process.env.PORT || 4000;
  try {
    await app.listen({ port, host: "0.0.0.0" });
    console.log(`🚀 Server running on port ${port}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();
