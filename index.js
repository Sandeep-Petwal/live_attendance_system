const express = require('express')
const cookieParser = require('cookie-parser');

const router = require('./src/routes/routes')
const { errorHandlerMiddleware } = require('./src/middlewares/asyncHandler')
const connectMongodb = require('./src/db/db')
require('dotenv').config()
const app = express()

const PORT = process.env.PORT || 3000


// Parse JSON bodies
app.use(express.json());
app.use(cookieParser());


// Main Router, and global async error handler
app.use("/", router)
app.use(errorHandlerMiddleware);

// Database connection
connectMongodb().catch(err => {
    console.log("Error in mongodb connection : ", err);
    
})


app.listen(3000, () => {
    console.log(`Server is running on http://localhost:${PORT}`)
})



module.exports = { app }