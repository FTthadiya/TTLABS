const mongoose = require("mongoose");
const Joi = require("joi");
Joi.objectId = require("joi-objectid")(Joi);

const lecturerSchema = mongoose.Schema({
  _id: { type: mongoose.Schema.Types.ObjectId, required: true },
  lecturerName: { type: String, required: true, trim: true, minLength: 3 },
  email: {
    type: String,
    required: true,
    trim: true,
    minLength: 3,
    lowercase: true,
    unique: true,
  },
});

const Lecturer = mongoose.model("Lecturer", lecturerSchema, "Lecturers");

function validateLecturer(lecturer) {
  schema = {
    _id: Joi.objectId().required(),
    lecturerName: Joi.string().min(3).required().trim(),
    email: Joi.string().email().min(3).required(),
  };
  return Joi.object(schema).validate(lecturer);
}

async function doesExists(lecturer) {
  const newName = lecturer.lecturerName.trim();
  const lowerEmail = lecturer.email.trim().toLowerCase();

  const isUnique = await Lecturer.findOne({
    lecturerName: newName,
    email: lowerEmail,
  });

  return !!isUnique;
}

exports.Lecturer = Lecturer;
exports.validate = validateLecturer;
exports.doesExists = doesExists;
