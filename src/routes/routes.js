const express = require('express');
const router = express.Router();


// Test Route
router.get("/health", (req, res) => {
    const now = Date.now();
    const dateString = now.toLocaleDateString()
    console.log('\n=>>> dateString', dateString)
    res.status(200).json({
        success : "true",
        data : {
            date : now,
            dateString
        }
    })
})





module.exports = router;