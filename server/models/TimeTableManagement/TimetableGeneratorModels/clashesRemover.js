const Graph = require("graphology");
const graph = new Graph();
const _ = require("lodash");

const { Timetable } = require("../timetable");
const { CurrSemFunction } = require("../functionality");
const { Functionality } = require("../functionality");
const { Day } = require("../day");
const { StartTime } = require("../startTime");

class ClashesRemover {
  constructor(specBatches) {
    this.specBatches = specBatches;
    this.graph = graph;
    this.subjects = [];
    this.days = [];
    this.times = [];
    this.timetables = [];
    this.wrongfullyAssigned = [];
  }

  async retrieveTimetables() {
    let func = await CurrSemFunction.findOne({
      functionName: "getCurrSemester",
    });

    if (!func) return res.status(404).send("Functionality not found");

    this.timetables = await Timetable.find({
      "currSemester.year": func.year,
      "currSemester.semester.periodIndex": func.semester.periodIndex,
    });

    Timetable.find({
      "currSemester.year": func.year,
      "currSemester.semester.periodIndex": func.semester.periodIndex,
    })
      .then((timetables) => {
        this.timetables = timetables;
      })
      .catch((err) => {
        console.error("Error retrieving timetables:", err);
      });
  }

  async retreiveDaysAndTimes() {
    this.days = await Day.find();
    this.times = await StartTime.find();
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
    const uniqueSubject = _.uniqBy(otherSubjects, (timetable) =>
      timetable._id.toString()
    );
    return uniqueSubject;
  }

  removeDuplicateClashes(clashes) {
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

  addNodesToGraphAndEdges() {
    this.timetables.forEach((session) => {
      this.graph.addNode(session._id, { sessionData: session });
    });

    this.timetables.forEach((session, index) => {
      this.timetables.forEach((session2, index2) => {
        if (session._id.toString() !== session2._id.toString()) {
          if (!this.graph.hasEdge(session._id, session2._id)) {
            this.graph.addEdge(session._id, session2._id);
          }
        }
      });

      const combinedTimetables = this.getCommonTimetable(session);
      combinedTimetables.forEach((session2, index) => {
        if (session._id.toString() !== session2._id.toString()) {
          if (!this.graph.hasEdge(session._id, session2._id)) {
            this.graph.addEdge(session._id, session2._id);
          }
        }
      });
    });
  }

  async colorGraph() {
    const nodes = this.graph.nodes();
    const colors = {};
    const nodesToDelete = new Set();

    let allPossibleColors = new Set();
    for (let dayIndex = 1; dayIndex <= 5; dayIndex++) {
      for (let timeIndex = 1; timeIndex <= 9; timeIndex++) {
        allPossibleColors.add(`${dayIndex}=${timeIndex}`);
      }
    }

    for (let node of nodes) {
      const session = this.graph.getNodeAttribute(node, "sessionData");
      let availableColors = new Set(allPossibleColors);
      const neighbors = this.graph.neighbors(node);

      neighbors.forEach((neighbor) => {
        const neighborColor = colors[neighbor];
        if (neighborColor) {
          const [nDay, nStart] = neighborColor.split("=").map(Number);
          const neighborSession = this.graph.getNodeAttribute(
            neighbor,
            "sessionData"
          );
          const duration = neighborSession.subject.duration;

          for (let offset = 0; offset < duration; offset++) {
            availableColors.delete(`${nDay}=${nStart + offset}`);
          }
        }
      });

      let suitableColors = new Set(availableColors);

      let wrongTimes = new Set();
      for (let dayIndex = 1; dayIndex <= 5; dayIndex++) {
        for (let timeIndex = 1; timeIndex <= 9; timeIndex++) {
          if (timeIndex === 5) {
            wrongTimes.add(`${dayIndex}=${timeIndex}`);
          } else {
            if (
              (timeIndex <= 5 && timeIndex + session.subject.duration > 5) ||
              (timeIndex <= 9 && timeIndex + session.subject.duration > 10)
            ) {
              wrongTimes.add(`${dayIndex}=${timeIndex}`);
            }
          }
        }
      }

      suitableColors = new Set(
        [...suitableColors].filter((color) => !wrongTimes.has(color))
      );

      if (suitableColors.size === 0) {
        await Timetable.findByIdAndDelete(session._id);
        this.graph.dropNode(node);
      } else {
        colors[node] = suitableColors.values().next().value;
      }
    }

    let newTimetables = [];
    this.graph.nodes().forEach((node) => {
      const session = this.graph.getNodeAttribute(node, "sessionData");
      const [day, time] = colors[node].split("=").map(Number);

      let originalSession = this.timetables.find((s) => s._id === session._id);
      if (originalSession) {
        const setDay = this.days.find((d) => d.index === day);
        const setTime = this.times.find((t) => t.index === time);

        originalSession.day = setDay;
        originalSession.startTime = setTime;
        newTimetables.push(originalSession);
      }
    });
    this.timetables = newTimetables;
  }

  getTimetables() {
    return this.timetables;
  }

  async setNewValues() {
    for (const timetable of this.timetables) {
      const response = await Timetable.findByIdAndUpdate(
        timetable._id,
        {
          day: timetable.day,
          startTime: timetable.startTime,
        },
        { new: true }
      );
    }
  }

  async execute() {
    await this.retrieveTimetables();
    await this.retreiveDaysAndTimes();
    this.addNodesToGraphAndEdges();
    await this.colorGraph();
    await this.setNewValues();
  }
}

module.exports = ClashesRemover;
