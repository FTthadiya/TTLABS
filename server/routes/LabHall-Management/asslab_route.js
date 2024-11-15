const express = require("express");
const router = express.Router();
const AssLabModel = require('../../models/LabHall-Management/AssignLab');

router.get("/getAssignmentLabs", async (req, res) => {
    try {
        const result = await AssLabModel.find({});
        res.json(result);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.post("/createAssignmentLab", async (req, res) => {
    const assignmentLab = req.body;
    const newAssignmentLab = new AssLabModel(assignmentLab);
    await newAssignmentLab.save();

    res.json(assignmentLab);
});


router.delete("/deleteAssignmentLab/:id", async (req, res) => {
    try {
        const result = await AssLabModel.findByIdAndDelete(req.params.id);
        if (result) {
            res.json({ message: "Assignment lab deleted successfully" });
        } else {
            res.status(404).json({ message: "Assignment lab not found" });
        }
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});


router.put("/updateAssignmentLab/:id", async (req, res) => {
    try {
        const updatedAssignmentLab = await AssLabModel.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
        if (updatedAssignmentLab) {
            res.json(updatedAssignmentLab);
        } else {
            res.status(404).json({ message: "Assignment lab not found" });
        }
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});


module.exports = router;
