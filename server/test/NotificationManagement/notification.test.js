const express = require("express");
const supertest = require("supertest");
const mongoose = require("mongoose");
const Request = require("../../models/reschedule-management/request_model");
const Timetable = require("../../models/reschedule-management/resTimetable_model");
const ApprovedRequest = require("../../models/NotificationManagement/ApprovedRequest");
const DeniedRequest = require("../../models/NotificationManagement/DeniedRequest");
const Student = require("../../models/NotificationManagement/Student");
const Report = require("../../models/NotificationManagement/Report");
const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");
const dotenv = require('dotenv')
const nodemailer = require("nodemailer");
const router = require("../../routes/NotificationManagement/notificationRoutes");
const app = express();

app.use(express.json());
app.use(router);

beforeAll(async () => {
  await mongoose.connect("mongodb://127.0.0.1:27017/TTLABS_TB");
}, 10000);

afterAll(async () => {
  await mongoose.connection.close();
}, 10000);

describe("GET /getRescheduleInfo", () => {
    beforeEach(async () => {
        await Request.deleteMany({});
      });


  it("should return all reschedule information when data is available", async () => {

    const mockData = [
      {
        moduleCode: "COMP2003",
        moduleName: "Object Oriented Software Engineering ", 
        sessionType: "lab",
        lecturerName: "Divya",
        previousDate: new Date("2024-04-16T00:00:00.000Z"), 
        previousTime: "08:30 - 10:30", 
        currentDate: new Date ("2024-04-16T00:00:00.000Z"), 
        currentTime: "11:30 - 12:30", 
        specialNotes: "test request", 
        status: "", 
        isResolved: false, 
        approvedOrDeniedAt: null, 
        createdAt: new Date("2024-04-22T18:51:08.102Z")
      },
      {
        moduleCode: "COMP1000",
        moduleName: "CCP2", 
        sessionType: "lecture",
        lecturerName: "Laneesha",
        previousDate: new Date("2024-04-16T00:00:00.000Z"), 
        previousTime: "08:30 - 10:30", 
        currentDate: new Date ("2024-04-16T00:00:00.000Z"), 
        currentTime: "11:30 - 12:30", 
        specialNotes: "test request", 
        status: "", 
        isResolved: false, 
        approvedOrDeniedAt: null, 
        createdAt: new Date("2024-04-22T18:51:08.102Z")
      },
    ];

    await Request.insertMany(mockData);

    const response = await supertest(app).get("/getRescheduleInfo");
    expect(response.status).toBe(200);
        expect(response.body.moduleCode).toBe(mockData.moduleCode);
        expect(response.body.moduleName).toBe(mockData.moduleName);
        expect(response.body.sessionType).toBe(mockData.sessionType);
        expect(response.body.lecturerName).toBe(mockData.lecturerName); 
  });

  it("should return a 404 error when no reschedule information is available", async () => {
    const response = await supertest(app).get("/getRescheduleInfo");

    expect(response.status).toBe(404);
    expect(response.body).toEqual({
      message: "No reschedule information available.",
    });
  });

});

