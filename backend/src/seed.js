import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import Movie from "./models/Movie.js";
import Cinema from "./models/Cinema.js";

const seedData = async () => {
  const mongoURI = process.env.MONGO_URI || "mongodb://localhost:27017/doomsday_ready";

  try {
    await mongoose.connect(mongoURI);
    console.log("Connected to MongoDB for seeding...");

    // Clear existing
    await Movie.deleteMany({});
    await Cinema.deleteMany({});
    console.log("Cleared existing movies and cinemas.");

    // Step 1: Insert independent movies
    const ironMan = await Movie.create({
      title: "Iron Man",
      releaseYear: 2008,
      runtime: 126,
      watched: true,
      prerequisites: [],
    });

    const firstAvenger = await Movie.create({
      title: "Captain America: The First Avenger",
      releaseYear: 2011,
      runtime: 124,
      watched: true,
      prerequisites: [],
    });

    const ragnarok = await Movie.create({
      title: "Thor: Ragnarok",
      releaseYear: 2017,
      runtime: 130,
      watched: false,
      prerequisites: [],
    });

    // Step 2: Movies with prerequisites
    const avengers = await Movie.create({
      title: "The Avengers",
      releaseYear: 2012,
      runtime: 143,
      watched: true,
      prerequisites: [ironMan._id, firstAvenger._id],
    });

    const civilWar = await Movie.create({
      title: "Captain America: Civil War",
      releaseYear: 2016,
      runtime: 147,
      watched: false,
      prerequisites: [avengers._id],
    });

    const infinityWar = await Movie.create({
      title: "Avengers: Infinity War",
      releaseYear: 2018,
      runtime: 149,
      watched: false,
      prerequisites: [civilWar._id, ragnarok._id],
    });

    const endgame = await Movie.create({
      title: "Avengers: Endgame",
      releaseYear: 2019,
      runtime: 181,
      watched: false,
      prerequisites: [infinityWar._id],
    });

    const doomsday = await Movie.create({
      title: "Avengers: Doomsday",
      releaseYear: 2026,
      runtime: 165,
      watched: false,
      prerequisites: [endgame._id],
    });

    console.log("Seeded 8 MCU movies successfully!");

    // Seed Cinemas with assessment bundle examples
    await Cinema.create([
      {
        name: "Stark Avengers Complex",
        bundleSizes: [20, 9, 6],
      },
      {
        name: "Avengers Multiplex",
        bundleSizes: [5, 2],
      },
      {
        name: "Wakanda Royal Cinema",
        bundleSizes: [4, 3, 1],
      },
      {
        name: "Sanctum Imax Hall",
        bundleSizes: [6, 4],
      },
    ]);

    console.log("Seeded 4 cinemas successfully!");
    console.log("Seeding complete.");
    process.exit(0);
  } catch (error) {
    console.error("Seeding error:", error);
    process.exit(1);
  }
};

seedData();
