const mongoose = require("mongoose");
const mongoDB = "mongodb://127.0.0.1:27017/attendance_system";



async function connectMongodb() {
    mongoose.connect(mongoDB)
        .then(() => {
            console.log("✅Mongodb connected");
        })
        .catch((e) => {
            console.log("❌ Error while connecting to mongoDB , Error : ", e);
        })
}

module.exports = connectMongodb