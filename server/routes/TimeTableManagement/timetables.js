const {
  Timetable,
  validate,
  doesExists,
} = require("../../models/TimeTableManagement/timetable");
const { Subject } = require("../../models/TimeTableManagement/subject");
const HallModel = require("../../models/LabHall-Management/Halls");
const { Day } = require("../../models/TimeTableManagement/day");
const { StartTime } = require("../../models/TimeTableManagement/startTime");
const {
  CurrSemFunction,
} = require("../../models/TimeTableManagement/functionality");
const mongoose = require("mongoose");
const express = require("express");
const router = express.Router();

router.get("/", async (req, res) => {
  const timetableObjs = await Timetable.find().sort({
    "subject.specBatches.specName": 1,
    "subject.specBatches.year": 1,
    "subject.specBatches.semester": 1,
  });
  res.send(timetableObjs);
});

router.post("/getAll", async (req, res) => {
  const currSemester = await CurrSemFunction.findOne({
    functionName: req.body.functionName,
  });
  if (!currSemester) return res.status(400).send("Invalid current semester.");

  const timetableObjs = await Timetable.find({
    "currSemester.year": currSemester.year,
    "currSemester.semester.periodIndex": currSemester.semester.periodIndex,
  }).sort({
    "subject.specBatches.specName": 1,
    "subject.specBatches.year": 1,
    "subject.specBatches.semester": 1,
  });
  res.send(timetableObjs);
});

router.post("/", async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const exists = await doesExists(req.body);
  if (exists)
    return res
      .status(400)
      .send("Timetable with the same details already exists.");

  const currSemester = await CurrSemFunction.findOne({
    functionName: req.body.functionName,
  });
  if (!currSemester) return res.status(400).send("Invalid current semester.");

  const subject = await Subject.findById(req.body.subjectId);
  if (!subject) return res.status(400).send("Invalid subject.");

  const day = await Day.findById(req.body.dayId);
  if (!day) return res.status(400).send("Invalid day.");

  const startTime = await StartTime.findById(req.body.startTimeId);
  if (!startTime) return res.status(400).send("Invalid start time.");

  const timetable = new Timetable({
    currSemester: {
      functionName: currSemester.functionName,
      year: currSemester.year,
      semester: {
        periodIndex: currSemester.semester.periodIndex,
        periodName: currSemester.semester.periodName,
      },
    },
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
    lectureHall: {
      _id: "",
      hallid: "",
      capacity: 0,
      assigned: false,
    },
    day: {
      _id: day._id,
      index: day.index,
      name: day.name,
    },
    startTime: {
      _id: startTime._id,
      index: startTime.index,
      name: startTime.name,
    },
  });

  await timetable.save();
  res.send(timetable);
});

router.put("/:id", async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const currSemester = await CurrSemFunction.findOne({
    functionName: req.body.functionName,
  });
  if (!currSemester) return res.status(400).send("Invalid current semester.");

  const subject = await Subject.findById(req.body.subjectId);
  if (!subject) return res.status(400).send("Invalid subject.");

  const lectureHall = await HallModel.findById(req.body.lectureHallId);
  if (!lectureHall) return res.status(400).send("Invalid lecture hall.");

  const day = await Day.findById(req.body.dayId);
  if (!day) return res.status(400).send("Invalid day.");

  const startTime = await StartTime.findById(req.body.startTimeId);
  if (!startTime) return res.status(400).send("Invalid start time.");

  const timetable = await Timetable.findByIdAndUpdate(
    req.params.id,
    {
      currSemester: {
        functionName: currSemester.functionName,
        year: currSemester.year,
        semester: {
          periodIndex: currSemester.semester.periodIndex,
          periodName: currSemester.semester.periodName,
        },
      },
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
      lectureHall: {
        _id: lectureHall._id,
        hallid: lectureHall.hallid,
        capacity: lectureHall.capacity,
        assigned: lectureHall.assigned,
      },
      day: {
        _id: day._id,
        index: day.index,
        name: day.name,
      },
      startTime: {
        _id: startTime._id,
        index: startTime.index,
        name: startTime.name,
      },
    },
    { new: true }
  );
  if (!timetable)
    return res
      .status(404)
      .send("The timetable with the given ID was not found.");

  res.send(timetable);
});

