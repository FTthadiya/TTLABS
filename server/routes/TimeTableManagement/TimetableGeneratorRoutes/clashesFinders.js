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
    const clashesFinder = new ClashesFinder(specBatchesIds);
    await clashesFinder.execute();
    const clashes = await clashesFinder.getClashes();
    // Promise.all(
    //   clashes.map(async (clash) => {
    //     console.log(
    //       clash.clashModuleOne.subject.subjectName,
    //       clash.clashModuleOne.subject.sessionType
    //     );
    //     console.log(
    //       clash.clashModuleTwo.subject.subjectName,
    //       clash.clashModuleTwo.subject.sessionType
    //     );
    //   })
    // )
    //   .then(() => {
    //     // console.log(clashes.length);
    //     console.log("Processed all clashes");
    //   })
    //   .catch((error) => {
    //     console.error("Error processing clashes:", error);
    //   });

    return res.status(200).json({ success: true, clashes: clashes });
  } catch (error) {
    console.error("Failed to generate timetables:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
