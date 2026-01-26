const { z } = require('zod')


// User
const userSignUpSchema = z.object({
    name: z.string(),
    email: z.string().email(),
    password: z.string().min(6),
    role: z.enum(['student', 'teacher'])
})

const userLoginSchema = z.object({
    email: z.string().email(),
    password: z.string()
})

const userAuthSchema = z.object({
    userId: z.string(),
    role: z.enum(['student', 'teacher'])
})


// class
const classSchema = z.object({
    className: z.string().min(3),
    role: z.enum(['teacher'])
})

const addStudentShema = z.object({
    studentId: z.string()
})


const getMyAttendanceSchema = z.object({
    classId: z.string()
})

const startAttendanceSchema = z.object({
    classId: z.string()
})




module.exports = {
    userSignUpSchema,
    userLoginSchema,
    userAuthSchema,
    classSchema,
    addStudentShema,
    getMyAttendanceSchema,
    startAttendanceSchema
}