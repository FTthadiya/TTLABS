const mongoose = require("mongoose");

const filterModuleSchema = new mongoose.Schema({
    moduleCode: String,
    moduleName: String,

})

const FilterModule = mongoose.model("FilterModule", filterModuleSchema);
module.exports = FilterModule;