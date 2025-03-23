import { StatusCodes } from "http-status-codes";

export const validate = (schema) => async (req, res, next) => {
    try {
        req.body = await schema.validate(req.body, { abortEarly: false });

        next();
    } catch (error) {
        return res.status(StatusCodes.BAD_REQUEST).json({
            success: false,
            message: "Validation failed",
            errors: error.inner.map((err) => ({
                field: err.path,
                message: err.message,
            })),
        });
    }
};
