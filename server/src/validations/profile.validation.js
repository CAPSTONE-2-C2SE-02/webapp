import Joi from "joi";

const profileSchema = Joi.object({
    fullName: Joi.string().required().messages({
        "string.empty": "Full name is required.",
        "string.min": "Full name must be at least 3 characters.",
        "string.max": "Full name must not exceed 50 characters.",
    }),
    email: Joi.string().email().required().messages({
        "string.empty": "Email is required.",
        "string.email": "Invalid email format.",
    }),
    phoneNumber: Joi.string().pattern(/^[0-9]{10,11}$/).required().messages({
        "string.empty": "Phone number is required.",
        "string.pattern.base": "Phone number must be 10-11 digits.",
    }),
    address: Joi.string().optional(),
    profilePicture: Joi.string().optional(),
    bio: Joi.string().max(500).optional().messages({
        "string.max": "Bio must not exceed 500 characters.",
    }),
    active: Joi.boolean().default(true),
});

export { profileSchema };
