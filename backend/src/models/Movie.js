import mongoose from "mongoose";

const movieSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Movie title is required"],
      unique: true,
      trim: true,
    },
    releaseYear: {
      type: Number,
      required: [true, "Release year is required"],
    },
    runtime: {
      type: Number,
      required: [true, "Runtime is required"],
      min: [1, "Runtime must be at least 1 minute"],
      max: [300, "Runtime cannot exceed 300 minutes"],
    },
    prerequisites: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Movie",
      },
    ],
    watched: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const Movie = mongoose.model("Movie", movieSchema);

export default Movie;
