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
        message: "groupSize query parameter is required",
      });
    }

    const target = Number(groupSize);

    if (!Number.isInteger(target) || target < 1 || target > 10000) {
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

    const bundleSizes = cinema.bundleSizes;

    let current = [];
    let best = [];
    let minBundles = Infinity;

    function solve(remaining) {
      if (remaining === 0) {
        if (current.length < minBundles) {
          minBundles = current.length;
          best = [...current];
        }
        return;
      }

      if (remaining < 0 || current.length >= minBundles) {
        return;
      }

      for (let bundle of bundleSizes) {
        current.push(bundle);

        solve(remaining - bundle);

        current.pop();
      }
    }

    solve(target);

    if (minBundles === Infinity) {
      return res.status(200).json({
        success: true,
        possible: false,
        message: "Not possible",
        groupSize: target,
        cinema: cinema.name,
      });
    }

    return res.status(200).json({
      success: true,
      possible: true,
      groupSize: target,
      cinema: cinema.name,
      totalBundles: minBundles,
      totalSeats: target,
      bundles: best,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};