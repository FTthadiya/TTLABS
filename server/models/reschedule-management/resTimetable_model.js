const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const resTimetableSchema  = new mongoose.Schema({

  currSemester: {
    functionName: String,
    year: Number,
    semester: 
      {
        periodIndex: Number,
        periodName: String,
      }  
  },
  subject: {
  
    subjectName: String,
    subjectCode: String,
    sessionType: String,
    studentCount: { type: Number, required: true, min: 1, max: 150 },
    duration: Number,
    lecturer: {
      _id: Schema.Types.ObjectId,
      lecturerName: String,
      email: String,
    },
    specBatches: 
      [
        {
          specName: String,
          year: Number,
          semester: Number,
        }
      ]
  
  },
  lectureHall: {

  _id: { type: String, default: "" },
  hallid: { type: String, default: "" },
  capacity: { type: Number, default: 0 },
  assigned: { type: Boolean, default: false },

  },
  day: { _id: String, index: Number, name: String },
  startTime: { _id: String, index: Number , name: String },

  
});

module.exports = mongoose.model('resTimetable', resTimetableSchema);
