const mongoose = require("mongoose");

const rescheduledSessionSchema = new mongoose.Schema({
  moduleName: { type: String, required: true },
  sessionType: { type: String, required: true },
  lecturerName: { type: String, required: true },
  previousDate: { type: Date, required: true },
  currentDate: { type: Date, required: true },
  previousTime: { type: String, required: true },
  currentTime: { type: String, required: true },
  specialNotes: { type: String },
  studentEmails: { type: [String], required: true },
});

const RescheduledSession = mongoose.model(
  "RescheduledSession",
  rescheduledSessionSchema
);

module.exports = RescheduledSession;