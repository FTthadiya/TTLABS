const Joi = require("joi");
const mongoose = require("mongoose");

const currSemFunctionSchema = mongoose.Schema({
  functionName: { type: String, required: true, trim: true, minLength: 3 },
  year: { type: Number, required: true },
  semester: {
    type: {
      periodIndex: { type: Number, enum: [1, 2], required: true },
      periodName: {
        type: String,
        enum: ["February - June", "July - November"],
        required: true,
        trim: true,
        minLength: 3,
      },
    },
    required: true,
  },
});

const lectPrefFunctionSchema = mongoose.Schema({
  functionName: { type: String, required: true, trim: true, minLength: 3 },
  isToggled: { type: Boolean, required: true },
});

const CurrSemFunction = mongoose.model(
  "CurrSemFunction",
  currSemFunctionSchema,
  "Functionalities"
);

const LectPrefFunction = mongoose.model(
  "LectPrefFunction",
  lectPrefFunctionSchema,
  "Functionalities"
);

function validateCurrSemFunction(currSemFunction) {
  schema = {
    functionName: Joi.string().min(3).required().trim(),
    year: Joi.number().min(2021).required(),
    semester: Joi.object({
      periodIndex: Joi.number().required().valid(1, 2),
      periodName: Joi.string()
        .required()
        .trim()
        .min(3)
        .valid("February - June", "July - November"),
    }).required(),
  };

  return Joi.object(schema).validate(currSemFunction);
}

function validateLectPrefFunction(lectPrefFunction) {
  schema = {
    functionName: Joi.string().min(3).required().trim(),
    isToggled: Joi.boolean().required(),
  };

  return Joi.object(schema).validate(lectPrefFunction);
}

async function doesExists(currSemFunction) {
  try {
    const isUnique = await CurrSemFunction.findOne({
      functionName: currSemFunction.functionName,
    });
    return isUnique ? true : false;
  } catch (error) {
    throw new Error(error);
  }
}

async function doesExistsLectPref(lectPrefFunction) {
  try {
    const isUnique = await LectPrefFunction.findOne({
      functionName: lectPrefFunction.functionName,
    });
    return isUnique ? true : false;
  } catch (error) {
    throw new Error(error);
  }
}

exports.CurrSemFunction = CurrSemFunction;
exports.LectPrefFunction = LectPrefFunction;
exports.currSemFunctionSchema = currSemFunctionSchema;
exports.lectPrefFunctionSchema = lectPrefFunctionSchema;
exports.validate = validateCurrSemFunction;
exports.validateLectPref = validateLectPrefFunction;
exports.doesExists = doesExists;
exports.doesExistsLectPref = doesExistsLectPref;
