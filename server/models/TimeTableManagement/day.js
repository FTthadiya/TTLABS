const mongoose = require("mongoose");

const daySchema = mongoose.Schema({
  index: { type: Number, required: true, min: 1, max: 5 },
  name: { type: String, required: true, trim: true, minLength: 3 },
});
const Day = mongoose.model("Day", daySchema, "Days");

exports.Day = Day;
exports.daySchema = daySchema;
