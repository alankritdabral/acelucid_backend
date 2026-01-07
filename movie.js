import axios from "axios";

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

      const prompt = `You are a JSON API. Respond ONLY with valid JSON.
Return exactly 5 movie names for the genre "${genre}".

{
  "genre": "${genre}",
  "recommended_movies": [
    "Movie1",
    "Movie2",
    "Movie3",
    "Movie4",
    "Movie5"
  ]
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
          temperature: 0.7,
        },
        {
          headers: {
            Authorization: `Bearer ${NVIDIA_API_KEY}`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        }
      );

      const content =
        aiResponse.data.choices?.[0]?.message?.content || "";

      const json = JSON.parse(content); // ✅ since you forced JSON output

      reply.send({
        genre: json.genre,
        movies: json.recommended_movies,
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
