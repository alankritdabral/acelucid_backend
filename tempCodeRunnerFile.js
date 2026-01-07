import Fastify from "fastify";
import dotenv from "dotenv";
import cors from "@fastify/cors";
import moviesRoutes from "./movie.js";

dotenv.config();

const app = Fastify({ logger: true });

// Enable CORS
await app.register(cors, {
  origin: true,
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type"],
});

// Register routes with prefix /api
app.register(moviesRoutes, { prefix: "/api" });

// Health check
app.get("/", async () => ({ status: "Backend running 🚀" }));

// Global error handler
app.setErrorHandler((error, request, reply) => {
  app.log.error(error); // full error in console
  reply
    .status(error.statusCode || 500)
    .send({ error: "Server error", details: error.message });
});

// Start server
const port = process.env.PORT || 3000;
await app.listen({ port, host: "0.0.0.0" });
