import Fastify from "fastify";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "@fastify/cors";
import moviesRoutes from "./movie.js";

dotenv.config();

const app = Fastify({ logger: true });

await app.register(cors, {
  origin: [
    "https://acelucid-frontend-6xyw.vercel.app",
    "https://acelucid-frontend.vercel.app" // include both if needed
  ],
  methods: ["GET", "POST", "OPTIONS"],
});

// This optional override is only needed in rare cases:
app.options("/*", async (request, reply) => {
  reply
    .header("Access-Control-Allow-Origin", request.headers.origin || "*")
    .header("Access-Control-Allow-Methods", "GET,POST,OPTIONS")
    .header("Access-Control-Allow-Headers", "Content-Type, Authorization")
    .status(204)
    .send();
});

/* ✅ MongoDB */
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("🗃️ MongoDB connected"))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });

/* ✅ Routes */
app.register(moviesRoutes, { prefix: "/api" });

/* ✅ Root */
app.get("/", async () => ({ status: "Backend running 🚀" }));

/* ✅ Start */
const port = process.env.PORT || 4000;
await app.listen({ port, host: "0.0.0.0" });
