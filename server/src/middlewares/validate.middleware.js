import { StatusCodes } from "http-status-codes";

export const validateFormData = (schema, isUpdate = false) => async (req, res, next) => {
    try {
        let request;
        try {
            request = JSON.parse(req.body.request);
        } catch (err) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                message: "Invalid JSON format in request body",
                error: err.message
            });
        }

        const validatedData = isUpdate
            ? schema.omit(["profileId"]).validate(request, { abortEarly: false })
            : schema.validate(request, { abortEarly: false });

        req.body = await validatedData;

        next();
    } catch (error) {
        return res.status(StatusCodes.BAD_REQUEST).json({
            message: "Validation failed",
            errors: error.inner.map((err) => ({
                field: err.path,
                message: err.message,
            })),
        });
    }
};


export const validateJsonBody = (schema, isUpdate = false) => async (req, res, next) => {
    try {
        const validatedData = isUpdate
            ? schema.omit(["profileId"]).validate(req.body, { abortEarly: false })
            : schema.validate(req.body, { abortEarly: false });

        req.body = await validatedData;
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
