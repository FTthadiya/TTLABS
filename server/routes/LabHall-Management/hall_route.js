const express = require("express");
const app = express();
const mongoose = require('mongoose');
const HallModel = require('../../models/LabHall-Management/Halls');

const router = express.Router();

router.get("/getHalls", async (req, res) => {
    try {
        const result = await HallModel.find({});
        res.json(result);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.post("/createHall", async (req, res) => {
    const hall = req.body;
    // Set available to true
    hall.available = true;
    const newHall = new HallModel(hall);
    await newHall.save();

    res.json(hall);
});


router.delete("/deleteHall/:hallid", async (req, res) => {
    try {
        const result = await HallModel.findOneAndDelete({ hallid: req.params.hallid });
        if (result) {
            res.json({ message: "Hall deleted successfully" });
        } else {
            res.status(404).json({ message: "Hall not found" });
        }
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.put("/updateHall/:hallid", async (req, res) => {
    try {
        const updatedHall = await HallModel.findOneAndUpdate(
            { hallid: req.params.hallid },
            req.body,
            { new: true }
        );
        if (updatedHall) {
            res.json(updatedHall);
        } else {
            res.status(404).json({ message: "Hall not found" });
        }
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;

