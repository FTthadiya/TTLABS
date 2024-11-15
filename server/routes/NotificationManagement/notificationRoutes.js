const RescheduleModel = require("../../models/NotificationManagement/Reschedule");
const Student = require("../../models/NotificationManagement/Student");
const express = require("express");
const router = express.Router();
const nodemailer = require("nodemailer");
/* const Timetable = require("../../models/reschedule-management/timetable_model"); */
const Request = require("../../models/reschedule-management/request_model");
const Timetable = require("../../models/reschedule-management/resTimetable_model");
/* const RescheduledSession = require("../../models/NotificationManagement/RescheduledSession"); */
const ApprovedRequest = require("../../models/NotificationManagement/ApprovedRequest");
const DeniedRequest = require("../../models/NotificationManagement/DeniedRequest");
const Report = require("../../models/NotificationManagement/Report");
const ReportRequest = require("../../models/NotificationManagement/ReportRequest");
const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");
const dotenv = require('dotenv')

dotenv.config(); 

router.get("/getRescheduleInfo", async (req, res) => {
  try {
    const data = await Request.find({});
    if (data.length > 0) {
      res.status(200).json(data);
    } else {
      res.status(404).json({ message: "No reschedule information available." });
    }
  } catch (error) {
    res.status(500).json({ message: "Error retrieving data", error: error.message });
  }
});

// router.get("/getRescheduleInfo", async (req, res) => {
//   try {
//     const data = await Request.find({});
//     if (data.length > 0) {
//       res.status(200).json(data);
//     } else {
//       res.status(404).json({ message: "No reschedule information available." });
//     }
//   } catch (error) {
//     res.status(500).json({ message: "Error retrieving data", error });
//   }
// });

router.put("/approveReschedule/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const userFirstName = req.headers["admin-firstname"];
    /* const userLastName = req.headers["admin-lastname"]; */
    const role = req.headers["role"];
    if (role !== "admin" || !userFirstName /* || !userLastName */) {
      return res
        .status(403)
        .json({ message: "Unauthorized or incomplete admin information" });
    }
    const adminName = `${userFirstName}`;
    /* const adminName = `${userFirstName} ${userLastName}`; */
    const updatedDocument = await Request.findByIdAndUpdate(
      id,
      {
        status: "approved",
        adminName: adminName,
        approvedOrDeniedAt: Date.now(),
      },
      { new: true }
    );
    if (updatedDocument) {
      await ApprovedRequest.create({
        moduleCode: updatedDocument.moduleCode,
        moduleName: updatedDocument.moduleName,
        sessionType: updatedDocument.sessionType,
        lecturerName: updatedDocument.lecturerName,
        currentDate: updatedDocument.previousDate,
        currentTime: updatedDocument.previousTime,
        newDate: updatedDocument.currentDate,
        newTime: updatedDocument.currentTime,
        specialNotes: updatedDocument.specialNotes,
        status: updatedDocument.status,
        createdAt: updatedDocument.createdAt,
        adminName: updatedDocument.adminName,
        approvedOrDeniedAt: updatedDocument.approvedOrDeniedAt,
      });
    }
    if (!updatedDocument) {
      return res.status(404).json({ message: "Reschedule request not found" });
    }
    res.status(200).json(updatedDocument);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Error approving reschedule", error: error.message });
  }
});