router.delete("/:id", async (req, res) => {
  const currSemester = await CurrSemFunction.findOne({
    functionName: "getCurrSemester",
  });

  const timetable = await Timetable.findOne({
    _id: req.params.id,
    "currSemester.year": currSemester.year,
    "currSemester.semester.periodIndex": currSemester.semester.periodIndex,
  });

  if (!timetable)
    return res
      .status(404)
      .send("The timetable with the given ID was not found.");

  await Timetable.deleteOne({ _id: req.params.id });
  res.status(204).send();
});

router.get("/:id", async (req, res) => {
  const timetable = await Timetable.findById(req.params.id);
  if (!timetable)
    return res
      .status(404)
      .send("The timetable with the given ID was not found.");

  res.send(timetable);
});

router.post("/lecturer/:id", async (req, res) => {
  const { id } = req.params;
  const currSemester = await CurrSemFunction.findOne({
    functionName: req.body.functionName,
  });

  try {
    const timetable = await Timetable.find({
      "subject.lecturer._id": id,
      "currSemester.year": currSemester.year,
      "currSemester.semester.periodIndex": currSemester.semester.periodIndex,
    });

    if (!timetable.length) {
      return res
        .status(404)
        .send("Timetable not found for the given lecturer ID");
    }

    res.send(timetable);
  } catch (error) {
    console.error("Error retrieving timetable:", error);
    res.status(500).send("Error retrieving timetable. Please try again later.");
  }
});

router.post("/specBatch/:id", async (req, res) => {
  const { id } = req.params;
  const currSemester = await CurrSemFunction.findOne({
    functionName: req.body.functionName,
  });

  try {
    const timetable = await Timetable.find({
      "subject.specBatches._id": id,
      "currSemester.year": currSemester.year,
      "currSemester.semester.periodIndex": currSemester.semester.periodIndex,
    });

    if (!timetable.length) {
      return res
        .status(404)
        .send("Timetable not found for the given specialization batch ID.");
    }

    res.send(timetable);
  } catch (error) {
    console.error("Error retrieving timetable:", error);
    res.status(500).send("Error retrieving timetable. Please try again later.");
  }
});

router.put("/lectureHallUpdate/:timetableId", async (req, res) => {
  const { timetableId } = req.params;
  const lectureHall = req.body;
  const timetable = await Timetable.findByIdAndUpdate(
    timetableId,
    {
      lectureHall: {
        _id: lectureHall._id,
        hallid: lectureHall.hallid,
        capacity: lectureHall.capacity,
        assigned: lectureHall.assigned,
      },
    },
    { new: true }
  );
  if (!timetable)
    return res
      .status(404)
      .send("The timetable with the given ID was not found.");

  res.send(timetable);
});

router.get("/retrieve/uniqueYears", async (req, res) => {
  try {
    const years = await Timetable.distinct("currSemester.year");
    res.send(years);
  } catch (error) {
    console.error("Error in retrieving unique years:", error.message);
    res.status(500).send("Failed to retrieve unique years");
  }
});

router.post("/previousTimetables", async (req, res) => {
  const { specBatchId, selectedYear, selectedSemester } = req.body;

  try {
    const timetable = await Timetable.find({
      "subject.specBatches._id": specBatchId,
      "currSemester.year": selectedYear,
      "currSemester.semester.periodIndex": selectedSemester,
    });

    if (!timetable.length) {
      return res
        .status(404)
        .send("Timetable not found for the given specialization batch.");
    }

    res.send(timetable);
  } catch (error) {
    console.error("Error retrieving timetable:", error);
    res.status(500).send("Error retrieving timetable. Please try again later.");
  }
});

router.delete("/delete/all", async (req, res) => {
  try {
    const currSemester = await CurrSemFunction.findOne({
      functionName: "getCurrSemester",
    });
    const timetable = await Timetable.deleteMany({
      "currSemester.year": currSemester.year,
      "currSemester.semester.periodIndex": currSemester.semester.periodIndex,
    });
    res.status(200).send("All timetables removed successfully");
  } catch (error) {
    console.error("Error deleting timetable:", error);
    res.status(500).send("Error deleting timetable. Please try again later.");
  }
});

module.exports = router;
