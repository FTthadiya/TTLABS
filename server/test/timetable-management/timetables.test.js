const mongoose = require("mongoose");
const request = require("supertest");
const {
  Timetable,
  validate,
} = require("../../models/TimeTableManagement/timetable");
const { Subject } = require("../../models/TimeTableManagement/subject");
const { Lecturer } = require("../../models/TimeTableManagement/lecturer");
const { SpecBatch } = require("../../models/TimeTableManagement/specBatch");
const { Day } = require("../../models/TimeTableManagement/day");
const { StartTime } = require("../../models/TimeTableManagement/startTime");
const {
  CurrSemFunction,
} = require("../../models/TimeTableManagement/functionality");
const HallModel = require("../../models/LabHall-Management/Halls");
const timetables = require("../../routes/TimeTableManagement/timetables");
const express = require("express");
const app = express();
app.use(express.json());
app.use(timetables);

beforeAll(async () => {
  await mongoose.connect("mongodb://127.0.0.1:27017/TTLABS_TB");
  await Timetable.deleteMany();
  await Subject.deleteMany();
  await Lecturer.deleteMany();
  await SpecBatch.deleteMany();
  await Day.deleteMany();
  await StartTime.deleteMany();
  await CurrSemFunction.deleteMany();
  await HallModel.deleteMany();
  await seedDatabase();
});

afterAll(async () => {
  await mongoose.connection.close();
});

async function seedDatabase() {
  const lecturer = await Lecturer.create({
    _id: new mongoose.Types.ObjectId(),
    lecturerName: "John Doe",
    email: "duplicate@example.com",
  });
  const specBatch = await SpecBatch.create({
    _id: new mongoose.Types.ObjectId(),
    specName: "Computer Comunications and Networking",
    year: 1,
    semester: 1,
  });
  const subjectData = {
    subjectName: "Computer Science",
    subjectCode: "CS101",
    sessionType: "Lecture",
    studentCount: 120,
    duration: 1,
    lecturerId: lecturer._id.toString(),
    specBatchesIds: [specBatch._id.toString()],
  };

  const subject = new Subject({
    subjectName: subjectData.subjectName,
    subjectCode: subjectData.subjectCode,
    sessionType: subjectData.sessionType,
    studentCount: subjectData.studentCount,
    duration: subjectData.duration,
    lecturer: {
      _id: lecturer._id,
      lecturerName: lecturer.lecturerName,
      email: lecturer.email,
    },
    specBatches: [
      {
        _id: specBatch._id,
        specName: specBatch.specName,
        year: specBatch.year,
        semester: specBatch.semester,
      },
    ],
  });

  await subject.save();

  const day = await Day.create({
    _id: new mongoose.Types.ObjectId(),
    index: 1,
    name: "Monday",
  });
  const startTime = await StartTime.create({
    _id: new mongoose.Types.ObjectId(),
    index: 1,
    name: "08:30",
  });

  const currSemFunction = await CurrSemFunction.create({
    _id: new mongoose.Types.ObjectId(),
    functionName: "getCurrSemester",
    year: 2024,
    semester: { periodIndex: 1, periodName: "February - June" },
  });

  const timetable = await Timetable.create({
    currSemester: currSemFunction,
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
}

describe("GET /", () => {
  it("should return all timetables", async () => {
    const response = await request(app).get("/");
    expect(response.statusCode).toBe(200);
    expect(response.body.length).toBeGreaterThan(0);
  });

  it("should return specific timetable details", async () => {
    const timetable = await Timetable.findOne();
    const response = await request(app).get(`/${timetable._id}`);
    expect(response.statusCode).toBe(200);
    expect(response.body.subject.subjectName).toBe("Computer Science");
  });
});

describe("POST /", () => {
  it("should create a new timetable entry", async () => {
    const day = await Day.findOne();
    const startTime = await StartTime.findOne();
    const lecturer = await Lecturer.findOne();
    const specBatch = await SpecBatch.findOne();

    const subjectData = {
      subjectName: "Hardware Fundamentals",
      subjectCode: "HF2001",
      sessionType: "Lecture",
      studentCount: 50,
      duration: 1,
      lecturerId: lecturer._id.toString(),
      specBatchesIds: [specBatch._id.toString()],
    };

    const subject = new Subject({
      subjectName: subjectData.subjectName,
      subjectCode: subjectData.subjectCode,
      sessionType: subjectData.sessionType,
      studentCount: subjectData.studentCount,
      duration: subjectData.duration,
      lecturer: {
        _id: lecturer._id,
        lecturerName: lecturer.lecturerName,
        email: lecturer.email,
      },
      specBatches: [
        {
          _id: specBatch._id,
          specName: specBatch.specName,
          year: specBatch.year,
          semester: specBatch.semester,
        },
      ],
    });

    await subject.save();
    const savedSubject = await Subject.findOne({ subjectCode: "HF2001" });

    const newTimetable = {
      functionName: "getCurrSemester",
      subjectId: savedSubject._id,
      dayId: day._id,
      startTimeId: startTime._id,
    };

    const response = await request(app).post("/").send(newTimetable);
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty("_id");
  });

  it("should not create a duplicate timetable entry", async () => {
    const timetable = await Timetable.findOne();
    const newTimetable = {
      functionName: timetable.currSemester.functionName,
      subjectId: timetable.subject._id,
      dayId: timetable.day._id,
      startTimeId: timetable.startTime._id,
    };

    const response = await request(app).post("/").send(newTimetable);
    expect(response.statusCode).toBe(400);
    expect(response.text).toContain("already exists");
  });
});

describe("PUT /lectureHallUpdate/:timetableId", () => {
  it("should update the lecture hall details of a timetable", async () => {
    let hall = await HallModel.findOne({ hallid: "LT-104" });
    if (!hall) {
      const hallObj = {
        hallid: "LT-104",
        capacity: 120,
        assigned: false,
      };
      const newHall = new HallModel(hallObj);
      await newHall.save();
      hall = await HallModel.findOne({ hallid: "LT-104" });
    }

    const timetable = await Timetable.findOne();
    const updatedHallData = {
      _id: hall._id,
      hallid: hall.hallid,
      capacity: hall.capacity,
      assigned: false,
    };

    const response = await request(app)
      .put(`/lectureHallUpdate/${timetable._id}`)
      .send(updatedHallData);

    expect(response.statusCode).toBe(200);
    expect(response.body.lectureHall.hallid).toBe("LT-104");
  });

  it("should return 404 for non-existing timetable update", async () => {
    const hall = await HallModel.findOne({ hallid: "LT-104" });

    const newTimetableId = new mongoose.Types.ObjectId();

    const response = await request(app)
      .put(`/lectureHallUpdate/${newTimetableId}`)
      .send(hall);
    expect(response.statusCode).toBe(404);
  });
});

describe("DELETE /delete/all", () => {
  it("should delete all timetables for the current semester", async () => {
    const response = await request(app).delete("/delete/all");
    expect(response.statusCode).toBe(200);
    expect(response.text).toBe("All timetables removed successfully");

    const remaining = await Timetable.find();
    expect(remaining.length).toBe(0);
  });
});
