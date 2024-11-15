const sinon = require("sinon");
const { expect } = require("@jest/globals");
const mongoose = require("mongoose");
const Request = require("../../../models/reschedule-management/request_model");
const ApprovedRequest = require("../../../models/NotificationManagement/ApprovedRequest");
const DeniedRequest = require("../../../models/NotificationManagement/DeniedRequest");
const notificationRoutes = require("../../../routes/NotificationManagement/notificationRoutes");
const express = require("express");
const request = require("supertest");

describe("Notification Routes", () => {
    let app;
    let consoleErrorStub;
  
    beforeAll(() => {
      app = express();
      app.use(express.json());
      app.use("/", notificationRoutes);
    });
  
    beforeEach(() => {
      consoleErrorStub = sinon.stub(console, "error");
    });
  
    afterEach(() => {
      sinon.restore();
      consoleErrorStub.restore();
    });
  
    describe("GET /getRescheduleInfo", () => {
      it("should return all reschedule information when data is available", async () => {
        const mockData = [
          {
            moduleCode: "COMP2003",
            moduleName: "Object Oriented Software Engineering",
            sessionType: "lab",
            lecturerName: "Divya",
            previousDate: "2024-04-16T00:00:00.000Z",
            previousTime: "08:30 - 10:30",
            currentDate: "2024-04-16T00:00:00.000Z",
            currentTime: "11:30 - 12:30",
            specialNotes: "test request",
            status: "",
            isResolved: false,
            approvedOrDeniedAt: null,
            createdAt: "2024-04-22T18:51:08.102Z",
          },
        ];
  
        sinon.stub(Request, "find").resolves(mockData);
  
        const response = await request(app).get("/getRescheduleInfo");
  
        expect(response.status).toBe(200);
        expect(response.body).toEqual(mockData);
      });
  
      it("should return a 404 error when no reschedule information is available", async () => {
        sinon.stub(Request, "find").resolves([]);
  
        const response = await request(app).get("/getRescheduleInfo");
  
        expect(response.status).toBe(404);
        expect(response.body).toEqual({
          message: "No reschedule information available.",
        });
      });
  
      it("should return a 500 error when there is an error retrieving data", async () => {
        const error = new Error("Database error");
        sinon.stub(Request, "find").throws(error);
  
        const response = await request(app).get("/getRescheduleInfo");
  
        expect(response.status).toBe(500);
        expect(response.body).toEqual({
          message: "Error retrieving data",
          error: error.message, 
        });
      });
    });
  
    describe("PUT /approveReschedule/:id", () => {
      it("should approve a reschedule request", async () => {
        const mockRequest = {
          _id: new mongoose.Types.ObjectId().toString(), 
          moduleCode: "COMP2003",
          moduleName: "Object Oriented Software Engineering",
          sessionType: "lab",
          lecturerName: "Divya",
          previousDate: "2024-04-16T00:00:00.000Z",
          previousTime: "08:30 - 10:30",
          currentDate: "2024-04-16T00:00:00.000Z",
          currentTime: "11:30 - 12:30",
          specialNotes: "test request",
          status: "",
          isResolved: false,
          approvedOrDeniedAt: null,
          createdAt: "2024-04-22T18:51:08.102Z",
        };
  
        sinon.stub(Request, "findByIdAndUpdate").resolves(mockRequest);
        sinon.stub(ApprovedRequest, "create").resolves();
  
        const response = await request(app)
          .put(`/approveReschedule/${mockRequest._id}`)
          .set("admin-firstname", "John")
          .set("role", "admin");
  
        expect(response.status).toBe(200);
        expect(response.body).toEqual(mockRequest);
      });
  
      it("should return a 403 error for unauthorized access", async () => {
        const response = await request(app)
          .put("/approveReschedule/123")
          .set("admin-firstname", "John")
          .set("role", "user");
  
        expect(response.status).toBe(403);
        expect(response.body).toEqual({
          message: "Unauthorized or incomplete admin information",
        });
      });
  
      it("should return a 403 error for incomplete admin information", async () => {
        const response = await request(app)
          .put("/approveReschedule/123")
          .set("role", "admin");
  
        expect(response.status).toBe(403);
        expect(response.body).toEqual({
          message: "Unauthorized or incomplete admin information",
        });
      });
  
      it("should return a 404 error if the reschedule request is not found", async () => {
        sinon.stub(Request, "findByIdAndUpdate").resolves(null);
  
        const response = await request(app)
          .put("/approveReschedule/123")
          .set("admin-firstname", "John")
          .set("role", "admin");
  
        expect(response.status).toBe(404);
        expect(response.body).toEqual({
          message: "Reschedule request not found",
        });
      });
  
      it("should return a 500 error when there is an error approving the reschedule", async () => {
        const error = new Error("Database error");
        sinon.stub(Request, "findByIdAndUpdate").throws(error);
  
        const response = await request(app)
          .put("/approveReschedule/123")
          .set("admin-firstname", "John")
          .set("role", "admin");
  
        expect(response.status).toBe(500);
        expect(response.body).toEqual({
          message: "Error approving reschedule",
          error: error.message, 
        });
      });
    });
  
    describe("PUT /denyReschedule/:id", () => {
      it("should deny a reschedule request", async () => {
        const mockRequest = {
          _id: new mongoose.Types.ObjectId().toString(), 
          moduleCode: "COMP2003",
          moduleName: "Object Oriented Software Engineering",
          sessionType: "lab",
          lecturerName: "Divya",
          previousDate: "2024-04-16T00:00:00.000Z",
          previousTime: "08:30 - 10:30",
          currentDate: "2024-04-16T00:00:00.000Z",
          currentTime: "11:30 - 12:30",
          specialNotes: "test request",
          status: "",
          isResolved: false,
          approvedOrDeniedAt: null,
          createdAt: "2024-04-22T18:51:08.102Z",
        };
  
        sinon.stub(Request, "findByIdAndUpdate").resolves(mockRequest);
        sinon.stub(DeniedRequest, "create").resolves();
  
        const response = await request(app)
          .put(`/denyReschedule/${mockRequest._id}`)
          .set("admin-firstname", "John")
          .set("role", "admin");
  
        expect(response.status).toBe(200);
        expect(response.body).toEqual(mockRequest);
      });
  
      it("should return a 403 error for unauthorized access", async () => {
        const response = await request(app)
          .put("/denyReschedule/123")
          .set("admin-firstname", "John")
          .set("role", "user");
  
        expect(response.status).toBe(403);
        expect(response.body).toEqual({
          message: "Unauthorized or incomplete admin information",
        });
      });
  
      it("should return a 403 error for incomplete admin information", async () => {
        const response = await request(app)
          .put("/denyReschedule/123")
          .set("role", "admin");
  
        expect(response.status).toBe(403);
        expect(response.body).toEqual({
          message: "Unauthorized or incomplete admin information",
        });
      });
  
      it("should return a 404 error if the reschedule request is not found", async () => {
        sinon.stub(Request, "findByIdAndUpdate").resolves(null);
  
        const response = await request(app)
          .put("/denyReschedule/123")
          .set("admin-firstname", "John")
          .set("role", "admin");
  
        expect(response.status).toBe(404);
        expect(response.body).toEqual({
          message: "Reschedule request not found",
        });
      });
  
      it("should return a 500 error when there is an error denying the reschedule", async () => {
        const error = new Error("Database error");
        sinon.stub(Request, "findByIdAndUpdate").throws(error);
  
        const response = await request(app)
          .put("/denyReschedule/123")
          .set("admin-firstname", "John")
          .set("role", "admin");
  
        expect(response.status).toBe(500);
        expect(response.body).toEqual({
          message: "Error denying reschedule",
          error: error.message, 
        });
      });
    });
  });