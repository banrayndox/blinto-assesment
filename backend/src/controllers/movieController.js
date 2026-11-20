import Movie from "../models/Movie.js";

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
      // Prevent direct self-prerequisite check
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

      // =========================================================================
      // FEATURE 1 HOOK: Circular Dependency Detection
      // Note: General circular dependency graph traversal logic is reserved for
      // author implementation.
      // When implementing: reject any prerequisite cycle with:
      // return res.status(409).json({ success: false, code: "CIRCULAR_DEPENDENCY", message: "Circular dependency detected" });
      // =========================================================================

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

    const movie = await Movie.findById(id).populate(
      "prerequisites",
      "title releaseYear runtime watched"
    );

    if (!movie) {
      return res.status(404).json({
        success: false,
        message: "Target movie not found",
      });
    }

    // =========================================================================
    // FEATURE 1: Rewatch Order Algorithm
    // The algorithm implementation (topological sort, dependency graph traversal,
    // circular dependency check, watched count calculation, and remaining runtime)
    // is reserved for the author to implement.
    // =========================================================================

    return res.status(501).json({
      success: false,
      algorithmPending: true,
      message:
        "Rewatch order calculation algorithm has not been implemented yet. Reserved for author implementation.",
      targetMovie: {
        _id: movie._id,
        title: movie.title,
        releaseYear: movie.releaseYear,
        runtime: movie.runtime,
        watched: movie.watched,
        prerequisites: movie.prerequisites,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