describe("PUT /approveReschedule/:id", () => {
    beforeEach(async () => {
        await Request.deleteMany({});
      });
    it("should approve a reschedule request", async () => {
     
      const mockRequest = await Request.create({
        moduleCode: "COMP2003",
        moduleName: "Object Oriented Software Engineering ", 
        sessionType: "lab",
        lecturerName: "Divya",
        previousDate: new Date("2024-04-16T00:00:00.000Z"), 
        previousTime: "08:30 - 10:30", 
        currentDate: new Date ("2024-04-16T00:00:00.000Z"), 
        currentTime: "11:30 - 12:30", 
        specialNotes: "test request", 
        status: "", 
        isResolved: false, 
        approvedOrDeniedAt: null, 
        createdAt: new Date("2024-04-22T18:51:08.102Z")
      });
  
      const response = await supertest(app)
        .put(`/approveReschedule/${mockRequest._id}`)
        .set("admin-firstname", "John")
        .set("role", "admin")
        .expect(200);
  
      expect(response.body.status).toBe("approved");
      const approvedRequest = await ApprovedRequest.findOne({
        moduleCode: "COMP2003",
      });
      expect(approvedRequest).toBeTruthy();
    });
  
    it("should return a 403 error for unauthorized access", async () => {
      const response = await supertest(app)
        .put("/approveReschedule/123")
        .set("admin-firstname", "John")
        .set("role", "user")
        .expect(403);
  
      expect(response.body.message).toBe(
        "Unauthorized or incomplete admin information"
      );
    });
  
    it("should return a 403 error for incomplete admin information", async () => {
      const response = await supertest(app)
        .put("/approveReschedule/123")
        .set("role", "admin")
        .expect(403);
  
      expect(response.body.message).toBe(
        "Unauthorized or incomplete admin information"
      );
    });
  
  });

  describe("PUT /denyReschedule/:id", () => {
    beforeEach(async () => {
        await Request.deleteMany({});
      });
    it("should approve a reschedule request", async () => {
      const mockRequest = await Request.create({
        moduleCode: "COMP2003",
        moduleName: "Object Oriented Software Engineering ", 
        sessionType: "lab",
        lecturerName: "Divya",
        previousDate: new Date("2024-04-16T00:00:00.000Z"), 
        previousTime: "08:30 - 10:30", 
        currentDate: new Date ("2024-04-16T00:00:00.000Z"), 
        currentTime: "11:30 - 12:30", 
        specialNotes: "test request", 
        status: "", 
        isResolved: false, 
        approvedOrDeniedAt: null, 
        createdAt: new Date("2024-04-22T18:51:08.102Z")
      });
  
      const response = await supertest(app)
        .put(`/denyReschedule/${mockRequest._id}`)
        .set("admin-firstname", "John")
        .set("role", "admin")
        .expect(200);
  
      expect(response.body.status).toBe("denied");
      const deniedRequest = await DeniedRequest.findOne({
        moduleCode: "COMP2003",
      });
      expect(deniedRequest).toBeTruthy();
    });
  
    it("should return a 403 error for unauthorized access", async () => {
      const response = await supertest(app)
        .put("/denyReschedule/123")
        .set("admin-firstname", "John")
        .set("role", "user")
        .expect(403);
  
      expect(response.body.message).toBe(
        "Unauthorized or incomplete admin information"
      );
    });
  
    it("should return a 403 error for incomplete admin information", async () => {
      const response = await supertest(app)
        .put("/denyReschedule/123")
        .set("role", "admin")
        .expect(403);

      expect(response.body.message).toBe(
        "Unauthorized or incomplete admin information"
      );
    });
  
  });

  describe("GET /getRescheduleCount", () => {
    beforeEach(async () => {
      await Request.deleteMany({});
    });
  
    it("should return the count of new reschedule requests for admin", async () => {
      const mockData = [
        { createdAt: new Date("2024-04-22T18:51:08.102Z"), status: "" },
        { createdAt: new Date("2024-04-23T18:51:08.102Z"), status: "" },
      ];
      await Request.insertMany(mockData);
  
      const response = await supertest(app).get("/getRescheduleCount")
        .query({ lastOpened: new Date("2024-04-20T00:00:00.000Z").toISOString(), role: "admin" });
 
      expect(response.status).toBe(200);
      expect(response.body.count).toBe(2);
    });
  
    it("should return the count of new reschedule requests for lecture", async () => {
      const mockData = [
        { createdAt: new Date("2024-04-22T18:51:08.102Z"), status: "approved", isResolved: false },
        { createdAt: new Date("2024-04-23T18:51:08.102Z"), status: "denied", isResolved: false },
      ];
      await Request.insertMany(mockData);
  
      const response = await supertest(app).get("/getRescheduleCount")
        .query({ lastOpened: new Date("2024-04-20T00:00:00.000Z").toISOString(), role: "lecture" });
      expect(response.status).toBe(200);
      expect(response.body.count).toBe(2);
    });
  
    it("should return 0 count if no new requests are available for lecture", async () => {
      const mockData = [
        { createdAt: new Date("2024-04-18T18:51:08.102Z"), status: "approved", isResolved: false },
        { createdAt: new Date("2024-04-19T18:51:08.102Z"), status: "denied", isResolved: false },
      ];
      await Request.insertMany(mockData);
  
      const response = await supertest(app).get("/getRescheduleCount")
        .query({ lastOpened: new Date("2024-04-20T00:00:00.000Z").toISOString(), role: "lecture" });
      expect(response.status).toBe(200);
      expect(response.body.count).toBe(0);
    });
  
  });

  describe("PUT /markRescheduleAsResolved/:id", () => {
    beforeEach(async () => {
      await Request.deleteMany({});
    });
  
    it("should mark a reschedule request as resolved", async () => {
      const mockRequest = new Request({
        moduleCode: "COMP2003",
        moduleName: "Object Oriented Software Engineering",
        sessionType: "lab",
        lecturerName: "Divya",
        previousDate: new Date("2024-04-16T00:00:00.000Z"),
        previousTime: "08:30 - 10:30",
        currentDate: new Date("2024-04-16T00:00:00.000Z"),
        currentTime: "11:30 - 12:30",
        specialNotes: "test request",
        status: "",
        isResolved: false,
        approvedOrDeniedAt: null,
        createdAt: new Date("2024-04-22T18:51:08.102Z"),
      });
      await mockRequest.save();
  
      const response = await supertest(app).put(`/markRescheduleAsResolved/${mockRequest._id}`);
  
      expect(response.status).toBe(200);
      expect(response.body.isResolved).toBe(true);
  
      const updatedRequest = await Request.findById(mockRequest._id);
      expect(updatedRequest.isResolved).toBe(true);
    });
  
  });


