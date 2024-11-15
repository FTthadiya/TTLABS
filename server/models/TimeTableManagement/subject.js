const Joi = require("joi");
const mongoose = require("mongoose");
const { specBatchSchema } = require("./specBatch");

const lecturerSchema = mongoose.Schema({
  lecturerName: { type: String, required: true, trim: true, minLength: 3 },
  email: {
    type: String,
    required: true,
    trim: true,
    minLength: 3,
    lowercase: true,
  },
});

const subjectSchema = mongoose.Schema({
  subjectName: { type: String, required: true, trim: true, minLength: 3 },
  subjectCode: { type: String, required: true, trim: true, minLength: 3 },
  sessionType: {
    type: String,
    required: true,
    trim: true,
    minLength: 3,
    enum: ["Lecture", "Lab", "Tute", "Workshop", "Seminar"],
  },
  studentCount: { type: Number, required: true, min: 1, max: 150 },
  duration: { type: Number, required: true, min: 1, max: 5 },
  lecturer: { type: lecturerSchema, required: true },
  specBatches: {
    type: [specBatchSchema],
  },
});

const Subject = mongoose.model("Subject", subjectSchema, "Subjects");

function validateSubject(subject) {
  schema = {
    subjectName: Joi.string().min(3).required().trim(),
    subjectCode: Joi.string().min(3).required().trim(),
    sessionType: Joi.string()
      .required()
      .trim()
      .min(3)
      .valid("Lecture", "Lab", "Tute", "Workshop", "Seminar"),
    studentCount: Joi.number().integer().min(1).max(150).required(),
    duration: Joi.number().integer().min(1).max(5).required(),
    lecturerId: Joi.objectId().required(),
    specBatchesIds: Joi.array().items(Joi.objectId()).required(),
  };

  return Joi.object(schema).validate(subject);
}

async function doesExists(subject) {
  try {
    const newName = subject.subjectName.trim();
    const newSubjectCode = subject.subjectCode.trim();
    const newSessionType = subject.sessionType.trim();

    const isUnique = await Subject.findOne({
      subjectName: { $regex: new RegExp("^" + newName + "$", "i") },
      subjectCode: { $regex: new RegExp("^" + newSubjectCode + "$", "i") },
      sessionType: { $regex: new RegExp("^" + newSessionType + "$", "i") },
    });
    return !!isUnique;
  } catch (error) {
    console.error("Error checking uniqueness:", error);
    return false;
  }
}

exports.Subject = Subject;
exports.subjectSchema = subjectSchema;
exports.validate = validateSubject;
exports.doesExists = doesExists;
