const express = require("express");
const Request = require("../../models/reschedule-management/request_model");
const ResTimetable = require('../../models/reschedule-management/resTimetable_model');
const { Day } = require("../../models/TimeTableManagement/day");
const { StartTime } = require("../../models/TimeTableManagement/startTime");
const { Subject } = require("../../models/TimeTableManagement/subject");

const router = express.Router();

router.post("/", async(req,res) => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    try{
        const { timeTableModule, moduleCode, moduleName, sessionType, lecturerName, previousDate, previousTime, currentDate, currentTime, specialNotes, status, isResolved, approvedOrDeniedAt, createdAt, adminName } = req.body;
        const newRequest = new Request({moduleCode, moduleName, sessionType, lecturerName, previousDate, previousTime, currentDate, currentTime, specialNotes,status, isResolved, approvedOrDeniedAt, createdAt, adminName });
        const currentDay = days[newRequest.currentDate.getDay()]

        const previousDay = days[newRequest.previousDate.getDay()]
        const previousTempTimes = newRequest.previousTime.split(" - ")
        const previousStartTime = previousTempTimes[0]

        const resTimetableEntry = await ResTimetable.findOne({'subject.subjectCode':moduleCode, 'day.name':previousDay, 'startTime.name': previousStartTime});

        if (resTimetableEntry !== null) {
            const duration = getDuration(newRequest.currentTime);

        const slotAvailable = await checkTimeTableSlot(moduleCode, resTimetableEntry._id ,currentDay, currentTime, duration);

        if(slotAvailable){
            await newRequest.save();

            res.status(200).json({message: "Request saved successfully"});
        }
        else{
            res.status(400).json({error: "Target time slot is already allocated"});
        }
    }
    else{
        res.status(400).json({error: "Current time table slot not found"});
    }


    }catch(error) {
        res.status(500).json({error: "An error occurred while saving the request"});

    }
})

router.get("/preview/:id", async(req,res) => {
    const {id} = req.params;
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    try {
        const request = await Request.findById(id);

    const currentDay = days[request.currentDate.getDay()]
    const currentTempTimes = request.currentTime.split(" - ")
    const currentTime = currentTempTimes[0]

    const previousDay = days[request.previousDate.getDay()]
    const previousTempTimes = request.previousTime.split(" - ")
    const previousTime = previousTempTimes[0]

    const resTimetableEntry = await ResTimetable.findOne({'subject.subjectCode':request.moduleCode, 'day.name':previousDay, 'startTime.name': previousTime}).lean().exec();
    
    if (resTimetableEntry !== null) {
        const oldTimetableEntry = JSON.parse(JSON.stringify(resTimetableEntry));
        oldTimetableEntry.subject.subjectCode = "(Old) " + oldTimetableEntry.subject.subjectCode;
        oldTimetableEntry.isNew = false;
        
        const day = await Day.findOne({name: currentDay});
        const time = await StartTime.findOne({name: currentTime});

        const duration = getDuration(request.currentTime);

        resTimetableEntry.day = day;
        resTimetableEntry.startTime = time;
        resTimetableEntry.subject.duration = duration;
        resTimetableEntry.subject.subjectCode = "(New) " + resTimetableEntry.subject.subjectCode;
        resTimetableEntry.isNew = true;

        res.json([oldTimetableEntry, resTimetableEntry]);
    }
    else {
        res.status(500).json({error: "Specified timetable entry not found"});
    }
    } catch (error) {
        res.status(500).json({error: "An error occurred while retriving preview data"});
    }

    
})

router.get("/getTimetable/:id", async (req, res) => {

    const { id } = req.params;
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    try {
    const request = await Request.findById(id);

    const previousDay = days[request.previousDate.getDay()]
    const previousTempTimes = request.previousTime.split(" - ")
    const previousTime = previousTempTimes[0]

    const resTimetableEntry = await ResTimetable.findOne({'subject.subjectCode':request.moduleCode, 'day.name':previousDay, 'startTime.name': previousTime});

        res.json(resTimetableEntry);
    }
    catch (error) {
        res.status(500).json({error: "An error occurred while finding data"});
    }

}) 

