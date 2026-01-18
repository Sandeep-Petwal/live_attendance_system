const { ZodError } = require("zod");



const asyncErrorHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

const errorHandlerMiddleware = (err, req, res, next) => {

    if (err instanceof ZodError) {
        console.log(
            "❌ Zod Error at :", req.path,
        );


        return res.status(400).json({
            success: false,
            message: "Validation failed",
            errors: err.issues.map(issue => ({
                field: issue.path.join("."),
                message: issue.message,
            })),
        });
    }

    console.log(
        "❌ Error at :", req.path,
        "\nError Message :", err.message || "null"
    );


    res.status(err.statusCode || 500).json({
        success: false,
        error: err.message || "internal server error",
    });
};


module.exports = {
    asyncErrorHandler,
    errorHandlerMiddleware
}