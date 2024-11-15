const mongoose = require("mongoose");

const studentListSchema = new mongoose.Schema({
    studentId: String,
    studentName: String,
    enrolledModules: [String]

})

const StudentList = mongoose.model("StudentList", studentListSchema);
module.exports = StudentList;