router.put("/denyReschedule/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const userFirstName = req.headers["admin-firstname"];
    /* const userLastName = req.headers["admin-lastname"]; */
    const role = req.headers["role"];
    if (role !== "admin" || !userFirstName /* || !userLastName */) {
      return res
        .status(403)
        .json({ message: "Unauthorized or incomplete admin information" });
    }
    const adminName = `${userFirstName}`;
    /* const adminName = `${userFirstName} ${userLastName}`; */
    const updatedDocument = await Request.findByIdAndUpdate(
      id,
      {
        status: "denied",
        adminName: adminName,
        approvedOrDeniedAt: Date.now(),
      },
      { new: true }
    );
    if (updatedDocument) {
      await DeniedRequest.create({
        moduleCode: updatedDocument.moduleCode,
        moduleName: updatedDocument.moduleName,
        sessionType: updatedDocument.sessionType,
        lecturerName: updatedDocument.lecturerName,
        currentDate: updatedDocument.previousDate,
        currentTime: updatedDocument.previousTime,
        newDate: updatedDocument.currentDate,
        newTime: updatedDocument.currentTime,
        specialNotes: updatedDocument.specialNotes,
        status: updatedDocument.status,
        createdAt: updatedDocument.createdAt,
        adminName: updatedDocument.adminName,
        approvedOrDeniedAt: updatedDocument.approvedOrDeniedAt,
      });
    }
    if (!updatedDocument) {
      return res.status(404).json({ message: "Reschedule request not found" });
    }
    res.status(200).json(updatedDocument);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Error denying reschedule", error: error.message });
  }
});

/* router.post("/reschedule", async (req, res) => {
  try {
    const {
      moduleName,
      sessionType,
      currentDate,
      currentTime,
      newDate,
      newTime,
      specialNotes,
      lecturerName,
    } = req.body;
    const newReschedule = new RescheduleModel({
      moduleName,
      sessionType,
      currentDate,
      currentTime,
      newDate,
      newTime,
      specialNotes,
      lecturerName,
    });
    const savedReschedule = await newReschedule.save();
    res.status(201).json(savedReschedule);
  } catch (error) {
    console.error("Error creating new reschedule request:", error);
    res.status(500).json({ message: "Error creating data", error });
  }
}); */

router.get("/getRescheduleCount", async (req, res) => {
  const lastOpened = req.query.lastOpened
    ? new Date(req.query.lastOpened)
    : new Date(0);
  const role = req.query.role;
  const lecturerId = req.query.lecturerId; // Make sure you're capturing this for logging

  //console.log("Received Parameters:", { lastOpened, role, lecturerId });
  
  try {
    let query = {
      createdAt: { $gt: lastOpened },
    };
    if (role === "admin") {
      query = {
        ...query,
        status: "",
      };
    } else if (role === "lecture") {
      query = {
        ...query,
        /* lecturerId: req.query.lecturerId, */
        $or: [{ status: "approved" }, { status: "denied" }],
        isResolved: { $ne: true },
      };
    }

    //console.log("Constructed Query:", query); // Log the query to inspect it

    const count = await Request.countDocuments(query);
    //console.log("Count Result:", count); 
    res.status(200).json({ count });
  } catch (error) {
    console.error("Error fetching new reschedule count:", error);
    res
      .status(500)
      .json({ message: "Error retrieving new reschedule count", error });
  }
});

router.put("/markRescheduleAsResolved/:id", async (req, res) => {
  try {
    const updatedReschedule = await Request.findByIdAndUpdate(
      req.params.id,
      { isResolved: true },
      { new: true }
    );
    if (!updatedReschedule) {
      return res.status(404).send("Reschedule not found.");
    }
    res.status(200).json(updatedReschedule);
  } catch (error) {
    console.error("Error updating reschedule:", error);
    res.status(500).json({ message: "Error updating reschedule", error });
  }
});

const transporter = nodemailer.createTransport({
  service: 'gmail',
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
      user: process.env.GMAIL_USERNAME,
      pass: process.env.GMAIL_PASSWORD
  }
});

