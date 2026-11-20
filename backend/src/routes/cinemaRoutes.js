import express from "express";
import {
  createCinema,
  getCinemas,
  getCinemaById,
  updateCinema,
  deleteCinema,
  getBookingQuote,
} from "../controllers/cinemaController.js";

const router = express.Router();

router.post("/", createCinema);
router.get("/", getCinemas);
router.get("/:id", getCinemaById);
router.patch("/:id", updateCinema);
router.delete("/:id", deleteCinema);
router.get("/:id/booking", getBookingQuote);

export default router;
