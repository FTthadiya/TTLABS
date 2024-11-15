const {
  Subject,
  validate,
  doesExists,
} = require("../../models/TimeTableManagement/subject");
const { Lecturer } = require("../../models/TimeTableManagement/lecturer");
const { SpecBatch } = require("../../models/TimeTableManagement/specBatch");
const mongoose = require("mongoose");
const express = require("express");
const router = express.Router();

router.get("/", async (req, res) => {
  const subject = await Subject.find().sort("subjectName");
  res.send(subject);
});

router.post("/", async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const exists = await doesExists(req.body);
  if (exists)
    return res
      .status(400)
      .send("Subject with the same details already exists.");

  const lecturer = await Lecturer.findById(req.body.lecturerId);
  if (!lecturer) return res.status(400).send("Invalid lecturer.");

  const specBatches = await SpecBatch.find({
    _id: { $in: req.body.specBatchesIds },
  });

  if (specBatches.length !== req.body.specBatchesIds.length)
    return res.status(400).send("Invalid specialization batch in the list.");

  const subject = new Subject({
    subjectName: req.body.subjectName,
    subjectCode: req.body.subjectCode,
    sessionType: req.body.sessionType,
    studentCount: req.body.studentCount,
    duration: req.body.duration,
    lecturer: {
      _id: lecturer._id,
      lecturerName: lecturer.lecturerName,
      email: lecturer.email,
    },
    specBatches: specBatches.map((specBatch) => ({
      _id: specBatch._id,
      specName: specBatch.specName,
      year: specBatch.year,
      semester: specBatch.semester,
    })),
  });

  await subject.save();
  res.send(subject);
});

router.put("/:id", async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const lecturer = await Lecturer.findById(req.body.lecturerId);
  if (!lecturer) return res.status(400).send("Invalid lecturer.");

  const specBatches = await SpecBatch.find({
    _id: { $in: req.body.specBatchesIds },
  });
  if (specBatches.length !== req.body.specBatchesIds.length)
    return res.status(400).send("Invalid specialization batch in the list.");

  const subject = await Subject.findByIdAndUpdate(
    req.params.id,
    {
      subjectName: req.body.subjectName,
      subjectCode: req.body.subjectCode,
      sessionType: req.body.sessionType,
      studentCount: req.body.studentCount,
      duration: req.body.duration,
      lecturer: {
        _id: lecturer._id,
        lecturerName: lecturer.lecturerName,
        email: lecturer.email,
      },
      specBatches: specBatches.map((specBatch) => ({
        _id: specBatch._id,
        specName: specBatch.specName,
        year: specBatch.year,
        semester: specBatch.semester,
      })),
    },
    { new: true }
  );
  if (!subject)
    return res.status(404).send("The subject with the given ID was not found.");

  res.send(subject);
});

router.delete("/:id", async (req, res) => {
  const subject = await Subject.findByIdAndDelete(req.params.id);
  if (!subject)
    return res.status(404).send("The subject with the given ID was not found.");

  res.send(subject);
});

router.get("/:id", async (req, res) => {
  const subject = await Subject.findById(req.params.id);
  if (!subject)
    return res.status(404).send("The subject with the given ID was not found.");

  res.send(subject);
});

router.get("/lecturer/:lecturerId", async (req, res) => {
  const subjects = await Subject.find({
    "lecturer._id": req.params.lecturerId,
  });
  res.send(subjects);
});

module.exports = router;
