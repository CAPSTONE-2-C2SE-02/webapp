import { moderatePostContent } from "../utils/contentModeration.util.js";
import { StatusCodes } from "http-status-codes";


export const contentModerationMiddleware = (req, res, next) => {
    try {
        const postData = req.body;

        const moderationResult = moderatePostContent(postData);

        if (moderationResult.isInappropriate) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                success: false,
                message: `Bài đăng của bạn chứa nội dung không phù hợp trong phần ${moderationResult.source}`,
                inappropriateWords: moderationResult.inappropriateWords,
                error: "Inappropriate content detected"
            });
        }

        next();
    } catch (error) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: "Lỗi khi kiểm duyệt nội dung",
            error: error.message
        });
    }
};

