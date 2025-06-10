import { ApiError } from "../utils/ApiError.js";

const globalErrorHandler = (err, req, res, next) => {
    // Handle Mongoose Validation Errors
    if (err.name === "ValidationError") {
        const errors = Object.values(err.errors).map((e) => e.message);
        const message = errors.length > 0 ? errors[0] : "Validation error";
        err = new ApiError(400, message, errors);
    }

    // Handle Mongoose Duplicate Key Error (e.g., unique username or email)
    if (err.code === 11000) {
        const keys = Object.keys(err.keyValue || {});
        const field = keys.length > 0 ? keys[0] : "field";
        const message = `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`;
        err = new ApiError(400, message, [message]);
    }

    // Handle Mongoose CastError (e.g., invalid ObjectId)
    if (err.name === "CastError") {
        err = new ApiError(400, `Invalid ${err.path}: ${err.value}`);
    }

    if (err instanceof ApiError) {
        return res.status(err.statusCode).json({
            status: err.statusCode,
            message: err.message,
            success: err.success,
            errors: err.errors,
            stack: process.env.NODE_ENV === "dev" ? err.stack : undefined,
        });
    }

    // Handle generic errors
    return res.status(500).json({
        success: false,
        message: err.message || "Internal Server Error",
        errors: [],
        stack: process.env.NODE_ENV === "dev" ? err.stack : undefined,
    });
};

export default globalErrorHandler;