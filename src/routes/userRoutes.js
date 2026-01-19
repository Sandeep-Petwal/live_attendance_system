const express = require("express");
const userRoutes = express.Router();
require('dotenv').config()
const bcrypt = require('bcrypt');
const saltRounds = 10;
var jwt = require('jsonwebtoken');
const jwtSecret = process.env.JWT_SECRET || 'verystrongsecret'
const { asyncErrorHandler: catchErrors } = require('../middlewares/asyncHandler');
const User = require("../models/user.models");
const { userSignUpSchema, userLoginSchema } = require('./zodSchemas');
const authMiddleware = require('../middlewares/auth');



// Sign up
userRoutes.post("/auth/signup", catchErrors(async (req, res) => {
    // Zod validation , auto error handling by catchErrors
    const { name, email, password, role } = userSignUpSchema.parse(req.body || {})

    // Check if user already exists by email
    const existingUser = await User.findOne({
        email
    })

    if (existingUser?.email) {
        return res.status(400).json({
            success: false,
            error: "Email already exists"
        })
    }

    // encrypt  the password
    const encryptedPassword = await bcrypt.hash(password, saltRounds)

    // Create new user
    const newUser = await User.create({
        name,
        email,
        password: encryptedPassword,
        role
    })

    if (newUser) {
        return res.status(201).json({
            success: true,
            data: newUser
        })
    }

}))



// Log in
userRoutes.post("/auth/login", catchErrors(async (req, res) => {

    console.log('req.cookies', req.cookies);
    console.log('req.body', req.body)

    // check valid fields , auto error handling
    const { email, password } = userLoginSchema.parse(req.body || {});

    // check if email exists in db
    const existingUser = await User.findOne({ email });
    if (!existingUser?.email) {
        return res.status(404).json({
            success: false,
            error: "User not found",
        })
    }

    // check password if user exists
    const isValidPassword = await bcrypt.compare(password, existingUser.password);
    if (!isValidPassword) {
        return res.status(400).json({
            success: false,
            error: "Invalid email or password",
        })
    }


    // email password is correct
    // create jwt and attach it to cookies
    const token = await jwt.sign({
        userId: existingUser._id,
        role: existingUser.role
    }, jwtSecret);

    console.log('token', token)

    // attach token to a cookie
    res.cookie('token', token, { maxAge: 24 * 60 * 60 * 1000, httpOnly: true })
    res.header('Authorization', token)



    return res.status(200).json({
        success: true,
        data: {
            token
        }
    })

}))


// Logout
userRoutes.post("/auth/logout", authMiddleware, catchErrors(async (req, res) => {
    // user does not exists , logout and clear all cookies
    res.clearCookie("token");
    return res.status(200).json({
        success: true,
        data: "Logged out successfully!"
    })
}));


// Me
userRoutes.get("/auth/me", authMiddleware, catchErrors(async (req, res) => {
    const userId = req.userId;

    // Get user by id 
    const user = await User.findById(userId).select("-password")
    if (!user?.email) {
        // user does not exists , logout and clear all cookies
        res.clearCookie("token");
        return res.status(401).json({
            success: false,
            error: "Unauthorized, token missing or invalid"
        })
    }

    // User exists and valid
    return res.status(200).json({
        success: true,
        data: user
    })
}))








module.exports = userRoutes;