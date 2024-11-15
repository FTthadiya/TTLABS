const {
  CurrSemFunction,
  LectPrefFunction,
  validate,
  validateLectPref,
} = require("../../models/TimeTableManagement/functionality");
const mongoose = require("mongoose");
const express = require("express");
const router = express.Router();

router.get("/:functionName", async (req, res) => {
  try {
    let func = await CurrSemFunction.findOne({
      functionName: req.params.functionName,
    });
    if (!func) {
      func = await LectPrefFunction.findOne({
        functionName: req.params.functionName,
      });
      if (!func) return res.status(404).send("Functionality not found");
    }
    res.send(func);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

router.put("/:functionName", async (req, res) => {
  let func;
  if (req.params.functionName === "getCurrSemester") {
    const { error } = validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    func = await CurrSemFunction.findOne({
      functionName: req.params.functionName,
    });
    if (!func) return res.status(404).send("Functionality not found");

    func.year = req.body.year;
    func.semester = req.body.semester;
  } else if (req.params.functionName === "getLectPrefVisibility") {
    func = await LectPrefFunction.findOne({
      functionName: req.params.functionName,
    });

    if (!func) return res.status(404).send("Functionality not found");

    const { error } = validateLectPref(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    func.isToggled = req.body.isToggled;
  } else {
    return res.status(404).send("Functionality not found");
  }

  try {
    await func.save();
    res.send(func);
  } catch (error) {
    res.status(500).send("Internal Server Error");
  }
});

module.exports = router;