describe("GET /filterReschedules", () => {
    beforeEach(async () => {
      await ApprovedRequest.deleteMany({});
      await DeniedRequest.deleteMany({});
    });
  
    it("should return filtered reschedule requests within the date range", async () => {
      const mockApprovedRequest = new ApprovedRequest({
        moduleCode: "COMP2003",
        moduleName: "Object Oriented Software Engineering",
        sessionType: "lab",
        lecturerName: "Divya",
        currentDate: new Date("2024-04-16T00:00:00.000Z"),
        currentTime: "08:30 - 10:30",
        newDate: new Date("2024-04-16T00:00:00.000Z"),
        newTime: "11:30 - 12:30",
        specialNotes: "test request",
        status: "approved",
        isResolved: false,
        approvedOrDeniedAt: new Date("2024-04-22T19:51:08.102Z"),
        createdAt: new Date("2024-04-22T18:51:08.102Z"),
        isEmailSent: false,
        studentEmails: [],
      });
      await mockApprovedRequest.save();
  
      const mockDeniedRequest = new DeniedRequest({
        moduleCode: "COMP1000",
        moduleName: "Software Engineering Testing",
        sessionType: "lecture",
        lecturerName: "Laneesha",
        currentDate: new Date("2024-04-16T00:00:00.000Z"),
        currentTime: "08:30 - 10:30",
        newDate: new Date("2024-04-16T00:00:00.000Z"),
        newTime: "11:30 - 12:30",
        specialNotes: "test request",
        status: "denied",
        isResolved: false,
        approvedOrDeniedAt: new Date("2024-04-22T19:51:08.102Z"),
        createdAt: new Date("2024-04-22T18:51:08.102Z"),
      });
      await mockDeniedRequest.save();
      const response = await supertest(app)
        .get("/filterReschedules")
        .query({ startDate: "2024-04-01", endDate: "2024-04-30" });
  
      expect(response.status).toBe(200);
      expect(response.body.length).toBe(2);
      expect(response.body[0].moduleName).toBe("Object Oriented Software Engineering");
      expect(response.body[1].moduleName).toBe("Software Engineering Testing");
    });
  
    it("should return 400 if startDate or endDate is missing", async () => {
      const response = await supertest(app).get("/filterReschedules");
  
      expect(response.status).toBe(400);
      expect(response.body).toEqual({ message: "Both startDate and endDate are required." });
    });
  
    // it("should return 404 if no reschedule requests match the filters", async () => {
    //   const mockApprovedRequest = new ApprovedRequest({
    //     moduleCode: "COMP2003",
    //     moduleName: "Object Oriented Software Engineering",
    //     sessionType: "lab",
    //     lecturerName: "Divya",
    //     currentDate: new Date("2024-04-16T00:00:00.000Z"),
    //     currentTime: "08:30 - 10:30",
    //     newDate: new Date("2024-04-16T00:00:00.000Z"),
    //     newTime: "11:30 - 12:30",
    //     specialNotes: "test request",
    //     status: "approved",
    //     isResolved: false,
    //     approvedOrDeniedAt: new Date("2024-04-22T19:51:08.102Z"),
    //     createdAt: new Date("2024-04-22T18:51:08.102Z"),
    //     isEmailSent: false,
    //     studentEmails: [],
    //   });
    //   await mockApprovedRequest.save();
  
    //   const response = await supertest(app)
    //     .get("/filterReschedules")
    //     .query({ startDate: "2024-04-01", endDate: "2024-04-30", moduleName: "NonExistentModule" });
  
    //   expect(response.status).toBe(404);
    //   expect(response.body).toEqual({
    //     message: "No reschedule information found within the given date range or filters.",
    //   });
    // });
  
  });

  describe("GET /listReports", () => {
    beforeEach(async () => {
        await Report.deleteMany({});
      });
    it("should return all reports", async () => {
      const mockReport = new Report({
        report_name: "Test Report",
        approved: [],
        denied: [],
        filterCriteria: {},
        createdAt: new Date(),
      });
      await mockReport.save();

      const response = await supertest(app).get("/listReports");
      expect(response.status).toBe(200);
      expect(response.body.length).toBe(1);
      expect(response.body[0].report_name).toBe("Test Report");
    });

  });

