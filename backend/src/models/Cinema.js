import mongoose from "mongoose";

const cinemaSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Cinema name is required"],
      unique: true,
      trim: true,
    },
    bundleSizes: {
      type: [Number],
      required: [true, "Bundle sizes are required"],
      validate: {
        validator: function (val) {
          if (!Array.isArray(val) || val.length < 1 || val.length > 10) {
            return false;
          }
          return val.every((size) => Number.isInteger(size) && size >= 1 && size <= 500);
        },
        message: "A cinema must have between 1 and 10 bundle sizes, each holding 1 to 500 seats",
      },
    },
  },
  { timestamps: true }
);

const Cinema = mongoose.model("Cinema", cinemaSchema);

export default Cinema;
