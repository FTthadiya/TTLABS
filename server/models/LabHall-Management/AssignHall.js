const mongoose = require('mongoose');

const AssHallSchema = new mongoose.Schema({
    hallid: {
        type: String,
        required: true,
    },
    day: {
        type: String,
        required: true,
    },
    startTime: {
        type: String,
        required: true,
    },
    duration: {
        type: Number,
        required: true,
    }, 
    subjectCode: {
        type: String,
        required: true,
    },
    timeIndex: {
        type: Number,
        required: true,
    }
});

const AssHallModel = mongoose.model("assignhalls", AssHallSchema);
module.exports = AssHallModel;