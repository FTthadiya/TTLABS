const OptimizeTimetable = require("../../../models/TimeTableManagement/TimetableGeneratorModels/optimizeTimetable");
const ClashesFinder = require("../../../models/TimeTableManagement/TimetableGeneratorModels/clashesFinder");
const mongoose = require("mongoose");
const express = require("express");
const router = express.Router();

router.post("/", async (req, res) => {
  const { specBatchesIds } = req.body;
  if (!specBatchesIds || specBatchesIds.length === 0) {
    return res
      .status(400)
      .json({ success: false, message: "No batch IDs provided" });
  }

  try {
    let unassignedSubjects = [];
    let clashes = [];
    const clashesFinder = new ClashesFinder(specBatchesIds);
    clashes = await clashesFinder.getClashes();

    const optimizer = new OptimizeTimetable(specBatchesIds);
    let removed = await optimizer.clashesRemover(clashes);

    let score = 0;

    do {
      const stillUnassigned = await optimizer.assignSubjects(removed);
      await optimizer.tryingSwapMethod(stillUnassigned);

      clashes = await clashesFinder.getClashes();
      removed = await optimizer.clashesRemover(clashes);

      const currentTimetables = await optimizer.getCurrentTimetables();
      const allsubjects = await optimizer.getAllSubjectsForSpecBatches();

      score = allsubjects.length - currentTimetables.length;
    } while (clashes.length !== 0 && score >= 15);

    return res.status(200).json({ success: true, clashes: clashes });
  } catch (error) {
    console.error("Failed to optimize timetables:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// router.post("/", async (req, res) => {
//   const { specBatchesIds } = req.body;
//   if (!specBatchesIds || specBatchesIds.length === 0) {
//     return res
//       .status(400)
//       .json({ success: false, message: "No batch IDs provided" });
//   }

//   try {
//     let unassignedSubjects = [];
//     let clashes = [];
//     const clashesFinder = new ClashesFinder(specBatchesIds);
//     await clashesFinder.execute();
//     clashes = await clashesFinder.getClashes();
//     removed = await clashesFinder.clashesRemover(clashes);

//     const optimizer = new OptimizeTimetable(specBatchesIds);
//     // let removed = await optimizer.clashesRemover(clashes);

//     let score = 0;

//     do {
//       const stillUnassigned = await optimizer.assignSubjects(removed);
//       await optimizer.tryingSwapMethod(stillUnassigned);

//       clashes = await clashesFinder.getClashes();
//       removed = await optimizer.clashesRemover(clashes);

//       const currentTimetables = await optimizer.getCurrentTimetables();
//       const allsubjects = await optimizer.getAllSubjectsForSpecBatches();

//       score = allsubjects.length - currentTimetables.length;
//     } while (clashes.length !== 0 && score >= 15);

//     return res.status(200).json({ success: true, clashes: clashes });
//   } catch (error) {
//     console.error("Failed to optimize timetables:", error);
//     res.status(500).json({ success: false, message: error.message });
//   }
// });

module.exports = router;
