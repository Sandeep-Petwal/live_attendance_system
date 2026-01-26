const express = require("express");
const authMiddleware = require("../middlewares/auth");
const { classSchema, addStudentShema } = require("./zodSchemas");
const classRoutes = express.Router();
const Class = require("../models/class.models");
const { createClass, addStudentToClass, getClass, getMyAttendance, startAttendanceSession, clearAttendaceSession } = require("../controllers/classControllers");



// Auth Required: Yes (Teacher only)
classRoutes.post("/class", authMiddleware, createClass)

// add student
// Auth Required: Yes (Teacher only, must own the class)
classRoutes.post("/class/:id/add-student", authMiddleware, addStudentToClass)

//  GET /class/:id
// **Auth Required:** Yes (Teacher who owns class OR Student enrolled in class)
// Note: Populate students array with full user details
classRoutes.get("/class/:id", authMiddleware, getClass)


//  GET /class/:id/my-attendance
// **Auth Required:** Yes (Student only, must be enrolled in class)
// Note: Check MongoDB Attendance collection for persisted record
classRoutes.get("/class/:id/my-attendance", authMiddleware, getMyAttendance)


// ### 9. POST /attendance/start
// **Auth Required:** Yes (Teacher only, must own the class)
// Purpose: Starts a new attendance session. Sets the active class in memory. Only one session can be active at a time.
classRoutes.post("/attendance/start", authMiddleware, startAttendanceSession);


// Clear attendance session
classRoutes.post("/attendance/clear", authMiddleware, clearAttendaceSession);


module.exports = classRoutes;