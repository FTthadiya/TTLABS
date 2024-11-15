const mongoose = require("mongoose");
const request = require("supertest");
const { Subject } = require("../../models/TimeTableManagement/subject");
const { Lecturer } = require("../../models/TimeTableManagement/lecturer");
const { SpecBatch } = require("../../models/TimeTableManagement/specBatch");
const express = require("express");
const subjects = require("../../routes/TimeTableManagement/subjects");
const app = express();
app.use(express.json());
app.use(subjects);

beforeAll(async () => {
  await mongoose.connect("mongodb://127.0.0.1:27017/TTLABS_TB");

  await Subject.deleteMany();
  await Lecturer.deleteMany();
  await SpecBatch.deleteMany();
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe("GET /", () => {
  it("should return all subjects", async () => {
    await Subject.deleteMany();
    await SpecBatch.deleteMany();
    await Lecturer.deleteMany();
    const lecturers = await Lecturer.create({
      _id: new mongoose.Types.ObjectId(),
      lecturerName: "John Doe",
      email: "john.doe@example.com",
    });
    const specBatches = await SpecBatch.create({
      _id: new mongoose.Types.ObjectId(),
      specName: "Software Engineering",
      year: 1,
      semester: 1,
    });

    const subjects = [
      {
        subjectName: "Hardware Fundamentals",
        subjectCode: "HF2001",
        sessionType: "Lecture",
        studentCount: 30,
        duration: 2,
        lecturer: lecturers,
        specBatches: [specBatches],
      },
      {
        subjectName: "Design Analysis of Algorithms",
        subjectCode: "DAA3001",
        sessionType: "Lab",
        studentCount: 25,
        duration: 3,
        lecturer: lecturers,
        specBatches: [specBatches],
      },
    ];
    await Subject.insertMany(subjects);

    const response = await request(app).get("/");
    expect(response.statusCode).toBe(200);
    expect(response.body.length).toBe(2);
  });

  it("should return an empty array if no subjects exist", async () => {
    await Subject.deleteMany();
    const response = await request(app).get("/");
    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual([]);
  });
});

describe("POST /", () => {
  it("should create a new subject when data is valid", async () => {
    const lecturer = await Lecturer.create({
      _id: new mongoose.Types.ObjectId(),
      lecturerName: "New Lecturer",
      email: "newlecturer@example.com",
    });
    const specBatch = await SpecBatch.create({
      _id: new mongoose.Types.ObjectId(),
      specName: "Information Technology",
      year: 1,
      semester: 1,
    });
    const subjectData = {
      subjectName: "Mathematics for Computing",
      subjectCode: "Math1090",
      sessionType: "Lecture",
      studentCount: 100,
      duration: 2,
      lecturerId: lecturer._id,
      specBatchesIds: [specBatch._id],
    };

    const response = await request(app).post("/").send(subjectData);
    expect(response.statusCode).toBe(200);
    expect(response.body.subjectName).toBe(subjectData.subjectName);

    await Lecturer.findByIdAndDelete(lecturer._id);
    await SpecBatch.findByIdAndDelete(specBatch._id);
    await Subject.findByIdAndDelete(response.body._id);
  });

  it("should return an error for invalid data", async () => {
    const subjectData = {
      subjectName: "xy",
      subjectCode: "123",
      sessionType: "Invalid",
      studentCount: 0,
      duration: 0,
    };

    const response = await request(app).post("/").send(subjectData);
    expect(response.statusCode).toBe(400);
  });

  it("should prevent creation of a subject with duplicate details", async () => {
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

    const response = await request(app).post("/").send(subjectData);
    expect(response.statusCode).toBe(400);
    expect(response.text).toContain(
      "Subject with the same details already exists"
    );

    await Lecturer.deleteMany();
    await SpecBatch.deleteMany();
    await Subject.deleteMany();
  });
});

describe("PUT /:id", () => {
  it("should update subject successfully", async () => {
    const lecturer = await Lecturer.create({
      _id: new mongoose.Types.ObjectId(),
      lecturerName: "Update Test",
      email: "update.test@example.com",
    });
    const specBatch = await SpecBatch.create({
      _id: new mongoose.Types.ObjectId(),
      specName: "Computer Comunications and Networking",
      year: 1,
      semester: 1,
    });
    const subjectData = {
      subjectName: "Mathematics for Computing",
      subjectCode: "Math1090",
      sessionType: "Lecture",
      studentCount: 100,
      duration: 2,
      lecturerId: lecturer._id,
      specBatchesIds: [specBatch._id],
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

    const updatedData = {
      subjectName: "Computer Networks",
      subjectCode: "CN2000",
      sessionType: "Lecture",
      studentCount: 50,
      duration: 4,
      lecturerId: lecturer._id,
      specBatchesIds: [specBatch._id],
    };

    const response = await request(app)
      .put(`/${subject._id}`)
      .send(updatedData);
    expect(response.statusCode).toBe(200);
    expect(response.body.subjectName).toBe("Computer Networks");

    await Subject.findByIdAndDelete(subject._id);
    await Lecturer.findByIdAndDelete(lecturer._id);
    await SpecBatch.findByIdAndDelete(specBatch._id);
  });

  it("should return 404 if subject does not exist", async () => {
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

    const nonExistentId = new mongoose.Types.ObjectId().toString();
    const response = await request(app)
      .put(`/${nonExistentId}`)
      .send({
        subjectName: "Nonexistent",
        subjectCode: "NON101",
        sessionType: "Lecture",
        studentCount: 100,
        duration: 2,
        lecturerId: lecturer._id,
        specBatchesIds: [specBatch._id],
      });
    expect(response.statusCode).toBe(404);
    await Lecturer.findByIdAndDelete(lecturer._id);
    await SpecBatch.findByIdAndDelete(specBatch._id);
  });
});

describe("DELETE /:id", () => {
  it("should delete the subject successfully", async () => {
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

    const response = await request(app).delete(`/${subject._id}`);
    expect(response.statusCode).toBe(200);

    await Lecturer.findByIdAndDelete(lecturer._id);
    await SpecBatch.findByIdAndDelete(specBatch._id);
  });

  it("should return 404 if the subject does not exist", async () => {
    const nonExistentId = new mongoose.Types.ObjectId();
    const response = await request(app).delete(`/${nonExistentId}`);
    expect(response.statusCode).toBe(404);
  });
});
