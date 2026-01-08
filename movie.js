import axios from "axios";
import Recommendation from "./recommendation.js";

export default async function (fastify) {
  fastify.post("/recommend", async (request, reply) => {
    try {
      const { genre } = request.body;

      if (!genre) {
        return reply.status(400).send({ error: "Genre is required" });
      }

      const NVIDIA_URL = process.env.NVIDIA_URL;
      const NVIDIA_API_KEY = process.env.NVIDIA_API_KEY;

      if (!NVIDIA_URL || !NVIDIA_API_KEY) {
        fastify.log.error({
          NVIDIA_URL,
          NVIDIA_API_KEY: NVIDIA_API_KEY ? "Loaded" : "Missing",
        });

        return reply.status(500).send({
          error: "Configuration error",
          details: "Environment variables not loaded",
        });
      }

      const prompt = `
Respond ONLY with valid JSON.
Do not add explanations or formatting.

{
  "genre": "${genre}",
  "recommended_movies": [
    "Movie1",
    "Movie2",
    "Movie3",
    "Movie4",
    "Movie5"
  ]
}
`;

      const aiResponse = await axios.post(
        NVIDIA_URL,
        {
          model: "meta/llama-4-maverick-17b-128e-instruct",
          messages: [
            { role: "system", content: "You are a strict JSON API." },
            { role: "user", content: prompt },
          ],
          max_tokens: 256,
          temperature: 0.7,
        },
        {
          headers: {
            Authorization: `Bearer ${NVIDIA_API_KEY}`,
            "Content-Type": "application/json",
          },
        }
      );

      let content = aiResponse.data?.choices?.[0]?.message?.content;

      if (!content) {
        throw new Error("Empty AI response");
      }

      const jsonStart = content.indexOf("{");
      const jsonEnd = content.lastIndexOf("}") + 1;
      const jsonString = content.slice(jsonStart, jsonEnd);

      const parsed = JSON.parse(jsonString);

      const newRecommendation = new Recommendation({
        userInput: genre,
        recommendedMovies: parsed.recommended_movies,
      });

      await newRecommendation.save();

      return reply.send({
        genre: parsed.genre,
        movies: parsed.recommended_movies,
        saved: true, 
      });
    } catch (err) {
      fastify.log.error("AI Error:", err);
    }
  });
}
