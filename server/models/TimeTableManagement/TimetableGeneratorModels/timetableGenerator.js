const { SpecBatch } = require("../specBatch");
const { Subject } = require("../subject");
const { LecturerPreference } = require("../lecturerPreference");
const { Day } = require("../day");
const { StartTime } = require("../startTime");
const { CurrSemFunction } = require("../functionality");
const { Timetable, validate, doesExists } = require("../timetable");
const _ = require("lodash");

class TimetableGenerationAlgorithm {
  constructor(specBatches) {
    this.specBatches = specBatches;
    this.subjects = [];
    this.lecturerPreferences = [];
    this.SubjectsWithoutPreferences = [];
    this.timetables = [];
    this.fitnessScores = [];
    this.subjectIdsInUse = new Set();
  }

  async saveTimetablesInDatabase(timetableArr) {
    let subjectWithIssues = [];
    for (const timetable of timetableArr) {
      // const { error } = validate(timetable);
      // if (error) return;

      const exists = await doesExists(timetable);
      if (exists) return;

      const currSemester = await CurrSemFunction.findOne({
        functionName: timetable.functionName,
      });
      if (!currSemester) return;
      const subject = await Subject.findById(timetable.subjectId);
      if (!subject) return;

      const day = await Day.findById(timetable.dayId);
      if (!day) return;

      const startTime = await StartTime.findById(timetable.startTimeId);
      if (!startTime) return;

      const newTimetable = new Timetable({
        currSemester: currSemester,
        subject: subject,
        lectureHall: {
          _id: "",
          hallid: "",
          capacity: 0,
          assigned: false,
        },
        day: day,
        startTime: startTime,
      });

      await newTimetable.save();
    }
  }

