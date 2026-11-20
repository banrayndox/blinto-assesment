import Movie from "../models/Movie.js";
import mongoose from "mongoose";
export const createMovie = async (req, res) => {
  try {
    const { title, releaseYear, runtime, prerequisites, watched } = req.body;

    if (!title || !releaseYear || runtime === undefined) {
      return res.status(400).json({
        success: false,
        message: "Title, release year, and runtime are required",
      });
    }

    if (runtime < 1 || runtime > 300) {
      return res.status(400).json({
        success: false,
        message: "Runtime must be between 1 and 300 minutes",
      });
    }

    const existingMovie = await Movie.findOne({
      title: { $regex: new RegExp(`^${title.trim()}$`, "i") },
    });

    if (existingMovie) {
      return res.status(400).json({
        success: false,
        message: "A movie with this title already exists",
      });
    }

    // =========================================================================
    // FEATURE 1 HOOK: Circular Dependency Detection
    // Note: Circular dependency detection algorithm is reserved for author implementation.
    // When implementing: reject any cycle with:
    // return res.status(409).json({ success: false, code: "CIRCULAR_DEPENDENCY", message: "Circular dependency detected" });
    // =========================================================================

    const movie = await Movie.create({
      title: title.trim(),
      releaseYear: Number(releaseYear),
      runtime: Number(runtime),
      prerequisites: prerequisites || [],
      watched: Boolean(watched),
    });

    const populatedMovie = await Movie.findById(movie._id).populate(
      "prerequisites",
      "title releaseYear runtime watched"
    );

    return res.status(201).json({
      success: true,
      message: "Movie created successfully",
      movie: populatedMovie,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getMovies = async (req, res) => {
  try {
    const movies = await Movie.find()
      .populate("prerequisites", "title releaseYear runtime watched")
      .sort({ releaseYear: 1, title: 1 });

    return res.status(200).json({
      success: true,
      count: movies.length,
      movies,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getMovieById = async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id).populate(
      "prerequisites",
      "title releaseYear runtime watched"
    );

    if (!movie) {
      return res.status(404).json({
        success: false,
        message: "Movie not found",
      });
    }

    return res.status(200).json({
      success: true,
      movie,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const updateMovie = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, releaseYear, runtime, prerequisites, watched } = req.body;

    const movie = await Movie.findById(id);

    if (!movie) {
      return res.status(404).json({
        success: false,
        message: "Movie not found",
      });
    }

    if (title && title.trim() !== movie.title) {
      const existing = await Movie.findOne({
        _id: { $ne: id },
        title: { $regex: new RegExp(`^${title.trim()}$`, "i") },
      });

      if (existing) {
        return res.status(400).json({
          success: false,
          message: "A movie with this title already exists",
        });
      }

      movie.title = title.trim();
    }

    if (releaseYear !== undefined) {
      movie.releaseYear = Number(releaseYear);
    }

    if (runtime !== undefined) {
      if (runtime < 1 || runtime > 300) {
        return res.status(400).json({
          success: false,
          message: "Runtime must be between 1 and 300 minutes",
        });
      }

      movie.runtime = Number(runtime);
    }

    if (watched !== undefined) {
      movie.watched = Boolean(watched);
    }

    if (prerequisites !== undefined) {
      const selfIncluded = prerequisites.some(
        (p) => p.toString() === id.toString()
      );

      if (selfIncluded) {
        return res.status(409).json({
          success: false,
          code: "CIRCULAR_DEPENDENCY",
          message: "A movie cannot depend on itself",
        });
      }

      const movies = await Movie.find();

      const graph = new Map();

      for (const item of movies) {
        graph.set(item._id.toString(), item.prerequisites.map((p) => p.toString()));
      }

      graph.set(
        id.toString(),
        prerequisites.map((p) => p.toString())
      );

      const visited = new Set();
      const path = new Set();

      function dfs(movieId) {
        if (path.has(movieId)) {
          return true;
        }

        if (visited.has(movieId)) {
          return false;
        }

        visited.add(movieId);
        path.add(movieId);

        for (const prerequisiteId of graph.get(movieId) || []) {
          if (dfs(prerequisiteId)) {
            return true;
          }
        }

        path.delete(movieId);
        return false;
      }

      for (const movieId of graph.keys()) {
        if (dfs(movieId)) {
          return res.status(409).json({
            success: false,
            code: "CIRCULAR_DEPENDENCY",
            message: "Circular dependency detected",
          });
        }
      }

      movie.prerequisites = prerequisites;
    }

    await movie.save();

    const populatedMovie = await Movie.findById(movie._id).populate(
      "prerequisites",
      "title releaseYear runtime watched"
    );

    return res.status(200).json({
      success: true,
      message: "Movie updated successfully",
      movie: populatedMovie,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
export const deleteMovie = async (req, res) => {
  try {
    const { id } = req.params;

    const movie = await Movie.findByIdAndDelete(id);
    if (!movie) {
      return res.status(404).json({
        success: false,
        message: "Movie not found",
      });
    }

    // Remove this movie from any prerequisite lists
    await Movie.updateMany(
      { prerequisites: id },
      { $pull: { prerequisites: id } }
    );

    return res.status(200).json({
      success: true,
      message: "Movie deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


export const getRewatchOrder = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid movie ID",
      });
    }

    const targetMovie = await Movie.findById(id);

    if (!targetMovie) {
      return res.status(404).json({
        success: false,
        message: "Movie not found",
      });
    }

    const movies = await Movie.find();

    const graph = new Map();
    const movieMap = new Map();

    for (const movie of movies) {
      const movieId = movie._id.toString();

      graph.set(movieId, []);
      movieMap.set(movieId, movie);
    }

    for (const movie of movies) {
      const movieId = movie._id.toString();

      for (const prerequisiteId of movie.prerequisites) {
        const prerequisiteIdString = prerequisiteId.toString();

        if (graph.has(prerequisiteIdString)) {
          graph.get(prerequisiteIdString).push(movieId);
        }
      }
    }

    const visited = new Set();
    const path = new Set();
    const order = [];
    let hasCycle = false;

    function dfs(movieId) {
      if (path.has(movieId)) {
        hasCycle = true;
        return;
      }

      if (visited.has(movieId)) {
        return;
      }

      path.add(movieId);

      for (const nextMovieId of graph.get(movieId) || []) {
        dfs(nextMovieId);
      }

      path.delete(movieId);
      visited.add(movieId);

      order.push(movieMap.get(movieId));
    }

    const targetId = targetMovie._id.toString();


    const reverseGraph = new Map();

    for (const movie of movies) {
      reverseGraph.set(movie._id.toString(), []);
    }

    for (const movie of movies) {
      const movieId = movie._id.toString();

      for (const prerequisiteId of movie.prerequisites) {
        const prerequisiteIdString = prerequisiteId.toString();

        if (reverseGraph.has(movieId)) {
          reverseGraph.get(movieId).push(prerequisiteIdString);
        }
      }
    }

    function getPrerequisites(movieId) {
      if (path.has(movieId)) {
        hasCycle = true;
        return;
      }

      if (visited.has(movieId)) {
        return;
      }

      path.add(movieId);

      for (const prerequisiteId of reverseGraph.get(movieId) || []) {
        getPrerequisites(prerequisiteId);
      }

      path.delete(movieId);
      visited.add(movieId);

      order.push(movieMap.get(movieId));
    }

    getPrerequisites(targetId);

    if (hasCycle) {
      return res.status(200).json({
        success: true,
        possible: false,
        message: "Circular dependency detected",
        movie: targetMovie.title,
      });
    }

    const rewatchOrder = order
      .filter(
        (movie) =>
          !movie.watched ||
          movie._id.toString() === targetId
      )
      .map((movie) => ({
        _id: movie._id,
        title: movie.title,
        releaseYear: movie.releaseYear,
        runtime: movie.runtime,
        watched: movie.watched,
      }));

    const totalRuntime = rewatchOrder.reduce(
      (sum, movie) => sum + movie.runtime,
      0
    );

    return res.status(200).json({
      success: true,
      possible: true,
      targetMovie: targetMovie.title,
      rewatchOrder,
      totalMovies: rewatchOrder.length,
      totalRuntime,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};