const {
  SpecBatch,
  validate,
  doesExists,
} = require("../../models/TimeTableManagement/specBatch");
const express = require("express");
const router = express.Router();

router.get("/", async (req, res) => {
  const specBatches = await SpecBatch.find().sort({
    specName: 1,
    year: 1,
    semester: 1,
  });
  res.send(specBatches);
});

router.post("/", async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const exists = await doesExists(req.body);
  if (exists)
    return res
      .status(400)
      .send("Specialization batch with the same details already exists.");

  const specBatch = new SpecBatch({
    specName: req.body.specName,
    year: req.body.year,
    semester: req.body.semester,
  });
  await specBatch.save();
  res.send(specBatch);
});

router.put("/:id", async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const exists = await doesExists(req.body);
  if (exists)
    return res
      .status(400)
      .send("Specialization batch with the same details already exists.");

  const specBatch = await SpecBatch.findByIdAndUpdate(
    req.params.id,
    {
      specName: req.body.specName,
      year: req.body.year,
      semester: req.body.semester,
    },
    { new: true }
  );
  if (!specBatch)
    return res
      .status(404)
      .send("The specialization batch with the given ID was not found.");

  res.send(specBatch);
});

router.delete("/:id", async (req, res) => {
  const specBatch = await SpecBatch.findByIdAndDelete(req.params.id);
  if (!specBatch)
    return res
      .status(404)
      .send("The specialization batch with the given ID was not found.");

  res.send(specBatch);
});

router.get("/:id", async (req, res) => {
  const specBatch = await SpecBatch.findById(req.params.id);
  if (!specBatch)
    return res
      .status(404)
      .send("The specialization batch with the given ID was not found.");

  res.send(specBatch);
});

router.get("/api/uniqueSpecs", async (req, res) => {
  const specializations = await SpecBatch.find().distinct("specName");
  if (!specializations)
    return res.status(404).send("No specializations found.");
  res.send(specializations);
});

router.get("/api/uniqueBatches", async (req, res) => {
  try {
    const uniqueCombinations = await SpecBatch.aggregate([
      {
        $group: {
          _id: "$year",
          semesters: { $addToSet: "$semester" },
        },
      },
    ]).exec();

    const formattedData = [];
    uniqueCombinations.forEach((item) => {
      item.semesters.forEach((semester) => {
        formattedData.push({
          name: `Year ${item._id} Semester ${semester}`,
          year: item._id,
          semester: semester,
        });
      });
    });

    formattedData.sort((a, b) => {
      if (a.year !== b.year) {
        return a.year - b.year;
      }
      return a.semester - b.semester;
    });

    res.json(formattedData);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/api/specBatchId", async (req, res) => {
  const specBatch = await SpecBatch.findOne({
    specName: { $regex: new RegExp("^" + req.body.specName + "$", "i") },
    year: req.body.year,
    semester: req.body.semester,
  })
    .select("_id")
    .exec();

  if (!specBatch) return res.status(404).send("SpecBatch not found.");
  res.send(specBatch);
});

module.exports = router;
