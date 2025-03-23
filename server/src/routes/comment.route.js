import express from "express";
import commentController from "../controllers/comment.controller.js";
import { authenticated, checkOwnerComment } from "../middlewares/authorize.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import commentSchema from "../validations/comment.validation.js";

const router = express.Router();

router.post("/", authenticated, validate(commentSchema), commentController.createComment);
router.get("/:postId", commentController.getCommentsByPost);
router.put("/:id", authenticated, validate(commentSchema), checkOwnerComment, commentController.updateComment);
router.delete("/:id", authenticated, commentController.deleteComment);
router.post("/like", authenticated, commentController.likeComment);

export default router;
