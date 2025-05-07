import { moderatePostContent } from "../utils/contentModeration.util.js";
import { StatusCodes } from "http-status-codes";

export const contentModerationMiddleware = async (req, res, next) => {
    try {
        const postData = req.body;
        
        // Thực hiện kiểm duyệt nội dung
        const moderationResult = await moderatePostContent(postData);
        
        if (moderationResult.isInappropriate) {
            // Xử lý phản hồi dựa trên loại kiểm duyệt
            let responseMessage = 'Bài đăng của bạn chứa nội dung không phù hợp';
            let additionalData = {};
            
            // Tùy chỉnh phản hồi dựa trên nguồn phát hiện
            switch (moderationResult.source) {
                case 'openai_moderation':
                    responseMessage = 'Hệ thống kiểm duyệt phát hiện nội dung vi phạm tiêu chuẩn cộng đồng';
                    additionalData = {
                        categories: moderationResult.categories || []
                    };
                    break;
                    
                case 'ai_semantic_analysis':
                    responseMessage = 'Phân tích ngữ nghĩa phát hiện ngôn từ không phù hợp';
                    additionalData = {
                        categories: moderationResult.categories || [],
                        examples: moderationResult.inappropriateWords || []
                    };
                    break;
                    
                case 'context_analysis':
                    responseMessage = moderationResult.explanation || 'Phát hiện nội dung không phù hợp dựa trên ngữ cảnh';
                    additionalData = {
                        severity: moderationResult.severity || 'medium',
                        offendingElements: moderationResult.offendingElements || []
                    };
                    break;
                    
                default:
                    // Trường hợp mặc định
                    responseMessage = moderationResult.message || 'Bài đăng của bạn chứa nội dung không phù hợp';
                    additionalData = {
                        inappropriateWords: moderationResult.inappropriateWords || [],
                        categories: moderationResult.categories || []
                    };
            }
            
            return res.status(StatusCodes.BAD_REQUEST).json({
                success: false,
                message: responseMessage,
                ...additionalData,
                source: moderationResult.source || 'content_moderation',
                error: "Inappropriate content detected"
            });
        }
        
        // Nếu nội dung phù hợp, tiếp tục xử lý
        next();
    } catch (error) {
        console.error("Content moderation error:", error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: "Lỗi khi kiểm duyệt nội dung",
            error: error.message
        });
    }
};