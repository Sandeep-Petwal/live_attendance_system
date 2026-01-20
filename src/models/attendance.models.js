const mongoose = require("mongoose");
const { Schema } = mongoose;
const { ObjectId } = Schema.Types


const attendanceSchema = new Schema({
    classId: {
        type: ObjectId,
        required: true,
        ref : "Class"
    },
    studentId: {
        type: ObjectId,
        required: true,
        ref : 'User'
    },
    status: {
        type: String,
        enum: {
            values: ["present", "absent"],
            message: '{VALUE} is not a valid status'
        }
    }

})


export const attendance = mongoose.model('Attendance', attendanceSchema);