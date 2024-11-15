const mongoose = require("mongoose");

const reportRequestSchema = new mongoose.Schema({
    startDate: {
        type: Date,
        required: true,
    },
    endDate: {
        type: Date,
        required: true,
    },
    moduleCode: {
        type: String,
        // required: true,
    },
    // moduleName: {
    //     type: String,
    //     required: true,
    // },
    sessionType: {
        type: String,
        // required: true,
    },
    lecturerName: {
        type: String,
         // required: true,
    },
    status: {
        type: String,
        // required: true,
    },
    lecturerEmail: {
        type: String,
        // required: true,
    },
    isEmailSent: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
    isNotValid: { type: Boolean, default: false },
});

const ReportRequest = mongoose.model("ReportRequest", reportRequestSchema);

module.exports = ReportRequest;