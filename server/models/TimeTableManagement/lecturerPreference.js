const mongoose = require("mongoose");
const { subjectSchema } = require("./subject");
const { daySchema } = require("./day");
const { startTimeSchema } = require("./startTime");
const Joi = require("joi");

const lecturerPreferenceSchema = mongoose.Schema({
  subject: { type: subjectSchema, required: true },
  daysStartTimes: {
    type: [
      {
        day: { type: daySchema, required: true },
        startTime: { type: startTimeSchema, required: true },
      },
    ],
    validate: {
      validator: function (v) {
        return v && v.length > 0;
      },
      message: "At least one day and start time is required",
    },
  },
});

const LecturerPreference = mongoose.model(
  "LecturerPreference",
  lecturerPreferenceSchema,
  "LecturerPreferences"
);

function validateLecturerPreference(lecturerPreference) {
  schema = {
    subjectId: Joi.objectId().required(),
    daysStartTimesIds: Joi.array()
      .items(
        Joi.object({
          dayId: Joi.string().required(),
          startTimeId: Joi.string().required(),
        })
      )
      .min(1)
      .required(),
  };
  return Joi.object(schema).validate(lecturerPreference);
}

async function doesExists(lecturerPreference) {
  try {
    const isUnique = await LecturerPreference.findOne({
      "subject._id": lecturerPreference.subjectId,
    });
    return !!isUnique;
  } catch (error) {
    console.error("Error checking uniqueness:", error);
    return false;
  }
}

exports.LecturerPreference = LecturerPreference;
exports.lecturerPreferenceSchema = lecturerPreferenceSchema;
exports.validate = validateLecturerPreference;
exports.doesExists = doesExists;
