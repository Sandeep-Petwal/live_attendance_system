const express = require('express')
const router = require('./src/routes/routes')
const { errorHandlerMiddleware } = require('./src/middlewares/asyncHandler')
const connectMongodb = require('./src/db/db')
require('dotenv').config()
const app = express()

const PORT = process.env.PORT || 3000


// Main Router, and global async error handler
app.use("/api", router)
app.use(errorHandlerMiddleware);

// Database connection
connectMongodb().catch(err => {
    console.log("Error in mongodb connection : ", err);
    
})


app.listen(3000, () => {
    console.log(`Server is running on http://localhost:${PORT}`)
})



module.exports = { app }