router.put("/approve/:id", async(req,res) => {
    const { id } = req.params;
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
   
    try {
        const request = await Request.findById(id);
        const currentDay = days[request.currentDate.getDay()]
        const currentTempTimes = request.currentTime.split(" - ")
        const currentTime = currentTempTimes[0]
       
        const previousDay = days[request.previousDate.getDay()]
        const previousTempTimes = request.previousTime.split(" - ")
        const previousTime = previousTempTimes[0]

        const resTimetableEntry = await ResTimetable.findOne({'subject.subjectCode':request.moduleCode, 'day.name':previousDay, 'startTime.name': previousTime});

        if(resTimetableEntry !== null){

            const day = await Day.findOne({name: currentDay});
            const time = await StartTime.findOne({name: currentTime});

            const duration = getDuration(request.currentTime);

            resTimetableEntry.day = day;
            resTimetableEntry.startTime = time;
            resTimetableEntry.subject.duration = duration;

            
            const slotAvailable = await checkTimeTableSlot(request.moduleCode ,resTimetableEntry._id ,currentDay, currentTime, duration);
            
            if (slotAvailable) {
                
                await resTimetableEntry.save();
                res.json(resTimetableEntry);

            }
            else {
                res.status(400).json({error: "Target time slot is already allocated"});
            }

        }
        else {
            res.status(500).json({error: "An error occurred while accepting the request"});
        }

    } catch (error) {
        res.status(500).json({error: "An error occurred while accepting the request"});
    }
})

const getDuration = (timeRange) => {
    const [startTime, endTime] = timeRange.split(' - ');
    
    const [startHour, startMinute] = startTime.split(':').map(Number);
    const [endHour, endMinute] = endTime.split(':').map(Number);
    
    const startTotalMinutes = startHour * 60 + startMinute;
    const endTotalMinutes = endHour * 60 + endMinute;
    
    const totalMinutes = endTotalMinutes - startTotalMinutes;
    
    const hours = totalMinutes / 60;
    
    return hours;
}

const checkTimeTableSlot = async (moduleCode ,prevSlotId, dayName, startTimeName, duration) => {

    const timetableData = await ResTimetable.find({'day.name':dayName});
    const subjects = await Subject.findOne({subjectCode: moduleCode});
    
    const specBatches = subjects.specBatches ? subjects.specBatches : [];
     
    
    const lectures = timetableData.filter(entry =>
          entry.subject.specBatches.filter(batch =>
              specBatches.find(selectedBatch =>
                  batch.specName === selectedBatch.specName &&
                  batch.semester === selectedBatch.semester &&
                  batch.year === selectedBatch.year
              )
          ).length > 0
      );

    const startHour = parseInt(startTimeName.split(':')[0]);
    const startMinute = parseInt(startTimeName.split(':')[1]);
    const startTimeInMinutes = startHour * 60 + startMinute;

    const durationInMinutes = duration * 60;
    const endTimeInMinutes = startTimeInMinutes + durationInMinutes;

    for (const lecture of lectures) {
        const lectureStartHour = parseInt(lecture.startTime.name.split(':')[0]);
        const lectureStartMinute = parseInt(lecture.startTime.name.split(':')[1]);
        const lectureStartTimeInMinutes = lectureStartHour * 60 + lectureStartMinute;
        const lectureEndTimeInMinutes = lectureStartTimeInMinutes + lecture.subject.duration * 60;

        if (
            (lectureStartTimeInMinutes < endTimeInMinutes && lectureEndTimeInMinutes > startTimeInMinutes) && lecture._id.toString() !== prevSlotId.toString()
        ) {
            return false;
        }
    }

    return true; 
}

module.exports = router;