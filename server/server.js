const mongoose = require("mongoose");
const express = require("express");
const cors = require("cors");
const Joi = require("joi");
Joi.objectId = require("joi-objectid")(Joi);
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const specBatches = require("./routes/TimeTableManagement/specBatches");
const lecturers = require("./routes/TimeTableManagement/lecturers");
const days = require("./routes/TimeTableManagement/days");
const startTimes = require("./routes/TimeTableManagement/startTimes");
const subjects = require("./routes/TimeTableManagement/subjects");
const timetables = require("./routes/TimeTableManagement/timetables");
const lecturerPreferences = require("./routes/TimeTableManagement/lecturerPreferences");
const functionalities = require("./routes/TimeTableManagement/functionalities");
const generateTimetables = require("./routes/TimeTableManagement/TimetableGeneratorRoutes/timetablesGenerators");
const clashesFinders = require("./routes/TimeTableManagement/TimetableGeneratorRoutes/clashesFinders");
const optimizeTimetables = require("./routes/TimeTableManagement/TimetableGeneratorRoutes/optimizeTimetables");
const Request_route = require("./routes/reschedule-management/request_route");
const resTimetableRoute = require("./routes/reschedule-management/resTimetable_route");
const hallRoute = require("./routes/LabHall-Management/hall_route");
const labRoute = require("./routes/LabHall-Management/lab_route");
const asshallRoute = require("./routes/LabHall-Management/asshall_route");
const asslabRoute = require("./routes/LabHall-Management/asslab_route");
const UserModel = require("./models/UserManagement/Users");
const path = require("path");
const dotenv = require('dotenv');
dotenv.config();


const notificationRoutes = require("./routes/NotificationManagement/notificationRoutes");

mongoose
  .connect(process.env.MONGO_URL)
  .then(() => console.log("Connected to MongoDB database..."))
  .catch((err) => console.error("Unable to connect to the database", err));

const cookieParser = require("cookie-parser");
const nodemailer = require("nodemailer");
const request_route = require("./routes/UserManagement/User_route");

const app = express();
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) {
        return callback(null, true);
      }
      const allowedOrigins = [/^http:\/\/localhost:\d+$/];
      const isAllowed = allowedOrigins.some((regex) => regex.test(origin));
      if (isAllowed) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: [
      "Origin",
      "X-Requested-With",
      "Content-Type",
      "Accept",
      "Authorization",
      "admin-firstname",
      "role",
    ],
    credentials: true,
  })
);
app.use(express.json({ limit: "20mb" }));
app.use(cookieParser());
app.use("/Assets", express.static(path.join(__dirname, "Assets")));

app.use(express.json());
app.use(cookieParser());
app.use("/api/specBatches", specBatches);
app.use("/api/lecturers", lecturers);
app.use("/api/days", days);
app.use("/api/startTimes", startTimes);
app.use("/api/subjects", subjects);
app.use("/api/functionalities", functionalities);
app.use("/api/timetables", timetables);
app.use("/api/lecturerPreferences", lecturerPreferences);
app.use("/api/generateTimetables", generateTimetables);
app.use("/api/clashesFinder", clashesFinders);
app.use("/api/optimizeTimetables", optimizeTimetables);
app.use("/api/saveRequest", Request_route);
app.use("/api/resTimetable", resTimetableRoute);
app.use("/api", request_route);
app.use("/api/hall", hallRoute);
app.use("/api/lab", labRoute);
app.use("/api/lab", labRoute);
app.use("/api/notification", notificationRoutes);
app.use("/api/lab", labRoute);
app.use("/api/assignhall", asshallRoute);
app.use("/api/assignlab", asslabRoute);

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
