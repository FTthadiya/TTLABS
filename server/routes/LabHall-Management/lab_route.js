const express = require("express");
const LabModel = require('../../models/LabHall-Management/Labs');

const router = express.Router();

router.get("/getLabs", async (req, res) => {
    try {
        const result = await LabModel.find({});
        res.json(result);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.post("/createLab", async (req, res) => {
    const lab = req.body;
    lab.available = true;
    const newlab = new LabModel(lab);
    await newlab.save();

    res.json(lab);
});

router.delete("/deleteLab/:labid", async (req, res) => {
    try {
        const result = await LabModel.findOneAndDelete({ labid: req.params.labid });
        if (result) {
            res.json({ message: "lab deleted successfully" });
        } else {
            res.status(404).json({ message: "lab not found" });
        }
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.put("/updateLab/:labid", async (req, res) => {
    try {
        const updatedlab = await LabModel.findOneAndUpdate(
            { labid: req.params.labid },
            req.body,
            { new: true }
        );
        if (updatedlab) {
            res.json(updatedlab);
        } else {
            res.status(404).json({ message: "lab not found" });
        }
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;

