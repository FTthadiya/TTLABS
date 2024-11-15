const mongoose = require("mongoose");

const requestSchema = new mongoose.Schema({
    moduleCode: String,
    moduleName: String,
    sessionType: String,
    lecturerName: String,
    previousDate: Date,
    previousTime: String,
    currentDate: Date,
    currentTime: String,
    specialNotes: String,
    status: String,
    createdAt: {
        type: Date,
        default: Date.now,
    },
    isResolved: {
        type: Boolean,
        default: false,
    },
    adminName: String,
    approvedOrDeniedAt: {
        type: Date,
        default: null,
    },
    /* isEmailSent: { type: Boolean, required: true, default: false }, */
})

const Request = mongoose.model("Request", requestSchema);
module.exports = Request;