router.post("/send-emails", async (req, res) => {
  try {
    // Fetch all approved, unresolved, and unsent email requests
    const approvedRequests = await ApprovedRequest.find({
      /* status: "approved",
      isResolved: false, */
      isEmailSent: false,
    });

    if (approvedRequests.length === 0) {
      return res.status(404).json({ message: "No approved requests found" });
    }

    let emailsSent = 0;
    for (const request of approvedRequests) {
      const matchingTimetable = await Timetable.findOne({
        "subject.subjectCode": request.moduleCode,
        "subject.subjectName": request.moduleName,
        "subject.sessionType": request.sessionType,
        "subject.lecturer.lecturerName": request.lecturerName,
      });

      if (matchingTimetable) {
        const subject = `${request.moduleName} - ${request.sessionType} rescheduled`;
        const body = constructEmailBody(request, matchingTimetable); // Using the refactored function to construct email body

        const studentsToEmail = await Student.find({
          enrolledModules: { $in: [matchingTimetable.subject.subjectName] },
        });

        if (studentsToEmail.length > 0) {
          const emails = studentsToEmail.map((student) => student.studentEmail);
          const mailOptions = {
            from: process.env.GMAIL_USERNAME,
            to: emails.join(", "),
            subject,
            html: body,
          };

          transporter.sendMail(mailOptions, async (error, info) => {
            if (error) {
              console.error("Error sending emails:", error);
            } else {
              console.log("Email sent: " + info.response);
              emailsSent++;

              // new collection reschedule session creation
              /* await RescheduledSession.create({
                moduleName: request.moduleName,
                sessionType: request.sessionType,
                lecturerName: request.lecturerName,
                previousDate: request.previousDate,
                currentDate: request.currentDate,
                previousTime: request.previousTime,
                currentTime: request.currentTime,
                specialNotes: request.specialNotes,
                studentEmails: emails
              }); */

              // Update the request as email sent and store the list of student emails who has received an email
              await ApprovedRequest.updateOne(
                { _id: request._id },
                { $set: { isEmailSent: true, studentEmails: emails } }
                /* { $set: { studentEmails: emails } } */
              );
            }
          });
        }
      }
    }

    if (emailsSent === 0) {
      return res.status(404).json({
        message: "No matching timetables found for any approved requests",
      });
    }

    res.json({
      message: `Emails are being processed. Number of emails sent: ${emailsSent}`,
    });
  } catch (error) {
    console.error("Error in /send-emails endpoint:", error);
    res.status(500).json({ message: "Internal server error", error });
  }
});

function constructEmailBody(request, timetable) {
  const currentDate = new Date(request.currentDate);
  const newDate = new Date(request.newDate);
  return `
    <p>Dear students,</p>
    <p>Please be informed that the ${request.moduleName} ${request.sessionType} originally scheduled for ${currentDate.toLocaleDateString("en-US")} at ${request.currentTime} has been rescheduled to ${newDate.toLocaleDateString("en-US")} at ${request.newTime}. This will be held at ${timetable.lectureHall.hallid}. Note: ${request.specialNotes}. Please adjust your schedules accordingly.</p>
    <p>Thank you.</p>
    <p>Kind regards,</p>
    <p>${request.lecturerName}</p>
  `;
}



router.get("/filterReschedules", async (req, res) => {
  const { startDate, endDate, moduleCode, sessionType, lecturerName, status } =
    req.query;

  // console.log(
  //   `Filtering from ${startDate} to ${endDate} with optional filters`
  // );

  if (!startDate || !endDate) {
    return res
      .status(400)
      .json({ message: "Both startDate and endDate are required." });
  }

  const query = {
    createdAt: {
      $gte: new Date(startDate),
      $lte: new Date(endDate),
    },
  };

  if (moduleCode) query.moduleCode = moduleCode;
  if (sessionType) query.sessionType = sessionType;
  if (lecturerName) query.lecturerName = lecturerName;
  if (status) query.status = status;

  try {
    const [approvedRequests, deniedRequests] = await Promise.all([
      ApprovedRequest.find(query),
      DeniedRequest.find(query),
    ]);

    const combinedResults = approvedRequests.concat(deniedRequests);

    if (combinedResults.length > 0) {
      res.status(200).json(combinedResults);
    } else {
      res.status(404).json({
        message:
          "No reschedule information found within the given date range or filters.",
      });
    }
  } catch (error) {
    console.error("Error retrieving data:", error);
    res
      .status(500)
      .json({ message: "Error retrieving data", error: error.toString() });
  }
});


