const TimetableGenerationAlgorithm = require("../../../models/TimeTableManagement/TimetableGeneratorModels/timetableGenerator");
const ClashesRemover = require("../../../models/TimeTableManagement/TimetableGeneratorModels/clashesRemover");
const mongoose = require("mongoose");
const express = require("express");
const axios = require("axios");
const router = express.Router();

router.post("/", async (req, res) => {
  const { specBatchesIds } = req.body;
  if (!specBatchesIds || specBatchesIds.length === 0) {
    return res.status(400).send("No batch IDs provided");
  }

  try {
    const timetableGenerationAlgorithm = new TimetableGenerationAlgorithm(
      specBatchesIds
    );
    await timetableGenerationAlgorithm.initializePopulation();
    await timetableGenerationAlgorithm.runEvolution();
    const timetablesArray = timetableGenerationAlgorithm.getTimetables();
    let timetables = timetablesArray.map((tt) => {
      return {
        functionName: "getCurrSemester",
        subjectId: tt.subjectId,
        lectureHallId: tt.lectureHallId,
        dayId: tt.dayId,
        startTimeId: tt.startTimeId,
      };
    });
    await timetableGenerationAlgorithm.saveTimetablesInDatabase(timetables);

    const clashesRemover = new ClashesRemover(specBatchesIds);
    await clashesRemover.execute();

    res.status(200).send("Timetable Generation Successful");
  } catch (error) {
    console.error("Failed to generate timetables:", error);
    res.status(500).send(error.message);
  }
});

module.exports = router;
