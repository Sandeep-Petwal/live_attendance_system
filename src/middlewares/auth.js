const jwt = require('jsonwebtoken');
const { userProfileSchema } = require('../routes/zodSchemas');
const jwtSecret = process.env.JWT_SECRET || 'verystrongsecret'



const authMiddleware = async (req, res, next) => {
    const cookies = req.cookies;
    const token = cookies.token;
    if (!token) {
        return res.status(401).json({
            success: false,
            error: "Unauthorized, token missing or invalid"
        })
    }

    // Verify JWT token
    const user = jwt.verify(token, jwtSecret);
    const { userId, role } = user;
    userProfileSchema.parse({
        userId,
        role
    })

    // attach user to req
    req.userId = userId
    req.role = role

    // call next
    next()
}

module.exports = authMiddleware