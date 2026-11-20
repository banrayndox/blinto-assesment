import express from "express";
import {
  createMovie,
  getMovies,
  getMovieById,
  updateMovie,
  deleteMovie,
  getRewatchOrder,
} from "../controllers/movieController.js";

const router = express.Router();

router.post("/", createMovie);
router.get("/", getMovies);
router.get("/:id", getMovieById);
router.patch("/:id", updateMovie);
router.delete("/:id", deleteMovie);
router.get("/:id/rewatch-order", getRewatchOrder);

export default router;
