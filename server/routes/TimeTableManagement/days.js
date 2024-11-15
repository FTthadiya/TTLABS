const { Day } = require("../../models/TimeTableManagement/day");
const express = require("express");
const router = express.Router();

router.get("/", async (req, res) => {
  const days = await Day.find().sort("index");
  res.send(days);
});

router.get("/:id", async (req, res) => {
  const day = await Day.findById(req.params.id);
  if (!day)
    return res.status(404).send("The day with the given ID was not found.");
  res.send(day);
});

module.exports = router;