  getTimetables() {
    return this.timetables;
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

  async getLecturerPreferences() {
    const promises = this.subjects.map(async (subject) => {
      const preferences = await LecturerPreference.find({
        "subject._id": subject._id,
      });
      if (!preferences || preferences.length === 0) {
        this.SubjectsWithoutPreferences.push(subject);
        return undefined;
      }
      return preferences;
    });
    const results = await Promise.all(promises);
    this.lecturerPreferences = _.flatten(
      results.filter((result) => result !== undefined)
    );
  }

  async initializePopulation() {
    await this.getSubjects();
    await this.getLecturerPreferences();
    this.timetables = [];
    this.subjectIdsInUse.clear();
    this.initializeSubjectsWithPreferences(this.subjects);
    await this.initializeSubjectsWithoutPreferences(
      this.SubjectsWithoutPreferences
    );
  }

  initializeSubjectsWithPreferences(subjects) {
    subjects.forEach((subject) => {
      const preference = this.lecturerPreferences.find(
        (p) => p.subject._id.toString() === subject._id.toString()
      );
      if (preference && !this.subjectIdsInUse.has(subject._id.toString())) {
        const randomIndex = Math.floor(
          Math.random() * preference.daysStartTimes.length
        );
        const randomDayStartTime = preference.daysStartTimes[randomIndex];
        const timetable = {
          functionName: "getCurrSemester",
          subjectId: subject._id,
          lectureHallId: "null",
          dayId: randomDayStartTime.day._id,
          startTimeId: randomDayStartTime.startTime._id,
        };
        this.timetables.push(timetable);
        this.subjectIdsInUse.add(subject._id.toString());
      }
    });
  }

  async initializeSubjectsWithoutPreferences(subjects) {
    const days = await Day.find().sort({ index: 1 });
    const startTimes = await StartTime.find().sort({ index: 1 });

    for (const subject of subjects) {
      if (!this.subjectIdsInUse.has(subject._id.toString())) {
        let newStartTimes = [];
        for (const startTime of startTimes) {
          if (
            (startTime.index < 5 && startTime.index + subject.duration <= 5) ||
            (startTime.index > 5 && !(startTime.index + subject.duration > 10))
          ) {
            newStartTimes.push(startTime);
          }
        }
        if (newStartTimes.length > 0) {
          const randomDay = days[Math.floor(Math.random() * days.length)];
          const randomStartTime =
            newStartTimes[Math.floor(Math.random() * newStartTimes.length)];

          const timetable = {
            functionName: "getCurrSemester",
            subjectId: subject._id,
            lectureHallId: "null",
            dayId: randomDay._id,
            startTimeId: randomStartTime._id,
          };
          this.timetables.push(timetable);
          this.subjectIdsInUse.add(subject._id.toString());
        }
      }
    }
  }

  async calculateFitness(timetable) {
    let score = 100;
    const lecturerSchedules = {};

    for (let session of timetable) {
      const subjectDetails = this.subjects.find(
        (s) => s._id.toString() === session.subjectId.toString()
      );
      const batchesForSession = subjectDetails.specBatches;
      const otherSubjects = this.subjects.filter((subject) =>
        subject.specBatches.some((subjectBatch) =>
          batchesForSession.some(
            (sessionBatch) =>
              sessionBatch._id.toString() === subjectBatch._id.toString()
          )
        )
      );
      const uniqueSubjects = _.uniqBy(otherSubjects, (subject) =>
        subject._id.toString()
      );
      let combinedTables = [];
      for (let i = 0; i < uniqueSubjects.length; i++) {
        const subject = uniqueSubjects[i];
        this.timetables.forEach((element) => {
          if (element.subjectId.toString() === subject._id.toString()) {
            combinedTables.push(element);
          }
        });
      }

      const results = await Promise.all(
        combinedTables.map(async (s) => {
          const sessionData = await Subject.findById(session.subjectId);
          const sData = await Subject.findById(s.subjectId);
          const sDay = await Day.findById(s.dayId);
          const sStartTime = await StartTime.findById(s.startTimeId);
          const sessionDay = await Day.findById(session.dayId);
          const sessionStartTime = await StartTime.findById(
            session.startTimeId
          );
          const sDuration = (
            await Subject.findById(s.subjectId).populate("duration")
          ).duration;
          const sessionDuration = (
            await Subject.findById(session.subjectId).populate("duration")
          ).duration;

          const isOverlapping =
            !(sessionData._id.toString() === sData._id.toString()) &&
            sDay._id.toString() === sessionDay._id.toString() &&
            (sStartTime.index === sessionStartTime.index ||
              (sStartTime.index + sDuration > sessionStartTime.index &&
                sStartTime.index + sDuration <=
                  sessionStartTime.index + sessionDuration) ||
              (sessionStartTime.index + sessionDuration > sStartTime.index &&
                sessionStartTime.index + sessionDuration <=
                  sStartTime.index + sDuration));

          if (isOverlapping) {
            if (sData._id.toString() === sessionData._id.toString()) {
              count++;
            }
          }
          return isOverlapping ? s : null;
        })
      );

      const overlappingSessions = await results.filter((s) => s !== null);

      if (overlappingSessions.length > 1) {
        score -= 10 * overlappingSessions.length;
      }

      const resultDoubleBook = await Promise.all(
        this.timetables.map(async (s) => {
          const lectSessionData = await Subject.findById(session.subjectId);
          const lectSData = await Subject.findById(s.subjectId);
          const lectSDay = await Day.findById(s.dayId);
          const lectSStartTime = await StartTime.findById(s.startTimeId);
          const lectSessionDay = await Day.findById(session.dayId);
          const lectSessionStartTime = await StartTime.findById(
            session.startTimeId
          );
          const lectSDuration = (
            await Subject.findById(s.subjectId).populate("duration")
          ).duration;
          const lectSessionDuration = (
            await Subject.findById(session.subjectId).populate("duration")
          ).duration;
          const sLecturer = (
            await Subject.findById(s.subjectId).populate("lecturer")
          ).lecturer;
          const sessionLecturer = (
            await Subject.findById(session.subjectId).populate("lecturer")
          ).lecturer;

          const islecturerDoubleBook =
            !(lectSessionData._id.toString() === lectSData._id.toString()) &&
            sLecturer._id.toString() === sessionLecturer._id.toString() &&
            lectSDay._id.toString() === lectSessionDay._id.toString() &&
            (lectSStartTime.index === lectSessionStartTime.index ||
              (lectSStartTime.index + lectSDuration >
                lectSessionStartTime.index &&
                lectSStartTime.index + lectSDuration <=
                  lectSessionStartTime.index + lectSessionDuration) ||
              (lectSessionStartTime.index + lectSessionDuration >
                lectSStartTime.index &&
                lectSessionStartTime.index + lectSessionDuration <=
                  lectSStartTime.index + lectSDuration));

          return islecturerDoubleBook ? s : null;
        })
      );

      const lecturerDoubleBook = await resultDoubleBook.filter(
        (s) => s !== null
      );
      if (lecturerDoubleBook.length > 1) {
        score -= 5 * lecturerDoubleBook.length;
      }
    }
    return score;
  }

  selectParent() {
    const totalFitness = this.fitnessScores.reduce(
      (acc, score) => acc + score,
      0
    );
    const pick = Math.random() * totalFitness;
    let current = 0;
    for (let i = 0; i < this.timetables.length; i++) {
      current += this.fitnessScores[i];
      if (current > pick) {
        return this.timetables[i];
      }
    }
  }

  crossover(parent1, parent2) {
    const child = {
      subjectId: parent1.subjectId,
      dayId: Math.random() < 0.5 ? parent1.dayId : parent2.dayId,
      startTimeId:
        Math.random() < 0.5 ? parent1.startTimeId : parent2.startTimeId,
      lectureHallId: "null",
    };
    return child;
  }

  async mutate(timetable) {
    const mutationChance = 0.05;
    if (Math.random() < mutationChance) {
      const days = await Day.find();
      const startTimes = await StartTime.find();
      const subject = this.subjects.find(
        (s) => s._id.toString() === timetable.subjectId.toString()
      );
      let newStartTimes = [];
      for (const startTime of startTimes) {
        if (
          (startTime.index < 5 && startTime.index + subject.duration <= 5) ||
          (startTime.index > 5 && !(startTime.index + subject.duration > 10))
        ) {
          newStartTimes.push(startTime);
        }
      }

      const randomDay = days[Math.floor(Math.random() * days.length)];
      const randomStartTime =
        newStartTimes[Math.floor(Math.random() * newStartTimes.length)];
      timetable.dayId = randomDay._id;
      timetable.startTimeId = randomStartTime._id;
    }
  }

  async runEvolution(cycles = 3) {
    let bestGeneration = [];
    let bestFitnessScore = -Infinity;

    for (let i = 0; i < cycles; i++) {
      this.fitnessScores = await Promise.all(
        this.timetables.map((timetable) => this.calculateFitness([timetable]))
      );
      let newGeneration = [];
      const usedSubjectIds = new Set();
      while (newGeneration.length < this.timetables.length) {
        // let parent1, parent2;

        // parent1 = await this.selectParent();
        // parent2 = await this.selectParent();

        const parent1 = this.selectParent();
        const parent2 = this.selectParent();

        let child = this.crossover(parent1, parent2);
        if (!usedSubjectIds.has(child.subjectId)) {
          await this.mutate(child);
          newGeneration.push(child);
          usedSubjectIds.add(child.subjectId);
        }
      }

      const generationFitness = newGeneration.reduce(
        (acc, timetable, index) => acc + this.fitnessScores[index],
        0
      );
      if (generationFitness > bestFitnessScore) {
        bestFitnessScore = generationFitness;
        bestGeneration = newGeneration;
      }
      console.log(i);
    }
    this.timetables = bestGeneration;
  }
}

module.exports = TimetableGenerationAlgorithm;
