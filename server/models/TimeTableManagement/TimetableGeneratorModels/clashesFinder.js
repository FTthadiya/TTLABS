const _ = require("lodash");
const { Subject } = require("../subject");
const { Timetable } = require("../timetable");
const { Day } = require("../day");
const { StartTime } = require("../startTime");
const axios = require("axios");

class ClashesFinder {
  constructor(specBatches) {
    this.specBatches = specBatches;
    this.subjects = [];
    this.timetables = [];
    this.clashes = [];
    this.matrixes = [];
  }

  async getClashes() {
    const timetables = await Timetable.find();
    let clashesArray = [];

    await Promise.all(
      timetables.map(async (session) => {
        const batchesForSession = session.subject.specBatches;
        const otherSubjects = timetables.filter((timetable) =>
          timetable.subject.specBatches.some((subjectBatch) =>
            batchesForSession.some(
              (batch) => batch._id.toString() === subjectBatch._id.toString()
            )
          )
        );
        const combinedTables = _.uniqBy(otherSubjects, (timetable) =>
          timetable._id.toString()
        );

        await Promise.all(
          combinedTables.map(async (s) => {
            const isOverlapping =
              !(session.subject._id.toString() === s.subject._id.toString()) &&
              session.day._id.toString() === s.day._id.toString() &&
              ((session.startTime.index <= s.startTime.index &&
                session.startTime.index + session.subject.duration >
                  s.startTime.index) ||
                (s.startTime.index <= session.startTime.index &&
                  s.startTime.index + s.subject.duration >
                    session.startTime.index));

            if (isOverlapping) {
              const clash = {
                clashModuleOne: session,
                clashModuleTwo: s,
              };
              clashesArray.push(clash);
            }
          })
        );
      })
    );

    let uniqueClashes = await this.removeDuplicateClashes(clashesArray);
    return uniqueClashes;
  }

  async removeDuplicateClashes(clashes) {
    const seen = new Set();
    const uniqueClashes = [];

    clashes.forEach((clash) => {
      const id1 = clash.clashModuleOne.subject._id;
      const id2 = clash.clashModuleTwo.subject._id;

      const sortedIds = [id1, id2].sort();

      const key = sortedIds.join("-");

      if (!seen.has(key)) {
        seen.add(key);
        uniqueClashes.push(clash);
      }
    });

    return uniqueClashes;
  }

  async getSubjects() {
    const results = await Promise.all(
      this.specBatches.map((specBatch) =>
        Subject.find({ "specBatches._id": specBatch }).populate("specBatches")
      )
    );
    this.subjects = _.uniqBy(_.flatten(results), (subject) =>
      subject._id.toString()
    );
  }

  async retrieveTimetables() {
    let retrievedTimetables = [];
    await Promise.all(
      this.specBatches.map(async (specBatch) => {
        const timetables = await Timetable.find({
          "subject.specBatches._id": specBatch,
        });
        retrievedTimetables.push(...timetables);
      })
    );

    const uniqueTimetables = _.uniqBy(retrievedTimetables, (timetable) =>
      timetable._id.toString()
    );
    this.timetables = uniqueTimetables;
  }

  async getTimetablesForSubjects(timetables) {
    let clashesArray = [];

    for (const session of timetables) {
      const batchesForSession = session.subject.specBatches;
      const otherSubjects = timetables.filter((timetable) =>
        timetable.subject.specBatches.some((subjectBatch) =>
          batchesForSession.some(
            (batch) => batch._id.toString() === subjectBatch._id.toString()
          )
        )
      );
      const combinedTables = _.uniqBy(otherSubjects, (timetable) =>
        timetable._id.toString()
      );

      const result = await Promise.all(
        combinedTables.map(async (s) => {
          const isOverlapping =
            !(session.subject._id.toString() === s.subject._id.toString()) &&
            session.day._id.toString() === s.day._id.toString() &&
            ((session.startTime.index <= s.startTime.index &&
              session.startTime.index + session.subject.duration >
                s.startTime.index) ||
              (s.startTime.index <= session.startTime.index &&
                s.startTime.index + s.subject.duration >
                  session.startTime.index));

          if (isOverlapping) {
            const clash = {
              clashModuleOne: session,
              clashModuleTwo: s,
            };
            clashesArray.push(clash);
          }
        })
      );

      const resultDoubleBooked = await Promise.all(
        timetables.map(async (s) => {
          const isDoubleBooked =
            !(session.subject._id.toString() === s.subject._id.toString()) &&
            session.subject.lecturer._id.toString() ===
              s.subject.lecturer._id.toString() &&
            session.day._id.toString() === s.day._id.toString() &&
            ((session.startTime.index <= s.startTime.index &&
              session.startTime.index + session.subject.duration >
                s.startTime.index) ||
              (s.startTime.index <= session.startTime.index &&
                s.startTime.index + s.subject.duration >
                  session.startTime.index));

          if (isDoubleBooked) {
            const clash = {
              clashModuleOne: session,
              clashModuleTwo: s,
            };
            clashesArray.push(clash);
          }
        })
      );
    }

    let uniqueClashes = await this.removeDuplicateClashes(clashesArray);
    return uniqueClashes;
  }

