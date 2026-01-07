import mongoose from "mongoose";

const recommendationSchema = new mongoose.Schema({
  userInput: { type: String, required: true },
  recommendedMovies: { type: [String], required: true },
  createdAt: { type: Date, default: Date.now }
});

const Recommendation = mongoose.model("Recommendation", recommendationSchema);
export default Recommendation;
