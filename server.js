import Fastify from "fastify";
import mongoose from "mongoose";
import dotenv from "dotenv";
import moviesRoutes from "./movie.js";
import cors from "@fastify/cors";


dotenv.config();

const app = Fastify({ logger: true });

await app.register(cors, {
  origin: "http://localhost:3005",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
});

const mongo_uri = process.env.MONGODB_URI;
if (!mongo_uri) {
  console.error(" MONGODB_URI is not defined");
  process.exit(1);
}

mongoose.connect(mongo_uri)
  .then(() => console.log("🗃️ Connected to MongoDB Atlas"))
  .catch(err => {
    console.error(" DB Connection error:", err);
    process.exit(1);
  });

app.register(moviesRoutes, { prefix: "/api" });

const start = async () => {
  const port = process.env.PORT || 4000;
  try {
    await app.listen({ port, host: "0.0.0.0" });
    console.log(` Server running on port ${port}`);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

start();
