const { z } = require('zod')



const userSignUpSchema = z.object({
    name: z.string(),
    email: z.string().email(),
    password: z.string(),
    role: z.enum(['student', 'teacher'])
})

const userLoginSchema = z.object({
    email: z.string().email(),
    password: z.string()
})

const userProfileSchema = z.object({
    userId: z.string(),
    role: z.enum(['student', 'teacher'])
})








module.exports = {
    userSignUpSchema,
    userLoginSchema,
    userProfileSchema
}