const _ = require("lodash");
const { Subject } = require("../subject");
const { Functionality } = require("../functionality");
const { Timetable } = require("../timetable");
const { Day } = require("../day");
const { StartTime } = require("../startTime");
const axios = require("axios");

class OptimizeTimetable {
  constructor(specBatches) {
    this.specBatches = specBatches;
    this.subjects = [];
    this.timetables = [];
    this.clashes = [];
    this.matrixes = [];
    this.attempts = new Map();
  }

  async getCurrentTimetables() {
    const reqBody = {
      functionName: "getCurrSemester",
    };

    const currentTimetables = await axios.post(
      "http://localhost:3001/api/timetables/getAll",
      reqBody
    );
    return currentTimetables;
  }

  async getAllSubjectsForSpecBatches() {
    const results = await Promise.all(
      this.specBatches.map((specBatch) =>
        Subject.find({ "specBatches._id": specBatch }).populate("specBatches")
      )
    );
    const uniqueSubjects = _.uniqBy(_.flatten(results), (subject) =>
      subject._id.toString()
    );
    return uniqueSubjects;
  }

  async tryingSwapMethod(notAssigned) {
    let stillUnassigneds = notAssigned;
    for (const stillUnassigned of stillUnassigneds) {
      const combinedTimetables = this.getCommonTimetable(stillUnassigned);
      for (const timetableObj of combinedTimetables) {
        let newTimetableObj = timetableObj;
        newTimetableObj.subject = stillUnassigned.subject;

        let newUnassigned = stillUnassigned;
        newUnassigned.subject = timetableObj.subject;

        this.timetables = this.timetables.filter(
          (timetable) => timetable._id !== timetableObj._id
        );
        if (
          this.isSlotAvailable(
            newTimetableObj.day.index,
            newTimetableObj.startTime.index,
            newTimetableObj
          )
        ) {
          const result = await Timetable.findByIdAndDelete(timetableObj._id);
          const saveObj = {
            functionName: "getCurrSemester",
            subjectId: newTimetableObj.subject._id,
            lectureHallId: "null",
            dayId: newTimetableObj.day._id,
            startTimeId: newTimetableObj.startTime._id,
          };

          const response = axios.post(
            "http://localhost:3001/api/timetables",
            saveObj
          );

          this.timetables.push(response.data);
          stillUnassigned = stillUnassigned.filter(
            (session) => session.subject._id !== newTimetableObj.subject._id
          );
          if (
            this.isSlotAvailable(
              newUnassigned.day.index,
              newUnassigned.startTime.index,
              newUnassigned
            )
          ) {
            const saveObj = {
              functionName: "getCurrSemester",
              subjectId: newUnassigned.subject._id,
              lectureHallId: "null",
              dayId: newUnassigned.day._id,
              startTimeId: newUnassigned.startTime._id,
            };
            const response = axios.post(
              "http://localhost:3001/api/timetables",
              saveObj
            );
            this.timetables.push(response.data);
          } else {
            stillUnassigneds.push(newUnassigned);
          }
        }
      }
    }
  }

  async assignSubjects(unassignedSubjects) {
    let stillUnassigned = [];
    for (const unassignedSubject of unassignedSubjects) {
      let isAssigned = false;
      outerloop: for (let day = 1; day <= 5; day++) {
        for (let time = 1; time <= 9; time++) {
          if (this.isSlotAvailable(day, time, unassignedSubject)) {
            const dayData = await Day.findOne({ index: day });
            const timeData = await StartTime.findOne({ index: time });
            if (dayData && timeData) {
              const timetableObj = {
                functionName: "getCurrSemester",
                subjectId: unassignedSubject.subject._id,
                lectureHallId: "null",
                dayId: dayData._id,
                startTimeId: timeData._id,
              };
              const response = await axios.post(
                "http://localhost:3001/api/timetables",
                timetableObj
              );
              this.timetables.push(response.data);
              isAssigned = true;
              break outerloop;
            }
          }
        }
      }
      if (!isAssigned) {
        stillUnassigned.push(unassignedSubject);
      }
    }
    return stillUnassigned;
  }

  async isSlotAvailable(day, time, session) {
    const combinedTables = this.getCommonTimetable(session);
    if (
      (time < 5 && time + session.subject.duration >= 5) ||
      (time < 9 && time + session.subject.duration >= 9)
    ) {
      return false;
    }

    for (let i = 0; i < session.subject.duration; i++) {
      if (
        combinedTables.some(
          (timetable) =>
            timetable.day.index === day &&
            timetable.startTime.index <= time + i &&
            timetable.startTime.index + timetable.subject.duration > time + i
        )
      ) {
        return false;
      }
    }
    return true;
  }

  getCommonTimetable(session) {
    const batchesForSession = session.subject.specBatches;
    if (batchesForSession === undefined) {
      return false;
    }
    const otherSubjects = this.timetables.filter((timetable) =>
      timetable.subject.specBatches.some((subjectBatch) =>
        batchesForSession.some(
          (batch) => batch._id.toString() === subjectBatch._id.toString()
        )
      )
    );
    return _.uniqBy(otherSubjects, (timetable) => timetable._id.toString());
  }

  async clashesRemover(clashes) {
    let deletedClashes = new Map();
    let clashCounts = new Map();

    for (const clash of clashes) {
      [clash.clashModuleOne, clash.clashModuleTwo].forEach((module) => {
        if (module !== null) {
          clashCounts.set(
            module._id.toString(),
            (clashCounts.get(module._id.toString()) || 0) + 1
          );
        }
      });
    }

    for (const clash of clashes) {
      const { clashModuleOne: modOne, clashModuleTwo: modTwo } = clash;
      if (
        modOne !== null &&
        modTwo !== null &&
        !deletedClashes.has(modOne._id.toString()) &&
        !deletedClashes.has(modTwo._id.toString())
      ) {
        const modOneCount = clashCounts.get(modOne._id.toString());
        const modTwoCount = clashCounts.get(modTwo._id.toString());

        const modToDelete = this.shouldDeleteModule(
          modOne,
          modTwo,
          modOneCount,
          modTwoCount
        );
        if (modToDelete) {
          await this.deleteModule(modToDelete);
          deletedClashes.set(modToDelete._id.toString(), modToDelete);
        }
      }
    }

    const newTimetables = await Timetable.find();
    this.timetables = newTimetables;

    return Array.from(deletedClashes.values());
  }

  shouldDeleteModule(modOne, modTwo, modOneCount, modTwoCount) {
    if (modOneCount !== modTwoCount) {
      return modOneCount > modTwoCount ? modOne : modTwo;
    } else {
      return modOne.subject.duration > modTwo.subject.duration
        ? modTwo
        : modOne;
    }
  }

  async deleteModule(module) {
    await Timetable.findByIdAndDelete(module._id);
  }
}

module.exports = OptimizeTimetable;
