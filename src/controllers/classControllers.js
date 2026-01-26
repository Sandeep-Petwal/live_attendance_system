const express = require("express");
const authMiddleware = require("../middlewares/auth");
const { addStudentShema, classSchema, getMyAttendanceSchema, startAttendanceSchema } = require("../routes/zodSchemas");

const classRoutes = express.Router();
const Class = require("../models/class.models");
const User = require("../models/user.models")
const Attendance = require("../models/attendance.models")

let activeAttendanceSession = {}



// Auth Required: Yes (Teacher only)
const createClass = async (req, res) => {
    const { userId, role } = req;
    const className = req?.body?.className
    console.log('\n\nuserId', userId)
    console.log('role', role)

    classSchema.parse({ className, role });

    // check if class already exits
    const existingClass = await Class.findOne({ className });
    console.log('existingClass', existingClass)
    if (existingClass?._id) {
        return res.status(400).json({
            success: false,
            error: "Class already exists"
        })

    }

    // Create a class if not already exists
    const newClass = await Class.create({
        className,
        teacherId: userId
    })
    console.log('newClass', newClass);


    if (newClass._id) {
        return res.status(201).json({
            success: true,
            data: newClass
        })
    }
};

// add student
// Auth Required: Yes (Teacher only, must own the class)
const addStudentToClass = async (req, res) => {

    const { studentId } = addStudentShema.parse(req.body || {});
    const classId = req?.params?.id;
    const userId = req.userId;
    const role = req.role

    // Forbidden - Role Check (403)
    if (role !== 'teacher') {
        return res.status(403).json({
            success: false,
            error: "Forbidden, teacher access required"
        })
    }

    const existingClass = await Class.findOne({ _id: classId });

    // check class exists
    if (!existingClass) {
        return res.status(404).json({ success: false, error: "Class not found" });
    }

    // Forbidden - Ownership Check (403)
    if (!existingClass.teacherId.equals(userId)) {
        return res.status(403).json({ success: false, error: "Forbidden, not class teacher" });
    }

    // Check if studeing already exists in the class
    if (existingClass.studentIds.includes(studentId)) {
        return res.status(400).json({ success: false, error: "Student already exists" });
    }

    // Check if student is valid
    const student = await User.findOne({
        _id: studentId,
        role: 'student'
    });

    if (!student) {
        return res.status(404).json({ success: false, error: "User not found" });
    }


    // push unique student and return updated one
    const updatedClass = await Class.findOneAndUpdate({
        _id: classId,
        studentIds: { $ne: studentId }
    }, {
        $addToSet: { studentIds: studentId }
    }, {
        new: true
    })


    return res.status(201).json({
        success: true,
        data: updatedClass
    })
}



//  GET /class/:id
// **Auth Required:** Yes (Teacher who owns class OR Student enrolled in class)
// Note: Populate students array with full user details
const getClass = async (req, res) => {
    const classId = req?.params?.id;
    const userId = req.userId;
    const role = req.role

    console.log('\n\n\nclassId', classId)
    console.log('userId', userId)

    // get the class details
    const existingClass = await Class.findOne({ _id: classId }).populate('studentIds', '-password -role')
    if (!existingClass) {
        return res.status(404).json({ success: false, error: "Class not found" });
    }

    // Auth check 
    if (role === 'teacher' && !existingClass.teacherId.equals(userId)) {
        return res.status(403).json({ success: false, error: "Forbidden, not class teacher" });
    } else if (role === 'student' && !existingClass.studentIds.includes(userId)) {
        return res.status(403).json({ success: false, error: "Forbidden, not class student" });
    }

    // Return class successfully
    return res.status(201).json({
        success: true,
        data: existingClass
    })
}


//  GET /class/:id/my-attendance
// **Auth Required:** Yes (Student only, must be enrolled in class)
// Note: Check MongoDB Attendance collection for persisted record
const getMyAttendance = async (req, res) => {
    const role = req?.role;
    const userId = req?.userId
    const { classId } = getMyAttendanceSchema.parse({
        classId: req?.params?.id
    });
    console.log('classId', classId)


    // Auth check 
    if (role !== 'student') {
        return res.status(403).json({ success: false, error: "Not a student" });
    }


    // Check if student is enrolled in class
    const studentClass = await Class.findById(classId);
    if (!studentClass) {
        return res.status(404).json({ success: false, error: "Class not found" });
    } else if (!studentClass?.studentIds.includes(userId)) {
        return res.status(403).json({ success: false, error: "User not enrolled in the class" });
    }


    // check attendance status 
    const attendance = await Attendance.findOne({
        classId,
        status: "present"
    });

    if (!attendance) {
        res.status(200).json({ success: true, data: { classId: classId, status: attendance?.status || null } })
    }

    return res.status(200).json({ success: true, data: { classId, status: attendance?.status || null } })
}




// ### 9. POST /attendance/start
// **Auth Required:** Yes (Teacher only, must own the class)
// Purpose: Starts a new attendance session. Sets the active class in memory. Only one session can be active at a time.
const startAttendanceSession = async (req, res) => {
    const role = req?.role;
    const userId = req?.userId

    const { classId } = startAttendanceSchema.parse(req.body || {});
    // Teacher only, must own the class
    if (role !== 'teacher') {
        return res.status(403).json({ success: false, error: "Forbidden, not class teacher" });
    }


    // check if class exists 
    const classToStartAttend = await Class.findById(classId);
    if (!classToStartAttend) {
        return res.status(404).json({ success: false, error: "Class not found" });
    } else if (!classToStartAttend.teacherId.equals(userId)) {
        return res.status(403).json({ success: false, error: "Forbidden, not class teacher" });
    }

    // check if session already exists
    if (activeAttendanceSession?.classId) {
        return res.status(400).json({ success: false, error: "A session is already active" });
    }

    // Starts a new attendance session
    activeAttendanceSession = {
        classId,
        startedAt: new Date().toISOString(),
        attendance: {}
    }

    return res.status(200).json({ success: true, data: activeAttendanceSession });
}


// Clear attendance session
const clearAttendaceSession = async (req, res) => {
    const role = req?.role;
    const userId = req?.userId

    const { classId } = startAttendanceSchema.parse(req.body || {});

    if (role !== 'teacher') {
        return res.status(403).json({ success: false, error: "Forbidden, not class teacher" });
    }


    // check if class exists 
    const classToClear = await Class.findById(classId);
    if (!classToClear) {
        return res.status(404).json({ success: false, error: "Class not found" });
    } else if (!classToClear.teacherId.equals(userId)) {
        return res.status(403).json({ success: false, error: "Forbidden, not class teacher" });
    }

    if (activeAttendanceSession?.classId !== classId) {
        return res.status(400).json({ success: false, error: "Class attendance session is not active" });
    }

    activeAttendanceSession = {}
    return res.status(200).json({ success: false, error: "Session cleared" });

}





module.exports = {
    createClass,
    addStudentToClass,
    getClass,
    getMyAttendance,
    startAttendanceSession,
    clearAttendaceSession
}