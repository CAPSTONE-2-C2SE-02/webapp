import express from "express";
import bookmarkController from "../controllers/bookmark.controller.js";
import { authenticated } from "../middlewares/authorize.middleware.js";

const router = express.Router();

router.post("/:itemType/:itemId", authenticated, bookmarkController.createBookmark);
router.delete("/:itemType/:itemId", authenticated, bookmarkController.deleteBookmark);
router.get("/:itemType/:itemId", authenticated, bookmarkController.getBookmark);
router.get("/", authenticated, bookmarkController.getAllBookmarks);

export default router;