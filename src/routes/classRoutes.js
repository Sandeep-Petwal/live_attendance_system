const express = require("express");
const authMiddleware = require("../middlewares/auth");
const { classSchema, addStudentShema } = require("./zodSchemas");
const classRoutes = express.Router();
const Class = require("../models/class.models");



// Auth Required: Yes (Teacher only)
classRoutes.post("/class", authMiddleware, async (req, res) => {
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
})

// add student
// Auth Required: Yes (Teacher only, must own the class)
classRoutes.post("/class/:id/add-student", authMiddleware, async (req, res) => {

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
    if (!existingClass?._id) {
        return res.status(404).json({
            success: false,
            error: "Class not found"
        })
    }

    // Forbidden - Ownership Check (403)
    if (!existingClass.teacherId.equals(userId)) {
        return res.status(403).json({
            success: false,
            error: "Forbidden, not class teacher"
        })
    }

    console.log('\n\n existingClass', existingClass)


    console.log('classId', classId)
    console.log('studentId', studentId)
    // push student
    const updatedClass = await Class.findOneAndUpdate({
        _id: classId
    }, {
        $addToSet: { studentIds: studentId }
    }, {
        new: true
    })

    console.log('updatedClass', updatedClass)

    return res.status(201).json({
        success: true,
        data: updatedClass
    })



})





module.exports = classRoutes;