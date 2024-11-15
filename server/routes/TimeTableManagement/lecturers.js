const {
  Lecturer,
  validate,
  doesExists,
} = require("../../models/TimeTableManagement/lecturer");
const express = require("express");
const router = express.Router();

router.get("/", async (req, res) => {
  const lecturers = await Lecturer.find();
  res.send(lecturers);
});

router.post("/", async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const newEmail = req.body.email.trim().toLowerCase();
  const user = await Lecturer.findOne({ email: newEmail });
  if (user)
    return res.status(400).send("Lecturer already registered with given email");

  const exists = await doesExists(req.body);
  if (exists)
    return res
      .status(400)
      .send("Lecturer with the same details already exists.");

  const lecturer = new Lecturer({
    _id: req.body._id,
    lecturerName: req.body.lecturerName,
    email: req.body.email,
  });
  await lecturer.save();
  res.send(lecturer);
});

router.put("/:id", async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const newEmail = req.body.email.trim().toLowerCase();
  const user = await Lecturer.findOne({ email: newEmail });
  if (user)
    return res.status(400).send("Lecturer already registered with given email");

  const exists = await doesExists(req.body);
  if (exists)
    return res
      .status(400)
      .send("Lecturer with the same details already exists.");

  const lecturer = await Lecturer.findByIdAndUpdate(
    req.params.id,
    {
      lecturerName: req.body.lecturerName,
      email: req.body.email,
    },
    { new: true }
  );
  if (!lecturer)
    return res
      .status(404)
      .send("The lecturer with the given ID was not found.");

  res.send(lecturer);
});

router.delete("/:id", async (req, res) => {
  const lecturer = await Lecturer.findByIdAndDelete(req.params.id);
  if (!lecturer)
    return res
      .status(404)
      .send("The lecturer with the given ID was not found.");

  res.send(lecturer);
});

router.get("/:id", async (req, res) => {
  const lecturer = await Lecturer.findById(req.params.id);
  if (!lecturer)
    return res
      .status(404)
      .send("The lecturer with the given ID was not found.");

  res.send(lecturer);
});

module.exports = router;
