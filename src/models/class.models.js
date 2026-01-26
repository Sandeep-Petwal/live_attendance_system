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
        ref: "User"
    },
    studentIds: {
        type: [{
            type: ObjectId,
            ref: "User"
        }]
    }
})


const Class = mongoose.model("Class", classSchema)
module.exports = Class