router.post("/generateAndSavePDF", async (req, res) => {
  const data = req.body;

  /* if (!Array.isArray(data) || data.length === 0) {
    return res.status(400).json({ message: "Filtered data is required." });
  } */

  const doc = new PDFDocument();
  const fileName = `${Date.now()}_report.pdf`;
  const directoryPath = path.join(__dirname, "..", "NotificationManagement");

  // Ensure directory exists
  fs.mkdirSync(directoryPath, { recursive: true });

  const filePath = path.join(directoryPath, fileName);
  const stream = fs.createWriteStream(filePath);

  doc.pipe(stream);

  let approvedHeaderAdded = false;
  let deniedHeaderAdded = false;

  data.forEach((item) => {
    if (item.status === "Approved" && !approvedHeaderAdded) {
      doc
        .font("Helvetica-Bold")
        .text("Approved reschedule requests", { underline: true });
        approvedHeaderAdded = true;
    } else if (item.status === "Denied" && !deniedHeaderAdded){
      doc.addPage(); 
      doc
        .font("Helvetica-Bold")
        .text("Denied reschedule requests", { underline: true });
        deniedHeaderAdded = true;
    }

    doc
      .font("Helvetica")
      .text(`Module Code: ${item.moduleCode}`) 
      .text(`Module Name: ${item.moduleName}`) 
      .text(`Lecturer Name: ${item.lecturerName}`)
      .text(`Session Type: ${item.sessionType}`)
      .text(`Current Date and Time: ${item.currentDate}, ${item.currentTime}`) 
      .text(`New Date and Time: ${item.newDate}, ${item.newTime}`) 
      .moveDown();
  });

  doc.end();

  stream.on("finish", async () => {
    try {
      const pdfBuffer = await fs.promises.readFile(filePath);

      const report = new Report({
        pdf: pdfBuffer,
      });

      await report.save();

      res
        .status(200)
        .json({ message: "PDF generated and saved successfully.",
        pdfId: report._id, // Send back the ID to the frontend
       });

      await fs.promises.unlink(filePath);
    } catch (error) {
      console.error("Error in PDF processing: ", error);
      res.status(500).json({
        message: "Error in PDF generation or saving process",
        error: error.message,
      });
    }
  });
});

/* router.get("/listReports", async (req, res) => {
  try {
    // Retrieve only the 'report_name' from all documents
    const reports = await Report.find({}, "report_name").exec();

    if (!reports.length) {
      return res.status(404).json({ message: "No reports found." });
    }

    // Map each report to return only the report_name
    const reportNames = reports.map((report) => ({
      report_name: report.report_name,
    }));

    res.json(reportNames);
  } catch (error) {
    console.error("Failed to list reports: ", error);
    res
      .status(500)
      .json({ message: "Error listing reports", error: error.message });
  }
}); */

/* router.get("/downloadPdf/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const fileDoc = await Report.findById(id);

    if (!fileDoc) {
      return res.status(404).send("No file found.");
    }

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", 'attachment; filename="report_${id}.pdf"');
    res.send(fileDoc.pdf.buffer);
  } catch (error) {
    console.error("Failed to download PDF: ", error);
    res
      .status(500)
      .json({ message: "Error downloading PDF", error: error.message });
  }
}); */


router.get("/listReports", async (req, res) => {
  try {
    const reports = await Report.find(); // Fetch all reports
    // console.log(reports); // Log to check if _id is included
    res.status(200).json(reports);
  } catch (error) {
    console.error("Error fetching reports:", error);
    res
      .status(500)
      .json({ message: "Failed to fetch reports", error: error.toString() });
  }
});


