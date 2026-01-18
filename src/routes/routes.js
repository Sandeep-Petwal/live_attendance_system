const express = require('express');
const {asyncErrorHandler : catchErrors} = require('../middlewares/asyncHandler');
const router = express.Router();


router.get("/health", (req, res) => {
    const date = new Date()
    const dateString = date.toDateString()
    const timeString = date.toLocaleTimeString()
    res.status(200).json({
        success : "true",
        data : {
            date : dateString + ", " + timeString,
        }
    })
})




module.exports = router;