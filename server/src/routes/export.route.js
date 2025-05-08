import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import Papa from "papaparse";
import Tour from "../models/tour.model.js";
import { StatusCodes } from "http-status-codes";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

router.get("/export", async (req, res) => {
  try {
    const tours = await Tour.find().lean();
    const csv = Papa.unparse(tours);

    const filePath = path.join(__dirname, "../../../chatbot/data/tours.csv");

    fs.writeFileSync(filePath, '\uFEFF' + csv, "utf8");

    res.json({ success: true, file: filePath });

  } catch (error) {
    console.error("Error when exporting data:", error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: "Error when exporting data" });
  }
});

export default router;
