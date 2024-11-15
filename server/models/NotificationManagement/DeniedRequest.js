const mongoose = require("mongoose");

const deniedRequestSchema = new mongoose.Schema({
    moduleCode: {
        type: String,
        required: true,
    },
    moduleName: {
        type: String,
        required: true,
    },
    sessionType: {
        type: String,
        required: true,
    },
    lecturerName: {
        type: String,
        required: true,
    },
    currentDate: {
        type: Date,
        required: true,
    },
    currentTime: {
        type: String,
        required: true,
    },
    newDate: {
        type: Date,
        required: true,
    },
    newTime: {
        type: String,
        required: true,
    },
    specialNotes: {
        type: String,
    },
    status: {
        type: String,
    },
    createdAt: {
        type: Date,
    },
    /* isResolved: {
        type: Boolean,
        default: false,
    }, */
    adminName: String,
    approvedOrDeniedAt: {
        type: Date,
    },
})

const DeniedRequest = mongoose.model("DeniedRequest", deniedRequestSchema);
module.exports = DeniedRequest;