  async clashesRemover(clashesList) {
    let storedClashes = [];
    let removedClashes = [];

    for (let clash of clashesList) {
      const clashOne = await Timetable.findById(clash.clashModuleOne._id);
      const clashTwo = await Timetable.findById(clash.clashModuleTwo._id);

      if (clashOne !== null && clashTwo !== null) {
        const clashOneInArray = storedClashes.some(
          (storedClash) =>
            storedClash._id.toString() === clashOne._id.toString()
        );
        const clashTwoInArray = storedClashes.some(
          (storedClash) =>
            storedClash._id.toString() === clashTwo._id.toString()
        );

        if (clashOneInArray && clashTwoInArray) {
          continue;
        } else if (clashOneInArray && !clashTwoInArray) {
          await Timetable.findByIdAndDelete(clashTwo._id);
          removedClashes.push(clashTwo);
        } else if (clashTwoInArray && !clashOneInArray) {
          await Timetable.findByIdAndDelete(clashOne._id);
          removedClashes.push(clashOne);
        } else {
          const randomNumber = Math.floor(Math.random() * 2);
          if (randomNumber === 0) {
            await Timetable.findByIdAndDelete(clashTwo._id);
            storedClashes.push(clashOne);
            removedClashes.push(clashTwo);
          } else {
            await Timetable.findByIdAndDelete(clashOne._id);
            storedClashes.push(clashTwo);
            removedClashes.push(clashOne);
          }
        }
      }
    }

    const uniqueRemovedClashes = _.uniqBy(removedClashes, (clash) =>
      clash._id.toString()
    );
    const uniqueStoredClashes = _.uniqBy(storedClashes, (clash) =>
      clash._id.toString()
    );
    return uniqueRemovedClashes;
  }

  async assignANewSlot(removedClashes) {
    let allPossibilities = [];
    let resolvedClashes = [];
    let subjectCount = {};

    for (const clash of removedClashes) {
      const batchesForSession = clash.subject.specBatches;
      const otherSubjects = this.timetables.filter((timetable) =>
        timetable.subject.specBatches.some((subjectBatch) =>
          batchesForSession.some(
            (batch) => batch._id.toString() === subjectBatch._id.toString()
          )
        )
      );
      const combinedTables = _.uniqBy(otherSubjects, (timetable) =>
        timetable._id.toString()
      );
      const columns = 5;
      const rows = 9;

      let matrix = Array.from({ length: rows + 1 }, () =>
        new Array(columns + 1).fill(0)
      );

      matrix[5] = new Array(columns + 1).fill(null);

      combinedTables.forEach((timetable) => {
        let blockedDay = timetable.day.index;
        let blockedTimes = [timetable.startTime.index];
        for (let i = 1; i <= timetable.subject.duration; i++) {
          const time = timetable.startTime.index + i;
          blockedTimes.push(time);
        }
        blockedTimes.forEach((time) => {
          if (
            time <= rows &&
            blockedDay <= columns &&
            matrix[time] &&
            matrix[time][blockedDay] !== null
          ) {
            matrix[time][blockedDay] = 1;
          }
        });
      });

      for (let i = 1; i <= columns; i++) {
        for (let j = 1; j <= rows; j++) {
          if (
            (j < 5 && j + clash.subject.duration <= 5) ||
            (j > 5 && !(j + clash.subject.duration > 10))
          ) {
            if (matrix[i][j] === 0) {
              let isBlocked = false;
              for (let k = 1; k <= clash.subject.duration; k++) {
                if (
                  matrix[i][j + k] === 1 ||
                  matrix[i][j + k] === null ||
                  matrix[i][j + k] === undefined
                ) {
                  isBlocked = true;
                  break;
                }
              }
              if (!isBlocked) {
                const assignedDay = await Day.findOne({ index: i });
                const assignedStartTime = await StartTime.findOne({ index: j });
                const newTimetableObj = {
                  session: clash.subject,
                  possibility: {
                    _id: clash._id,
                    currSemeseter: clash.currSemeseter,
                    subject: clash.subject,
                    lectureHall: clash.lectureHall,
                    day: assignedDay,
                    startTime: assignedStartTime,
                  },
                };
                allPossibilities.push(newTimetableObj);
              }
            }
          }
        }
      }
    }

    for (const possibility of allPossibilities) {
      const subjectId = possibility.session._id;

      if (subjectCount[subjectId]) {
        subjectCount[subjectId]++;
      } else {
        subjectCount[subjectId] = 1;
      }
    }
    allPossibilities = allPossibilities.filter(async (pos) => {
      const subjectId = pos.session._id;
      if (subjectCount[subjectId] === 1) {
        const timetableObj = {
          functionName: "getCurrSemester",
          subjectId: pos.session._id,
          lectureHallId: "null",
          dayId: pos.possibility.day._id,
          startTimeId: pos.possibility.startTime._id,
        };
        const result = await Timetable.findOne({
          "subject._id": pos.session._id,
        });
        if (result === null) {
          try {
            const response = await axios.post(
              "http://localhost:3001/api/timetables",
              timetableObj
            );
            return false;
          } catch (error) {
            console.log("Error:", error);
          }
        }
      }
      return true;
    });
    const highestScoreObjs = await this.scorePossibility(allPossibilities);
    for (const obj of highestScoreObjs) {
      const timetableObj = {
        functionName: "getCurrSemester",
        subjectId: obj.session._id,
        lectureHallId: "null",
        dayId: obj.possibility.day._id,
        startTimeId: obj.possibility.startTime._id,
      };
      const result = await Timetable.findOne({
        "subject._id": obj.session._id,
      });
      if (result === null) {
        try {
          const response = await axios.post(
            "http://localhost:3001/api/timetables",
            timetableObj
          );
        } catch (error) {
          console.log("Error:", error);
        }
      }
    }
    return allPossibilities;
  }

