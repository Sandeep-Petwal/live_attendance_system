import mongoose from 'mongoose';
const { Schema } = mongoose;

const userSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        required: true,
        ref : "User",
        enum: {
            values: ['teacher', 'student'],
            message: '{VALUE} is not a valid role'
        }
    }
});

export const User = mongoose.model("user", userSchema);