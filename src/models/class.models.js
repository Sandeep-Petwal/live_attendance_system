const mongoose = require('mongoose');
const { Schema } = mongoose;
const { ObjectId } = Schema.Types

const classSchema = new Schema({
    className: {
        type: String,
        required: true
    },
    teacherId: {
        type: ObjectId,
        required: true,
        ref : "User"
    },
    studentIds: [ObjectId]
})


export const Class = mongoose.model("class", classSchema)