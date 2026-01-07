import Fastify from "fastify";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "@fastify/cors";
import moviesRoutes from "./movie.js";

dotenv.config();

const app = Fastify({ logger: true });

await app.register(cors, {
  origin: true,
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
});

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log("🗃️ MongoDB connected"))
  .catch(err => {
    console.error(err);
    process.exit(1);
  });

app.register(moviesRoutes, { prefix: "/api" });

app.get("/", async () => ({ status: "Backend running 🚀" }));

const port = process.env.PORT || 4000;
await app.listen({ port, host: "0.0.0.0" });