describe("PUT /updateReport/:id", () => {
    beforeEach(async () => {
        await Report.deleteMany({});
      });

    it("should update the specified report", async () => {
      const mockReport = new Report({
        report_name: "Test Report",
        approved: [],
        denied: [],
        filterCriteria: {},
        createdAt: new Date(),
      });
      await mockReport.save();

      const updatedData = { report_name: "Updated Report" };

      const response = await supertest(app)
        .put(`/updateReport/${mockReport._id}`)
        .send({ data: updatedData });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe("Report updated successfully!");
      expect(response.body.report.report_name).toBe("Updated Report");
    });

    // it("should return 500 if there is an error updating data", async () => {
    //   jest.spyOn(Report, "findByIdAndUpdate").mockRejectedValue(new Error("Database error"));

    //   const response = await supertest(app)
    //     .put("/updateReport/invalidId")
    //     .send({ data: {} });

    //   expect(response.status).toBe(500);
    //   expect(response.body).toEqual({ message: "Error updating data", error: "Error: Database error" });

    //   Report.findByIdAndUpdate.mockRestore();
    // });
  });

  describe("DELETE /deleteReport/:reportId", () => {
    it("should delete the specified report", async () => {
      const mockReport = new Report({
        report_name: "Test Report",
        approved: [],
        denied: [],
        filterCriteria: {},
        createdAt: new Date(),
      });
      await mockReport.save();

      const response = await supertest(app).delete(`/deleteReport/${mockReport._id}`);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe("Report successfully deleted");

      const report = await Report.findById(mockReport._id);
      expect(report).toBeNull();
    });

    // it("should return 500 if there is an error deleting the report", async () => {
    //   jest.spyOn(Report, "findByIdAndDelete").mockRejectedValue(new Error("Database error"));

    //   const response = await supertest(app).delete("/deleteReport/invalidId");

    //   expect(response.status).toBe(500);
    //   expect(response.body).toEqual({ message: "Failed to delete report", error: "Error: Database error" });

    //   Report.findByIdAndDelete.mockRestore();
    // });
  });

