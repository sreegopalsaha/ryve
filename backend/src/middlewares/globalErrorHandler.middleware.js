import ApiError from "../utils/ApiError.js";

const globalErrorHandler = (err, req, res, next) => {
    if (err instanceof ApiError) {
        return res.status(err.statusCode).json({
            status: statusCode,
            message: err.message,
            success: err.success,
            errors: err.errors,
            stack: process.env.NODE_ENV === "dev" ? err.stack : undefined,
        });
    }
    
    // Handle generic errors
    return res.status(500).json({
        success: false,
        message: "Internal Server Error",
        errors: [],
        stack: process.env.NODE_ENV === "dev" ? err.stack : undefined,
    });
}

export default globalErrorHandler;