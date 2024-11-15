const mongoose = require("mongoose");

const rescheduleSchema = new mongoose.Schema({
  moduleName: {
    type: String,
    required: true,
  },
  sessionType: {
    type: String,
    required: true,
    enum: ["Lecture", "Lab", "Workshop"],
  },
  currentDate: {
    type: String,
    required: true,
  },
  currentTime: {
    type: String,
    required: true,
  },
  newDate: {
    type: String,
    required: true,
  },
  newTime: {
    type: String,
    required: true,
  },
  specialNotes: {
    type: String,
  },
  isApproved: {
    type: Boolean,
    default: false,
  },
  isDenied: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  lecturerName: {
    type: String,
    required: true,
  },
  isResolved: {
    type: Boolean,
    default: false,
  },
});

const Reschedule = mongoose.model("Reschedule", rescheduleSchema);

module.exports = Reschedule;