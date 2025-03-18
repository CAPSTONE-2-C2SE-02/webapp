import express from "express";
import postController from "../controllers/post.controller.js";
import { authenticated, authorize, checkOwnerPost } from "../middlewares/authorize.middleware.js";
import upload from '../middlewares/multer.middleware.js';
import { validate } from "../middlewares/validate.middleware.js";
import postSchema from "../validations/post.validation.js";

const router = express.Router();

router.post("/", authenticated, upload.array("images"), validate(postSchema), postController.createPost);
router.get("/", postController.getAllPosts);
router.get("/my-post/get", authenticated, postController.getAllMyPosts);
router.get("/:id", postController.getPostById);
router.put("/:id", authenticated, upload.array("images"), validate(postSchema, true), checkOwnerPost, postController.updatePost);
router.delete("/:id", authenticated, checkOwnerPost, postController.deletePost);
router.post("/like", authenticated, authorize("TOUR_GUIDE", "TRAVELER"), postController.likePost);
router.post("/privacy/:id", authenticated, authorize("TOUR_GUIDE", "TRAVELER"), checkOwnerPost, postController.setPrivacy);

export default router;