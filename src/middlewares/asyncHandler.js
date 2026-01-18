


const asyncErrorHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

const errorHandlerMiddleware = (err, req, res, next) => {
    console.log("❌ Error at : ", req.path, "\nError Message : ", err.message || "null");


    res.status(err.statusCode || 500).json({
        success: false,
        message: err.message || 'internal server error'
    })

}

module.exports = {
    asyncErrorHandler,
    errorHandlerMiddleware
}