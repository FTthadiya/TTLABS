const mongoose = require('mongoose');

const LabSchema = new mongoose.Schema({
    labid: {
        type: String,
        required: true,
    },
    capacity: {
        type: Number,
        required: true,
    },
    available: {
        type: Boolean,
        default: true,
    },

});

const LabModel = mongoose.model("labs", LabSchema);
module.exports = LabModel;