router.get("/downloadReport/:reportId", async (req, res) => {
  try {
    const { reportId } = req.params;
    const report = await Report.findById(reportId);

    if (!report) {
      return res.status(404).send("Report not found");
    }

    const doc = new PDFDocument();

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${report.report_name}.pdf"`
    );

    doc.pipe(res);

    doc.fontSize(25).text("Report Details", { align: "center" });
    doc
      .fontSize(16)
      .moveDown()
      .text(`Report Name: ${report.report_name}`, {
        continued: true,
      })
      .text(` (${report.createdAt.toDateString()})`, { align: "right" });

    // Approved section
    if (report.approved.length > 0) {
      doc.moveDown(2);
      doc.fontSize(18).text("Approved", { underline: true });
      report.approved.forEach((item, index) => {
        doc
          .fontSize(12)
          .moveDown()
          .list(
            [
              `Module Code: ${item.moduleCode}`,
              `Module Name: ${item.moduleName}`,
              `Session Type: ${item.sessionType}`,
              `Lecturer Name: ${item.lecturerName}`,
              `Scheduled Date: ${item.currentDate.toDateString()} at ${
                item.currentTime
              }`,
              `Rescheduled Date: ${item.newDate.toDateString()} at ${
                item.newTime
              }`,
              `Notes: ${item.specialNotes}`,
              `Status: ${item.status}`,
              `Handled by: ${item.adminName}`,
              `Decision made on: ${item.approvedOrDeniedAt.toDateString()}`,
              `Email Status: ${item.isEmailSent}`,
              `Student Emails: ${item.studentEmails}`,
            ],
            { bulletRadius: 2 }
          );
      });
    }

    // Denied section
    if (report.denied.length > 0) {
      doc.moveDown(2);
      doc.fontSize(18).text("Denied", { underline: true });
      report.denied.forEach((item, index) => {
        doc
          .fontSize(12)
          .moveDown()
          .list(
            [
              `Module Code: ${item.moduleCode}`,
              `Module Name: ${item.moduleName}`,
              `Session Type: ${item.sessionType}`,
              `Lecturer Name: ${item.lecturerName}`,
              `Scheduled Date: ${item.currentDate.toDateString()} at ${
                item.currentTime
              }`,
              `Rescheduled Date: ${item.newDate.toDateString()} at ${
                item.newTime
              }`,
              `Notes: ${item.specialNotes}`,
              `Status: ${item.status}`,
              `Handled by: ${item.adminName}`,
              `Decision made on: ${item.approvedOrDeniedAt.toDateString()}`,
            ],
            { bulletRadius: 2 }
          );
      });
    }

    doc.end();
  } catch (error) {
    console.error("Error generating PDF:", error);
    res
      .status(500)
      .json({ message: "Failed to generate PDF", error: error.toString() });
  }
});


router.post("/saveFilteredReports", async (req, res) => {
  const { data } = req.body;

  try {
    const reportData = {
      report_name: data.report_name,
      approved: data.approved,
      denied: data.denied,
      filterCriteria: data.filterCriteria,
      createdAt: new Date(),
    };

    const newReport = await Report.create(reportData);

    res
      .status(201)
      .json({ message: "Data saved successfully!", reportId: newReport._id });
  } catch (error) {
    console.error("Error saving data:", error);
    res
      .status(500)
      .json({ message: "Error saving data", error: error.toString() });
  }
});


