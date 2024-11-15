const mongoose = require("mongoose");

const startTimeSchema = mongoose.Schema({
  index: { type: Number, required: true, min: 1, max: 9 },
  name: { type: String, required: true, trim: true, minLength: 3 },
});
const StartTime = mongoose.model("StartTime", startTimeSchema, "StartTimes");

exports.StartTime = StartTime;
exports.startTimeSchema = startTimeSchema;
