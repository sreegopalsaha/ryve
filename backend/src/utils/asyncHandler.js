const asyncHandler = (func) => {
    return async (req, res, next) => {
        try {
            await func(req, res, next);
        } catch (error) {
            if (error instanceof Error) {
                return res.status(error.statusCode || 500).json({
                    success: false,
                    message: error.message,
                    errors: error.errors || [],
                    data: null
                });
            }
            return res.status(500).json({
                success: false,
                message: "Internal Server Error",
                errors: [],
                data: null
            });
        }
    };
};

export default asyncHandler;