const mongoose = require('mongoose');

const AssLabSchema = new mongoose.Schema({
    labid: {
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

const AssLabModel = mongoose.model("assignlabs", AssLabSchema);
module.exports = AssLabModel;