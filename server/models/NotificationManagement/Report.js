const mongoose = require("mongoose");
const ApprovedRequest = require("../../models/NotificationManagement/ApprovedRequest");
const DeniedRequest = require("../../models/NotificationManagement/DeniedRequest");

/* const subReportSchema = new mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  moduleCode: String,
  moduleName: String,
  sessionType: String,
  lecturerName: String,
  currentDate: Date,
  currentTime: String,
  newDate: Date,
  newTime: String,
  specialNotes: String,
  status: String,
  createdAt: Date,
  adminName: String,
  approvedOrDeniedAt: Date,
  isEmailSent: Boolean,
  studentEmails: [String],
}); */

const reportSchema = new mongoose.Schema({
  report_name: String,
  filterCriteria: {
    startDate: Date,
    endDate: Date,
    moduleCode: {
      type: String,
  },
    sessionType: {
      type: String,
  },
    lecturerName: {
      type: String,
  },
    status: {
      type: String,
  },
  },
  /* approved: [subReportSchema],
  denied: [subReportSchema], */
  approved: [ApprovedRequest.schema],
  denied: [DeniedRequest.schema],
  createdAt: { type: Date, default: Date.now },
});

const Report = mongoose.model("Report", reportSchema);

module.exports = Report;
