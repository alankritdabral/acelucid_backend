import Recommendation from "./recommendation.js";
import axios from "axios";

const NVIDIA_URL = process.env.NVIDIA_URL;
const NVIDIA_API_KEY = process.env.NVIDIA_API_KEY;  

export default async function (fastify) {
  fastify.post("/recommend", async (request, reply) => {
    try {
      const { genre } = request.body;

      if (!genre) {
        return reply.status(400).send({ error: "Genre is required" });
      }

      const prompt = `You are a JSON API.Respond ONLY with valid JSON.Do not include explanations or markdown.Return exactly 5 movie names for the given genre.
                  Output format:
                {
                  genre: "${genre}",
                  recommended_movies: [
                    "Movie1",
                    "Movie2",
                    "Movie3",
                    "Movie4",
                    "Movie5"
                  ],
                }`;

      const aiResponse = await axios.post(
        NVIDIA_URL,
        {
          model: "meta/llama-4-maverick-17b-128e-instruct",
          messages: [
            { role: "system", content: "You are a helpful assistant." },
            { role: "user", content: prompt },
          ],
          max_tokens: 256,
          temperature: 1,
        },
        {
          headers: {
            Authorization: `Bearer ${NVIDIA_API_KEY}`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        }
      );

      const message = aiResponse.data.choices?.[0]?.message;
      const text = Array.isArray(message?.content)
        ? message.content.map((block) => block.text ?? "").join("")
        : message?.content ?? "";

      const movies = text
        .split("\n")
        .map((line) => line.replace(/^\d+[\).\s]*/, "").trim())
        .filter(Boolean);

      // const record = new Recommendation({
      //   userInput: genre,
      //   recommendedMovies: movies,
      // });

      // await record.save();

      reply.send({
        genre,
        movies,
        saved: true,
      });
    } catch (err) {
      console.error("AI Error:", err.response?.data || err.message);
      reply.status(500).send({
        error: "Server error",
        details: err.response?.data || err.message,
      });
    }
  });
}
