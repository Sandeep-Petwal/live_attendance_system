require('dotenv').config()
const express = require('express');
const userRoutes = require('./userRoutes');
const classRoutes = require('./classRoutes');

const router = express.Router();


router.get("/", (req, res) => {
    const date = new Date()
    const dateString = date.toDateString()
    const timeString = date.toLocaleTimeString()
    res.status(200).json({
        success: "true",
        data: {
            date: dateString + ", " + timeString,
        }
    })
})

// User routes
router.use("/", userRoutes)

// Class routes
router.use("/",classRoutes)


module.exports = router;