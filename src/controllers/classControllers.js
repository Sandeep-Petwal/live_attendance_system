const express = require("express");
const authMiddleware = require("../middlewares/auth");
const { addStudentShema, classSchema } = require("../routes/zodSchemas");

const classRoutes = express.Router();
const Class = require("../models/class.models");



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



module.exports = {
    createClass,
    addStudentToClass,
    getClass
}