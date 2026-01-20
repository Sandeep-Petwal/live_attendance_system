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
const { signUp, login, logout, getOwnProfile, getAllStudents } = require("../controllers/userControllers");



// Sign up
userRoutes.post("/auth/signup", signUp)



// Log in
userRoutes.post("/auth/login", login)


// Logout
userRoutes.post("/auth/logout", logout);


// Me
userRoutes.get("/auth/me", authMiddleware, getOwnProfile)


// GET /students
// **Auth Required:** Yes (Teacher only)
// Note: Returns all users with role "student"
userRoutes.get("/students", authMiddleware, getAllStudents)




module.exports = userRoutes;