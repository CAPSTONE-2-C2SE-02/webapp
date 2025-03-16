import Joi from "joi";

const userSchema = Joi.object({
    password: Joi.string().min(6).max(30).required().messages({
        "string.empty": "Password is required.",
        "string.min": "Password must be at least 6 characters.",
        "string.max": "Password must not exceed 30 characters.",
    })
});

export { userSchema };