router.get("/viewReport/:reportId", async (req, res) => {
  try {
    const { reportId } = req.params;
    const report = await Report.findById(reportId);

    if (!report) {
      return res.status(404).send("Report not found");
    }

    const doc = new PDFDocument();
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `inline; filename="${report.report_name}.pdf"`
    );

    doc.pipe(res);

    // Generate the PDF content
    doc.fontSize(25).text("Report Details", { align: "center" });
    doc
      .fontSize(16)
      .moveDown()
      .text(`Report Name: ${report.report_name}`, {
        continued: true,
      })
      .text(` (${report.createdAt.toDateString()})`, { align: "right" });

    // Approved section
    if (report.approved.length > 0) {
      doc.moveDown(2);
      doc.fontSize(18).text("Approved", { underline: true });
      report.approved.forEach((item, index) => {
        doc
          .fontSize(12)
          .moveDown()
          .list(
            [
              `Module Code: ${item.moduleCode}`,
              `Module Name: ${item.moduleName}`,
              `Session Type: ${item.sessionType}`,
              `Lecturer Name: ${item.lecturerName}`,
              `Scheduled Date: ${item.currentDate.toDateString()} at ${
                item.currentTime
              }`,
              `Rescheduled Date: ${item.newDate.toDateString()} at ${
                item.newTime
              }`,
              `Notes: ${item.specialNotes}`,
              `Status: ${item.status}`,
              `Handled by: ${item.adminName}`,
              `Decision made on: ${item.approvedOrDeniedAt.toDateString()}`,
              `Email Status: ${item.isEmailSent}`,
              `Student Emails: ${item.studentEmails}`,
            ],
            { bulletRadius: 2 }
          );
      });
    }

    // Denied section
    if (report.denied.length > 0) {
      doc.moveDown(2);
      doc.fontSize(18).text("Denied", { underline: true });
      report.denied.forEach((item, index) => {
        doc
          .fontSize(12)
          .moveDown()
          .list(
            [
              `Module Code: ${item.moduleCode}`,
              `Module Name: ${item.moduleName}`,
              `Session Type: ${item.sessionType}`,
              `Lecturer Name: ${item.lecturerName}`,
              `Scheduled Date: ${item.currentDate.toDateString()} at ${
                item.currentTime
              }`,
              `Rescheduled Date: ${item.newDate.toDateString()} at ${
                item.newTime
              }`,
              `Notes: ${item.specialNotes}`,
              `Status: ${item.status}`,
              `Handled by: ${item.adminName}`,
              `Decision made on: ${item.approvedOrDeniedAt.toDateString()}`,
            ],
            { bulletRadius: 2 }
          );
      });
    }

    doc.end();
  } catch (error) {
    console.error("Error generating PDF:", error);
    res
      .status(500)
      .json({ message: "Failed to generate PDF", error: error.toString() });
  }
});

router.put("/updateReport/:id", async (req, res) => {
  const { id } = req.params;
  const { data } = req.body;
  try {
    const updatedReport = await Report.findByIdAndUpdate(id, data, {
      new: true,
    });
    res
      .status(200)
      .json({ message: "Report updated successfully!", report: updatedReport });
  } catch (error) {
    console.error("Error updating data:", error);
    res
      .status(500)
      .json({ message: "Error updating data", error: error.toString() });
  }
});

router.delete("/deleteReport/:reportId", async (req, res) => {
  try {
    const { reportId } = req.params; // Ensure 'reportId' matches the route parameter
    // console.log("Attempting to delete report with ID:", reportId); // Log to check ID
    await Report.findByIdAndDelete(reportId);
    res.status(200).json({ message: "Report successfully deleted" });
  } catch (error) {
    console.error("Error deleting report:", error);
    res
      .status(500)
      .json({ message: "Failed to delete report", error: error.toString() });
  }
});


router.post("/reportRequest", async (req, res) => {
  try {
    const {
      startDate,
      endDate,
      moduleCode,
      sessionType,
      lecturerName,
      status,
      lecturerEmail,
    } = req.body;

    const newReportRequest = new ReportRequest({
      startDate,
      endDate,
      moduleCode,
      sessionType,
      lecturerName,
      status,
      lecturerEmail,
    });

    const savedReportRequest = await newReportRequest.save();
    res.status(201).json(savedReportRequest);
  } catch (error) {
    console.error("Error creating new report request:", error);
    res.status(500).json({ message: "Error creating data", error });
  }
});

router.get("/getReportRequest", async (req, res) => {
  try {
    const data = await ReportRequest.find({});
    if (data.length > 0) {
      res.status(200).json(data);
    } else {
      res.status(404).json({ message: "No report request information available." });
    }
  } catch (error) {
    res.status(500).json({ message: "Error retrieving data", error: error.message });
  }
});


