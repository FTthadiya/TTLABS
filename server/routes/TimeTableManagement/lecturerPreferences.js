const {
  LecturerPreference,
  validate,
  doesExists,
} = require("../../models/TimeTableManagement/lecturerPreference");
const { Subject } = require("../../models/TimeTableManagement/subject");
const mongoose = require("mongoose");
const express = require("express");
const { Day } = require("../../models/TimeTableManagement/day");
const { StartTime } = require("../../models/TimeTableManagement/startTime");
const router = express.Router();

router.get("/", async (req, res) => {
  const lecturerPreferenceObjs = await LecturerPreference.find().sort({
    "subject.specBatches.specName": 1,
    "subject.specBatches.year": 1,
    "subject.specBatches.semester": 1,
  });
  res.send(lecturerPreferenceObjs);
});

router.post("/", async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const exists = await doesExists(req.body);
  if (exists)
    return res
      .status(400)
      .send("Lecturer preference with the same details already exists.");

  const subject = await Subject.findById(req.body.subjectId);
  if (!subject) return res.status(400).send("Invalid subject.");

  const daysStartTimes = await Promise.all(
    req.body.daysStartTimesIds.map(async (dayStartTime) => {
      const day = await Day.findById(dayStartTime.dayId);
      const startTime = await StartTime.findById(dayStartTime.startTimeId);
      return { day, startTime };
    })
  );

  if (daysStartTimes.length !== req.body.daysStartTimesIds.length)
    return res.status(400).send("Invalid day and start time in the list.");

  const lecturerPreference = new LecturerPreference({
    subject: {
      _id: subject._id,
      subjectName: subject.subjectName,
      subjectCode: subject.subjectCode,
      sessionType: subject.sessionType,
      studentCount: subject.studentCount,
      duration: subject.duration,
      lecturer: {
        _id: subject.lecturer._id,
        lecturerName: subject.lecturer.lecturerName,
        email: subject.lecturer.email,
      },
      specBatches: subject.specBatches.map((specBatch) => ({
        _id: specBatch._id,
        specName: specBatch.specName,
        year: specBatch.year,
        semester: specBatch.semester,
      })),
    },
    daysStartTimes: [...daysStartTimes],
  });

  await lecturerPreference.save();
  res.send(lecturerPreference);
});

router.get("/:id", async (req, res) => {
  const lecturerPreference = await LecturerPreference.findById(req.params.id);
  if (!lecturerPreference)
    return res.status(404).send("Lecturer preference not found.");
  res.send(lecturerPreference);
});

router.get("/subject/:subjectId", async (req, res) => {
  const lecturerPreference = await LecturerPreference.find({
    "subject._id": req.params.subjectId,
  });
  if (!lecturerPreference)
    return res.status(404).send("Lecturer preference not found.");
  res.send(lecturerPreference);
});

router.get("/lecturer/:lecturerId", async (req, res) => {
  const lecturerPreference = await LecturerPreference.find({
    "subject.lecturer._id": req.params.lecturerId,
  });
  if (!lecturerPreference)
    return res.status(404).send("Lecturer preference not found.");
  res.send(lecturerPreference);
});

router.delete("/", async (req, res) => {
  try {
    const preferencesCount = await LecturerPreference.countDocuments();
    if (preferencesCount === 0)
      return res.status(404).send("No lecturer preferences found.");

    await LecturerPreference.deleteMany();
    res.status(200).send("All lecturer preferences are deleted successfully.");
  } catch (error) {
    res.status(500).send("Error deleting lecturer preferences.");
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const lecturerPreference = await LecturerPreference.findByIdAndDelete(
      req.params.id
    );
    if (!lecturerPreference)
      return res.status(404).send("Lecturer preference not found.");
    res.send(lecturerPreference);
  } catch (error) {
    res.status(500).send("Error deleting lecturer preference.");
  }
});

module.exports = router;
