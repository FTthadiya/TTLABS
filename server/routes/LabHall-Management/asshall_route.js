const express = require("express");
const router = express.Router();
const AssHallModel = require('../../models/LabHall-Management/AssignHall');

router.get("/getAssignmentHalls", async (req, res) => {
    try {
        const result = await AssHallModel.find({});
        res.json(result);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.post("/createAssignmentHall", async (req, res) => {
    const assignmentHall = req.body;
    const newAssignmentHall = new AssHallModel(assignmentHall);
    const newAssignmentHallObj = await newAssignmentHall.save();

    res.json(newAssignmentHallObj);
});

router.delete("/deleteAssignmentHall/:id", async (req, res) => {
    try {
        const result = await AssHallModel.findByIdAndDelete(req.params.id);
        if (result) {
            res.json({ message: "Assignment hall deleted successfully" });
        } else {
            res.status(404).json({ message: "Assignment hall not found" });
        }
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.put("/updateAssignmentHall/:id", async (req, res) => {
    try {
        const updatedAssignmentHall = await AssHallModel.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
        if (updatedAssignmentHall) {
            res.json(updatedAssignmentHall);
        } else {
            res.status(404).json({ message: "Assignment hall not found" });
        }
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});


module.exports = router;
