const Joi = require("joi");
const mongoose = require("mongoose");
const { subjectSchema } = require("./subject");
const { daySchema } = require("./day");
const { startTimeSchema } = require("./startTime");
const { currSemFunctionSchema, CurrSemFunction } = require("./functionality");

const lectureHallSchema = mongoose.Schema({
  _id: { type: String, default: "" },
  hallid: { type: String, default: "" },
  capacity: { type: Number, default: 0 },
  assigned: { type: Boolean, default: false },
});

const TimetableSchema = mongoose.Schema({
  currSemester: { type: currSemFunctionSchema, required: true },
  subject: { type: subjectSchema, required: true },
  lectureHall: { type: lectureHallSchema, required: true },
  day: { type: daySchema, required: true },
  startTime: { type: startTimeSchema, required: true },
});

const Timetable = mongoose.model("Timetable", TimetableSchema, "Timetables");

function validateTimeTable(timetable) {
  schema = {
    functionName: Joi.string().min(3).required().trim(),
    subjectId: Joi.objectId().required(),
    lectureHallId: Joi.string(),
    dayId: Joi.objectId().required(),
    startTimeId: Joi.objectId().required(),
  };

  return Joi.object(schema).validate(timetable);
}

async function doesExists(timetable) {
  try {
    const func = await CurrSemFunction.findOne({
      functionName: timetable.functionName,
    });
    const isUnique = await Timetable.findOne({
      "currSemester.year": func.year,
      "currSemester.semester.periodIndex": func.semester.periodIndex,
      "subject._id": timetable.subjectId,
      // "day._id": timetable.dayId,
      // "startTime._id": timetable.startTimeId,
    });
    console.log("isUnique:", isUnique);
    return !!isUnique;
  } catch (error) {
    console.error("Error checking uniqueness:", error);
    return false;
  }
}

exports.Timetable = Timetable;
exports.validate = validateTimeTable;
exports.doesExists = doesExists;
