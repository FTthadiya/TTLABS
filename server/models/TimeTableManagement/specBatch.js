const mongoose = require("mongoose");
const Joi = require("joi");

const specBatchSchema = mongoose.Schema({
  specName: { type: String, required: true, trim: true, minLength: 3 },
  year: { type: Number, required: true, min: 1, max: 5 },
  semester: { type: Number, required: true, min: 1, max: 2 },
});
const SpecBatch = mongoose.model(
  "SpecBatch",
  specBatchSchema,
  "SpecializationBatches"
);

function validateSpecBatch(specBatch) {
  schema = {
    specName: Joi.string().min(3).required().trim(),
    year: Joi.number().integer().min(1).max(5).required(),
    semester: Joi.number().integer().min(1).max(2).required(),
  };

  return Joi.object(schema).validate(specBatch);
}

async function doesExists(specBatch) {
  try {
    const newName = specBatch.specName.trim().toLowerCase();
    const isUnique = await SpecBatch.findOne({
      specName: { $regex: new RegExp("^" + newName + "$", "i") },
      year: specBatch.year,
      semester: specBatch.semester,
    });

    return !!isUnique;
  } catch (error) {
    console.error("Error checking uniqueness:", error);
    return false;
  }
}

exports.SpecBatch = SpecBatch;
exports.specBatchSchema = specBatchSchema;
exports.validate = validateSpecBatch;
exports.doesExists = doesExists;
