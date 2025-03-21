import { StatusCodes } from "http-status-codes";

export const validateFormData = (schema) => async (req, res, next) => {
    try {
        let request;
        try {
            request = JSON.parse(req.body.request);
        } catch (err) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                success: false,
                message: "Invalid JSON format in request body",
                error: err.message,
            });
        }

        req.body = await schema.validate(request, { abortEarly: false });

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

export const validateJsonBody = (schema) => async (req, res, next) => {
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
