const mongoose = require('mongoose');

const HallSchema = new mongoose.Schema({
    hallid: {
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

const HallModel = mongoose.model("halls", HallSchema);
module.exports = HallModel;
