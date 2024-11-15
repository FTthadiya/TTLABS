const mongoose = require("mongoose");
const request = require("supertest");
const { Lecturer } = require("../../models/TimeTableManagement/lecturer");
const express = require("express");
const lecturers = require("../../routes/TimeTableManagement/lecturers");
const app = express();
app.use(express.json());
app.use(lecturers);

beforeAll(async () => {
  await mongoose.connect("mongodb://127.0.0.1:27017/TTLABS_TB");
  await Lecturer.deleteMany();
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe("GET /", () => {
  it("should return all lecturers", async () => {
    await Lecturer.deleteMany();
    const lecturers = [
      {
        _id: new mongoose.Types.ObjectId(),
        lecturerName: "John Doe",
        email: "john.doe@example.com",
      },
      {
        _id: new mongoose.Types.ObjectId(),
        lecturerName: "Jane Doe",
        email: "jane.doe@example.com",
      },
    ];
    await Lecturer.insertMany(lecturers);

    const response = await request(app).get("/");
    expect(response.statusCode).toBe(200);
    expect(response.body.length).toBe(2);
  });

  it("should return an empty array if no lecturers exist", async () => {
    await Lecturer.deleteMany();
    const response = await request(app).get("/");
    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual([]);
  });
});

describe("POST /", () => {
  it("should create a new lecturer when data is valid", async () => {
    const lecturerData = {
      _id: new mongoose.Types.ObjectId(),
      lecturerName: "New Lecturer",
      email: "new.lecturer@example.com",
    };
    const response = await request(app).post("/").send(lecturerData);
    expect(response.statusCode).toBe(200);
    expect(response.body.email).toBe(lecturerData.email);

    await Lecturer.findByIdAndDelete(response.body._id);
  });

  it("should return an error for invalid data", async () => {
    const lecturerData = {
      _id: new mongoose.Types.ObjectId(),
      lecturerName: "Ab",
      email: "invalid",
    };
    const response = await request(app).post("/").send(lecturerData);
    expect(response.statusCode).toBe(400);
  });

  it("should prevent creation of duplicate email", async () => {
    const lecturerData = {
      _id: new mongoose.Types.ObjectId(),
      lecturerName: "John Doe",
      email: "duplicate@example.com",
    };
    await Lecturer.create(lecturerData);

    const response = await request(app).post("/").send(lecturerData);
    expect(response.statusCode).toBe(400);
    expect(response.text).toBe("Lecturer already registered with given email");

    await Lecturer.findByIdAndDelete(lecturerData._id);
  });
});

describe("PUT /:id", () => {
  it("should update lecturer successfully", async () => {
    const lecturer = {
      _id: new mongoose.Types.ObjectId(),
      lecturerName: "Update Test",
      email: "update.test@example.com",
    };
    let result = await Lecturer.create(lecturer);
    const updatedData = {
      _id: result._id,
      lecturerName: "Updated Name",
      email: "updated.email@example.com",
    };
    const response = await request(app).put(`/${result._id}`).send(updatedData);
    expect(response.statusCode).toBe(200);
    expect(response.body.lecturerName).toBe("Updated Name");

    await Lecturer.findByIdAndDelete(lecturer._id);
  });

  it("should return 404 if lecturer does not exist", async () => {
    const nonExistentId = new mongoose.Types.ObjectId().toString();
    const response = await request(app).put(`/${nonExistentId}`).send({
      _id: nonExistentId,
      lecturerName: "Nonexistent",
      email: "nonexistent@example.com",
    });
    expect(response.statusCode).toBe(404);
  });
});

describe("DELETE /:id", () => {
  it("should delete the lecturer successfully", async () => {
    const lecturer = await Lecturer.create({
      _id: new mongoose.Types.ObjectId(),
      lecturerName: "Delete Test",
      email: "delete.test@example.com",
    });

    const response = await request(app).delete(`/${lecturer._id}`);
    expect(response.statusCode).toBe(200);
  });

  it("should return 404 if the lecturer does not exist", async () => {
    const nonExistentId = new mongoose.Types.ObjectId();
    const response = await request(app).delete(`/${nonExistentId}`);
    expect(response.statusCode).toBe(404);
  });
});

describe("GET /:id", () => {
  it("should return a specific lecturer", async () => {
    const lecturer = await Lecturer.create({
      _id: new mongoose.Types.ObjectId(),
      lecturerName: "Specific Test",
      email: "specific.test@example.com",
    });

    const response = await request(app).get(`/${lecturer._id}`);
    expect(response.statusCode).toBe(200);
    expect(response.body.lecturerName).toBe("Specific Test");

    await Lecturer.findByIdAndDelete(lecturer._id);
  });

  it("should return 404 if the lecturer does not exist", async () => {
    const nonExistentId = new mongoose.Types.ObjectId();
    const response = await request(app).get(`/${nonExistentId}`);
    expect(response.statusCode).toBe(404);
  });
});