  async scorePossibility(allPossibilities) {
    let highestScores = [];

    for (const pos of allPossibilities) {
      const batchesForSession = pos.session.specBatches;
      let score = 100;
      let overlaps = [];

      const otherSubjects = allPossibilities.filter((timetable) =>
        timetable.session.specBatches.some((subjectBatch) =>
          batchesForSession.some(
            (batch) => batch._id.toString() === subjectBatch._id.toString()
          )
        )
      );

      if (otherSubjects.length > 0) {
        const combinedTables = _.uniqBy(otherSubjects, (timetable) =>
          timetable.session._id.toString()
        );

        combinedTables.forEach((timetable) => {
          const isOverlapping =
            timetable.session._id.toString() === pos.session._id.toString() &&
            timetable.possibility.day._id.toString() ===
              pos.possibility.day._id.toString() &&
            ((timetable.possibility.startTime.index <=
              pos.possibility.startTime.index &&
              timetable.possibility.startTime.index +
                timetable.possibility.subject.duration >
                pos.possibility.startTime.index) ||
              (pos.possibility.startTime.index <=
                timetable.possibility.startTime.index &&
                pos.possibility.startTime.index +
                  pos.possibility.subject.duration >
                  timetable.possibility.startTime.index));

          if (isOverlapping) {
            const overlapObj = {
              overlapped: pos.session._id,
              overlapOne: pos.possibility,
              overlapTwo: timetable.possibility,
            };
            overlaps.push(overlapObj);
          }
        });
      }

      score -= overlaps.length * 10;
      const sessionIndex = highestScores.findIndex(
        (item) => item.session._id.toString() === pos.session._id.toString()
      );

      if (sessionIndex === -1 || highestScores[sessionIndex].score < score) {
        if (sessionIndex !== -1) {
          highestScores[sessionIndex] = {
            session: pos.session,
            possibility: pos.possibility,
            score: score,
          };
        } else {
          highestScores.push({
            session: pos.session,
            possibility: pos.possibility,
            score: score,
          });
        }
      }
    }
    return highestScores;
  }

  async execute() {
    await this.getSubjects();
    await this.retrieveTimetables();
    const clashesList = await this.getTimetablesForSubjects(this.timetables);
    const removedClashes = await this.clashesRemover(clashesList);
    const newtimetables = await Timetable.find();
    this.timetables = newtimetables;
    await this.assignANewSlot(removedClashes);
  }
}

module.exports = ClashesFinder;