router.post("/emailReport/:reportId", async (req, res) => {
  try {
    const { reportId } = req.params;
    const { recipientEmail, requestId } = req.body; // Email of the recipient
    const report = await Report.findById(reportId);

    if (!report) {
      return res.status(404).send("Report not found");
    }

    const doc = new PDFDocument();
    let buffers = [];
    doc.on('data', buffers.push.bind(buffers));
    doc.on('end', async () => {
      const pdfData = Buffer.concat(buffers);

      let transporter = nodemailer.createTransport({
        service: 'gmail', 
        host: "smtp.gmail.com",
        port: 587,
        secure: false,
        auth: {
            user: process.env.GMAIL_USERNAME,
            pass: process.env.GMAIL_PASSWORD
        }
      });

      let mailOptions = {
        from: process.env.GMAIL_USERNAME,
        to: recipientEmail,
        subject: `Report: ${report.report_name}`,
        text: 'Please find the attached report.',
        attachments: [
          {
            filename: `${report.report_name}.pdf`,
            content: pdfData,
            contentType: 'application/pdf'
          }
        ]
      };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          return res.status(500).json({ message: "Failed to send email", error: error.toString() });
        }
        res.status(200).json({ message: "Email sent successfully", info });
      });
    });


    doc.fontSize(25).text("Report Details", { align: "center" });
    doc
      .fontSize(16)
      .moveDown()
      .text(`Report Name: ${report.report_name}`, {
        continued: true,
      })
      .text(` (${report.createdAt.toDateString()})`, { align: "right" });

    // Approved section
    if (report.approved.length > 0) {
      doc.moveDown(2);
      doc.fontSize(18).text("Approved", { underline: true });
      report.approved.forEach((item, index) => {
        doc
          .fontSize(12)
          .moveDown()
          .list(
            [
              `Module Code: ${item.moduleCode}`,
              `Module Name: ${item.moduleName}`,
              `Session Type: ${item.sessionType}`,
              `Lecturer Name: ${item.lecturerName}`,
              `Scheduled Date: ${item.currentDate.toDateString()} at ${
                item.currentTime
              }`,
              `Rescheduled Date: ${item.newDate.toDateString()} at ${
                item.newTime
              }`,
              `Notes: ${item.specialNotes}`,
              `Status: ${item.status}`,
              `Handled by: ${item.adminName}`,
              `Decision made on: ${item.approvedOrDeniedAt.toDateString()}`,
              `Email Status: ${item.isEmailSent}`,
              `Student Emails: ${item.studentEmails}`,
            ],
            { bulletRadius: 2 }
          );
      });
    }

    // Denied section
    if (report.denied.length > 0) {
      doc.moveDown(2);
      doc.fontSize(18).text("Denied", { underline: true });
      report.denied.forEach((item, index) => {
        doc
          .fontSize(12)
          .moveDown()
          .list(
            [
              `Module Code: ${item.moduleCode}`,
              `Module Name: ${item.moduleName}`,
              `Session Type: ${item.sessionType}`,
              `Lecturer Name: ${item.lecturerName}`,
              `Scheduled Date: ${item.currentDate.toDateString()} at ${
                item.currentTime
              }`,
              `Rescheduled Date: ${item.newDate.toDateString()} at ${
                item.newTime
              }`,
              `Notes: ${item.specialNotes}`,
              `Status: ${item.status}`,
              `Handled by: ${item.adminName}`,
              `Decision made on: ${item.approvedOrDeniedAt.toDateString()}`,
            ],
            { bulletRadius: 2 }
          );
      });
    }

    doc.end();


    await ReportRequest.findByIdAndUpdate(
      requestId,
      { isEmailSent: true },
      { new: true }
    );

  } catch (error) {
    console.error("Error generating or sending PDF:", error);
    res
      .status(500)
      .json({ message: "Failed to generate or send PDF", error: error.toString() });
  }

});

router.put("/updateInvalidRequest/:id", async (req, res) => {
  try {
    const updatedRequest = await ReportRequest.findByIdAndUpdate(
      req.params.id,
      { isNotValid: true },
      { new: true }
    );
    if (!updatedRequest) {
      return res.status(404).send("Request not found.");
    }
    res.status(200).json(updatedRequest);
  } catch (error) {
    console.error("Error updating request:", error);
    res.status(500).json({ message: "Error updating request", error });
  }
});


  module.exports = router;