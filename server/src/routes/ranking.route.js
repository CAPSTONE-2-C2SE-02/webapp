import express from "express";
import RankingController from "../controllers/ranking.controller.js";
import { authenticated } from "../middlewares/authorize.middleware.js";

const router = express.Router();

router.get("/top", RankingController.getTopRanking);
router.get("/top/:type", RankingController.getTopByType);
router.get("/me", authenticated, RankingController.getMyRanking);

export default router;
