const mongoose = require("mongoose");
const request = require("supertest");
const { SpecBatch } = require("../../models/TimeTableManagement/specBatch");
const express = require("express");
const specBatches = require("../../routes/TimeTableManagement/specBatches");
const app = express();
app.use(express.json());
app.use(specBatches);

beforeAll(async () => {
  await mongoose.connect("mongodb://127.0.0.1:27017/TTLABS_TB");
  await SpecBatch.deleteMany();
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe("GET /", () => {
  it("should return all specialization batches", async () => {
    await SpecBatch.deleteMany();
    const specBatchesData = [
      { specName: "Software Engineering", year: 1, semester: 1 },
      { specName: "Cyber Security", year: 2, semester: 2 },
    ];
    await SpecBatch.insertMany(specBatchesData);

    const response = await request(app).get("/");
    expect(response.statusCode).toBe(200);
    expect(response.body.length).toBe(2);

    await SpecBatch.deleteMany();
  });

  it("should return an empty array if no batches exist", async () => {
    const response = await request(app).get("/");
    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual([]);
  });
});

describe("POST /", () => {
  it("should create a new spec batch when data is valid", async () => {
    const specBatchData = {
      specName: "Software Engineering",
      year: 3,
      semester: 1,
    };
    const response = await request(app).post("/").send(specBatchData);
    expect(response.statusCode).toBe(200);
    expect(response.body.specName).toBe("Software Engineering");

    await SpecBatch.findByIdAndDelete(response.body._id);
  });

  it("should return an error for invalid data", async () => {
    const specBatchData = { specName: "", year: 0, semester: 3 };
    const response = await request(app).post("/").send(specBatchData);
    expect(response.statusCode).toBe(400);
  });

  it("should prevent creation of duplicate specialization batches", async () => {
    const specBatchData = {
      specName: "Cyber Security",
      year: 1,
      semester: 1,
    };
    const initResponse = await request(app).post("/").send(specBatchData);
    const response = await request(app).post("/").send(specBatchData);
    expect(response.statusCode).toBe(400);

    await SpecBatch.findByIdAndDelete(initResponse._id);
  });
});

describe("PUT /:id", () => {
  it("should update the batch successfully", async () => {
    const specBatch = new SpecBatch({
      specName: "Information Security",
      year: 2,
      semester: 2,
    });
    await specBatch.save();

    const updatedData = {
      specName: "Software Engineering",
      year: 3,
      semester: 1,
    };
    const response = await request(app)
      .put(`/${specBatch._id}`)
      .send(updatedData);
    expect(response.statusCode).toBe(200);
    expect(response.body.specName).toBe("Software Engineering");

    await SpecBatch.findByIdAndDelete(specBatch._id);
  });

  it("should return 404 if the spec batch does not exist", async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const response = await request(app)
      .put(`/${fakeId}`)
      .send({ specName: "Nonexistent", year: 1, semester: 1 });
    expect(response.statusCode).toBe(404);
  });
});

describe("DELETE /:id", () => {
  it("should delete the batch successfully", async () => {
    const specBatch = new SpecBatch({
      specName: "Computer Science and Networking",
      year: 1,
      semester: 2,
    });
    await specBatch.save();

    const response = await request(app).delete(`/${specBatch._id}`);
    expect(response.statusCode).toBe(200);
  });

  it("should return 404 if the spec batch does not exist", async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const response = await request(app).delete(`/${fakeId}`);
    expect(response.statusCode).toBe(404);
  });
});
