const express = require("express");
const authMiddleware = require("../middlewares/auth");
const { classSchema, addStudentShema } = require("./zodSchemas");
const classRoutes = express.Router();
const Class = require("../models/class.models");
const { createClass, addStudentToClass, getClass } = require("../controllers/classControllers");



// Auth Required: Yes (Teacher only)
classRoutes.post("/class", authMiddleware, createClass)

// add student
// Auth Required: Yes (Teacher only, must own the class)
classRoutes.post("/class/:id/add-student", authMiddleware, addStudentToClass)

//  GET /class/:id
// **Auth Required:** Yes (Teacher who owns class OR Student enrolled in class)
// Note: Populate students array with full user details
classRoutes.get("/class/:id", authMiddleware, getClass)


module.exports = classRoutes;