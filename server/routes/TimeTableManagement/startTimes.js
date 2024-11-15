const { StartTime } = require("../../models/TimeTableManagement/startTime");
const express = require("express");
const router = express.Router();

router.get("/", async (req, res) => {
  const startTimes = await StartTime.find().sort({ index: 1 });
  res.send(startTimes);
});

router.get("/:id", async (req, res) => {
  const startTime = await StartTime.findById(req.params.id);
  if (!startTime)
    return res.status(404).send("The time with the given ID was not found.");
  res.send(startTime);
});

module.exports = router;
