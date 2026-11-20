import Cinema from "../models/Cinema.js";

export const createCinema = async (req, res) => {
  try {
    const { name, bundleSizes } = req.body;

    if (!name || !bundleSizes) {
      return res.status(400).json({
        success: false,
        message: "Cinema name and bundle sizes are required",
      });
    }

    if (!Array.isArray(bundleSizes) || bundleSizes.length < 1 || bundleSizes.length > 10) {
      return res.status(400).json({
        success: false,
        message: "A cinema must have between 1 and 10 bundle sizes",
      });
    }

    const parsedSizes = bundleSizes.map((s) => Number(s));
    const invalidSizes = parsedSizes.some(
      (s) => !Number.isInteger(s) || s < 1 || s > 500
    );

    if (invalidSizes) {
      return res.status(400).json({
        success: false,
        message: "Each bundle size must be an integer between 1 and 500 seats",
      });
    }

    const existingCinema = await Cinema.findOne({
      name: { $regex: new RegExp(`^${name.trim()}$`, "i") },
    });

    if (existingCinema) {
      return res.status(400).json({
        success: false,
        message: "A cinema with this name already exists",
      });
    }

    // Deduplicate and sort descending for cleaner presentation
    const uniqueSizes = Array.from(new Set(parsedSizes)).sort((a, b) => b - a);

    const cinema = await Cinema.create({
      name: name.trim(),
      bundleSizes: uniqueSizes,
    });

    return res.status(201).json({
      success: true,
      message: "Cinema created successfully",
      cinema,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getCinemas = async (req, res) => {
  try {
    const cinemas = await Cinema.find().sort({ name: 1 });

    return res.status(200).json({
      success: true,
      count: cinemas.length,
      cinemas,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getCinemaById = async (req, res) => {
  try {
    const cinema = await Cinema.findById(req.params.id);

    if (!cinema) {
      return res.status(404).json({
        success: false,
        message: "Cinema not found",
      });
    }

    return res.status(200).json({
      success: true,
      cinema,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const updateCinema = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, bundleSizes } = req.body;

    const cinema = await Cinema.findById(id);
    if (!cinema) {
      return res.status(404).json({
        success: false,
        message: "Cinema not found",
      });
    }

    if (name && name.trim() !== cinema.name) {
      const existing = await Cinema.findOne({
        _id: { $ne: id },
        name: { $regex: new RegExp(`^${name.trim()}$`, "i") },
      });
      if (existing) {
        return res.status(400).json({
          success: false,
          message: "A cinema with this name already exists",
        });
      }
      cinema.name = name.trim();
    }

    if (bundleSizes !== undefined) {
      if (!Array.isArray(bundleSizes) || bundleSizes.length < 1 || bundleSizes.length > 10) {
        return res.status(400).json({
          success: false,
          message: "A cinema must have between 1 and 10 bundle sizes",
        });
      }

      const parsedSizes = bundleSizes.map((s) => Number(s));
      const invalidSizes = parsedSizes.some(
        (s) => !Number.isInteger(s) || s < 1 || s > 500
      );

      if (invalidSizes) {
        return res.status(400).json({
          success: false,
          message: "Each bundle size must be an integer between 1 and 500 seats",
        });
      }

      cinema.bundleSizes = Array.from(new Set(parsedSizes)).sort((a, b) => b - a);
    }

    await cinema.save();

    return res.status(200).json({
      success: true,
      message: "Cinema updated successfully",
      cinema,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const deleteCinema = async (req, res) => {
  try {
    const { id } = req.params;

    const cinema = await Cinema.findByIdAndDelete(id);
    if (!cinema) {
      return res.status(404).json({
        success: false,
        message: "Cinema not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Cinema deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getBookingQuote = async (req, res) => {
  try {
    const { id } = req.params;
    const { groupSize } = req.query;

    if (!groupSize) {
      return res.status(400).json({
        success: false,
        message: "groupSize query parameter is required (e.g. ?groupSize=6)",
      });
    }

    const parsedGroupSize = Number(groupSize);

    if (!Number.isInteger(parsedGroupSize) || parsedGroupSize < 1 || parsedGroupSize > 10000) {
      return res.status(400).json({
        success: false,
        message: "Group size must be an integer between 1 and 10,000",
      });
    }

    const cinema = await Cinema.findById(id);
    if (!cinema) {
      return res.status(404).json({
        success: false,
        message: "Cinema not found",
      });
    }

    // =========================================================================
    // FEATURE 2: Booking Combination Algorithm
    // The algorithm implementation (dynamic programming, minimum bundle search,
    // exact group size combination, and bundle breakdown) is reserved for the
    // author to implement.
    //
    // Expected result format when implemented:
    // {
    //   success: true,
    //   possible: true,
    //   groupSize: parsedGroupSize,
    //   cinema: cinema.name,
    //   totalBundles: 4,
    //   totalSeats: 44,
    //   breakdown: [
    //     { size: 20, count: 1 },
    //     { size: 9, count: 2 },
    //     { size: 6, count: 1 }
    //   ]
    // }
    // Or if no exact combination exists:
    // {
    //   success: true,
    //   possible: false,
    //   message: "Not possible",
    //   groupSize: parsedGroupSize,
    //   cinema: cinema.name
    // }
    // =========================================================================

    return res.status(501).json({
      success: false,
      algorithmPending: true,
      message:
        "Group booking combination algorithm has not been implemented yet. Reserved for author implementation.",
      cinema: {
        _id: cinema._id,
        name: cinema.name,
        bundleSizes: cinema.bundleSizes,
      },
      groupSize: parsedGroupSize,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
