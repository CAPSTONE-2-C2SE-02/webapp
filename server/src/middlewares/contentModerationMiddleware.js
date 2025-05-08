import { moderatePostContent } from "../utils/contentModeration.util.js";
import { StatusCodes } from "http-status-codes";

export const contentModerationMiddleware = async (req, res, next) => {
    try {
        const postData = req.body;
        
        // Perform content moderation
        const moderationResult = await moderatePostContent(postData);
        
        if (moderationResult.isInappropriate) {
            // Handle response based on moderation type
            let responseMessage = 'Your post contains inappropriate content';
            let additionalData = {};
            
            // Customize response based on detection source
            switch (moderationResult.source) {
                case 'openai_moderation':
                    responseMessage = 'The moderation system has detected content that violates community standards';
                    additionalData = {
                        categories: moderationResult.categories || []
                    };
                    break;
                    
                case 'ai_semantic_analysis':
                    responseMessage = 'Semantic analysis has detected inappropriate language';
                    additionalData = {
                        categories: moderationResult.categories || [],
                        examples: moderationResult.inappropriateWords || []
                    };
                    break;
                    
                case 'context_analysis':
                    responseMessage = moderationResult.explanation || 'Inappropriate content detected based on context';
                    additionalData = {
                        severity: moderationResult.severity || 'medium',
                        offendingElements: moderationResult.offendingElements || []
                    };
                    break;
                    
                default:
                    // Default case
                    responseMessage = moderationResult.message || 'Your post contains inappropriate content';
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
        
        // If content is appropriate, continue processing
        next();
    } catch (error) {
        console.error("Content moderation error:", error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: "Error while moderating content",
            error: error.message
        });
    }
};