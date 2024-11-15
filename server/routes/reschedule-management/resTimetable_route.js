const express = require('express');
const cron = require('node-cron')
const router = express.Router();
const ResTimetable = require('../../models/reschedule-management/resTimetable_model');
const {Timetable} = require('../../models/TimeTableManagement/timetable');
const {Subject} = require('../../models/TimeTableManagement/subject'); 
var  _ = require('lodash');
const { CurrSemFunction } = require('../../models/TimeTableManagement/functionality');

cron.schedule('30 12 * * 0', async () => {
  const timetable = await Timetable.find();
  const restimetable = await ResTimetable.find();
  if(restimetable.length > 0){
    await ResTimetable.deleteMany();
    await ResTimetable.insertMany(timetable);
  }

});

router.get('/data', async (req, res) => {
  try {
    const timetableData = await ResTimetable.find();
    res.json(timetableData);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/findOne/:id', async (req, res) => {
  const {id} = req.params;

  try {
    const timetableData = await ResTimetable.findById(id);
    res.json(timetableData);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/data/:id', async (req, res) => {
  const {id} = req.params;
  try {
        const timetableData = await ResTimetable.find();
        const subjects = await Subject.findOne({subjectCode: id});

        if (!timetableData.length || !subjects) {
          return res.status(404).json({ message: 'Data not found' });
        }
    
    
        const specBatches = subjects.specBatches ? subjects.specBatches : [];
      
        const data = timetableData[0].subject.specBatches
    
        const result = timetableData.filter(entry =>
          entry.subject.specBatches.filter(batch =>
              specBatches.find(selectedBatch =>
                  batch.specName === selectedBatch.specName &&
                  batch.semester === selectedBatch.semester &&
                  batch.year === selectedBatch.year
              )
          ).length > 0
      );
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/data/:id', async (req, res) => {
  const { id } = req.params;
  const timetable = await ResTimetable.findById(id);
  
  const updateFields = {...req.body}

  Object.assign(timetable,updateFields)
  
  try {
    
    const newTimetable = await ResTimetable.findByIdAndUpdate(id, updateFields, { new: true })
    res.status(201).json(newTimetable);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.put('/updateLecHall/:id', async (req, res) => {
  const { id } = req.params;
  const timetable = await ResTimetable.findById(id);
  
  const updateFields = {...timetable, lectureHall: req.body}

  Object.assign(timetable,updateFields)
  
  try {
    const newTimetable = await ResTimetable.findByIdAndUpdate(id, updateFields, { new: true })
    res.status(201).json(newTimetable);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.post('/data', async (req, res) => {
  const curSem = await CurrSemFunction.findOne({functionName: 'getCurrSemester'})
  const timetable = new ResTimetable({...req.body, currSemester: curSem}); 
  try {
    const newTimetable = await timetable.save();
    res.status(201).json(newTimetable);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});


router.delete('/data/:id', async (req, res) => {
  const id = req.params.id;
  try {
    await ResTimetable.findByIdAndDelete(id);
    res.json({ message: 'Timetable data deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post("/lecturer/:id", async (req, res) => { 
  const { id } = req.params;
  const currSemester = await CurrSemFunction.findOne({
    functionName: req.body.functionName,
  });

  try {
    const restimetable = await ResTimetable.find({
      "subject.lecturer._id": id,
      "currSemester.year": currSemester.year,
      "currSemester.semester.periodIndex": currSemester.semester.periodIndex,
    });

    if (!restimetable.length) {
      return res
        .status(200)
        .send([]);
    }

    res.send(restimetable);
  } catch (error) {
    res.status(500).send("Error retrieving timetable. Please try again later.");
  }
});

router.post("/specBatch/:id", async (req, res) => { 
  const { id } = req.params;
  const currSemester = await CurrSemFunction.findOne({
    functionName: req.body.functionName,
  });

  try {
    const restimetable = await ResTimetable.find({
      "subject.specBatches._id": id,
      "currSemester.year": currSemester.year,
      "currSemester.semester.periodIndex": currSemester.semester.periodIndex,
    });

    if (!restimetable.length) {
      return res
        .status(404)
        .send("Timetable not found for the given specialization batch ID.");
    }

    res.send(restimetable);
  } catch (error) {
    res.status(500).send("Error retrieving timetable. Please try again later.");
  }
});

router.delete("/deleteAll", async (req, res) => { 

  try {
    await ResTimetable.deleteMany();
    res.status(200).send()
  } catch (error) {
    res.status(500).send("Error retrieving timetable. Please try again later.");
  }
});

router.get("/reset", async (req, res) => { 

  try {

    const currSemester = await CurrSemFunction.findOne({
      functionName: "getCurrSemester",
    });
    
    const timetable = await Timetable.find({
      "currSemester.year": currSemester.year,
      "currSemester.semester.periodIndex": currSemester.semester.periodIndex,
    });


    if (!timetable) {
      return res.status(404).json({ message: 'No timetable data found in the semester'})
    }

    await ResTimetable.deleteMany();
    await ResTimetable.insertMany(timetable);

    res.send(timetable);
  } catch (error) {
    res.status(500).send("Error retrieving timetable. Please try again later.");
  }
});

router.post("/insertData", async (req, res) => { 

  const data = req.body.data

  try {
    const currSemester = await CurrSemFunction.findOne({
      functionName: "getCurrSemester",
    });
    if(data.currSemester.year === currSemester.year && data.currSemester.semester.periodIndex === currSemester.semester.periodIndex){
      
      const timetable = await ResTimetable.create(data);

      if (!timetable) {
        return res.status(404).json({ message: 'Timetable entry not created'})
      }

      res.send(timetable);
    }
    else{
      res.status(500).send("Error retrieving timetable. Please try again later.");
    }
    
  } catch (error) {
    res.status(500).send("Error retrieving timetable. Please try again later.");
  }
});



router.put("/lectureHallUpdate/:timetableId", async (req, res) => {
  const { timetableId } = req.params;
  const lectureHall = req.body;

  const timeTableEntry = await Timetable.findById(timetableId);

  const timetable = await ResTimetable.findOneAndUpdate(
    {"subject.subjectCode": timeTableEntry.subject.subjectCode,
      "subject.sessionType": timeTableEntry.subject.sessionType,
      "day.name": timeTableEntry.day.name,
      "startTime.name": timeTableEntry.startTime.name
    },
    {
      lectureHall: {
        _id: lectureHall._id,
        hallid: lectureHall.hallid,
        capacity: lectureHall.capacity,
        assigned: lectureHall.assigned,
      },
    },
    { new: true }
  );
  if (!timetable)
    return res
      .status(404)
      .send("The timetable with the given ID was not found.");

    res.send(timetable);
});

module.exports = router;