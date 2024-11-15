import { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "font-awesome/css/font-awesome.min.css";
import { ToastContainer } from "react-toastify";
import { jwtDecode } from "jwt-decode";
import "react-toastify/dist/ReactToastify.css";

import Login from "./components/UserManagement/Login";

import ForgotPassword from "./components/UserManagement/ForgotPassword";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import "./App.css";
import "intro.js/introjs.css";
import NavBar from "./components/TimeTableManagement/Common/NavBar";

/* import NotificationBar from "./components/TimeTableManagement/Common/NotificationBar"; */

import AdminHome from "./components/TimeTableManagement/Admin/AdminHome";
import AdminTimetables from "./components/TimeTableManagement/Admin/AdminTimetables";
import AdminHelp from "./components/TimeTableManagement/Admin/AdminHelp";
import SpecilizationManagement from "./components/TimeTableManagement/Admin/SpecilizationManagement";
import LecturerManagement from "./components/TimeTableManagement/Admin/LecturerManagement";
import SubjectManagement from "./components/TimeTableManagement/Admin/SubjectManagement";
import PrevTimetables from "./components/TimeTableManagement/Admin/PrevTimetables";
import SpecilizationFormWrapper from "./components/TimeTableManagement/Admin/Forms/SpecilizationForm";
import BatchFormWrapper from "./components/TimeTableManagement/Admin/Forms/BatchForm";
import SubjectFormWrapper from "./components/TimeTableManagement/Admin/Forms/SubjectForm";
import SubjectManageFormWrapper from "./components/TimeTableManagement/Admin/Forms/SubjectManageForm";
import TTSpecBatchSelector from "./components/TimeTableManagement/Admin/Timetable Generator/TTSpecBatchSelector";
import UnassignedResolver from "./components/TimeTableManagement/Admin/Timetable Generator/UnassignedResolver";

import LecturerHome from "./components/TimeTableManagement/Lecturer/LecturerHome";
import LecturerTimetables from "./components/TimeTableManagement/Lecturer/LecturerTimetables";
import LecturerHelp from "./components/TimeTableManagement/Lecturer/LecturerHelp";
import LecturerPrefFormWrapper from "./components/TimeTableManagement/Lecturer/LecturerPrefForm";

import LecturerReschedule from "./components/Reschedule-management/lecturer/LecturerReschedule";
import AdminReschedule from "./components/Reschedule-management/admin/AdminReschedule";

import Logout from "./components/TimeTableManagement/Common/Logout";
import Signup from "./components/UserManagement/Signup";

import Sidebar from "./components/TimeTableManagement/Common/Sidebar";
import ResePassAfterOtp from "./components/UserManagement/ResePassAfterOtp";
import ClassManagement from "./components/LabHall-Management/main/ClassManagement";
import ViewHalls from "./components/LabHall-Management/halls/ViewHalls";
import UserProfile from "./components/UserManagement/UserProfile";
import AdminProfileManagement from "./components/UserManagement/AdminProfileManagement";

import AssignHall from "./components/LabHall-Management/halls/AssignHall";
import ViewLabs from "./components/LabHall-Management/labs/ViewLabs";
import AssignLab from "./components/LabHall-Management/labs/AssignLab";

import NotificationBar from "./components/NotificationManagement/NotificationBar";

// import RequestForm from "./components/NotificationManagement/RequestForm"
import Report from "./components/NotificationManagement/Report";
import ReportRequestForm from "./components/NotificationManagement/ReportRequestForm";
import ReportRequestCard from "./components/NotificationManagement/ReportRequestCard";

function App() {
  const [user, setUser] = useState(() => {
    const jwt = localStorage.getItem("token");
    if (jwt) {
      const data = jwtDecode(jwt);
      return data;
    }
    return null;
  });

  useEffect(() => {
    document.body.style.backgroundColor = "#ffffe0";
  }, []);

  const handleLogin = () => {
    console.log("handleLogin");
    const jwt = localStorage.getItem("token");
    if (jwt) {
      const data = jwtDecode(jwt);
      setUser(data);
      console.log(user);
    }
  };

  return (
    <div>
      <BrowserRouter>
        <ToastContainer theme="dark" position="top-right" />
        {user && <NavBar user={user} />}

        {/* {user && <NotificationBar />}  */}
        <div
          className="container-fluid d-flex justify-content-end"
          style={{ paddingBottom: 10, paddingTop: 20 }}
        ></div>

        <div>{user && user.role === "admin" && <Sidebar />}</div>

        <Routes>
          <Route index element={<Login onLogin={handleLogin} />} />
          <Route path="/login" element={<Login onLogin={handleLogin} />} />
          <Route path="/register" element={<Signup />}></Route>
          <Route path="/forgotPassword" element={<ForgotPassword />}></Route>
          <Route
            path="/resetPass/:userId/:token"
            element={<ResePassAfterOtp />}
          />
          <Route path="/userprofile" element={<UserProfile />}></Route>
          <Route
            path="/adminprofilemanagement"
            element={<AdminProfileManagement />}
          ></Route>

          {/* Admin_Routes */}
          <Route path="/admin-home" element={<AdminHome user={user} />} />
          <Route
            path="/admin-default-timetables"
            element={<AdminTimetables />}
          />
          <Route
            path="/admin-reschedule"
            element={<AdminReschedule user={user} />}
          ></Route>

          <Route />
          <Route path="/admin-help" element={<AdminHelp />} />
          <Route
            path="/specilization-management/new-specilization"
            element={<SpecilizationFormWrapper />}
          />
          <Route
            path="/specilization-management/new-batch"
            element={<BatchFormWrapper />}
          />
          <Route
            path="/specilization-management"
            element={<SpecilizationManagement />}
          />
          <Route path="/lecturer-management" element={<LecturerManagement />} />
          <Route
            path="/subject-management/:id"
            element={<SubjectManageFormWrapper />}
          />
          <Route
            path="/subject-management/new-subject"
            element={<SubjectFormWrapper />}
          />
          <Route path="/conflicts-resolver" element={<UnassignedResolver />} />
          <Route path="/subject-management" element={<SubjectManagement />} />
          <Route path="/hall-management/viewHalls" element={<ViewHalls />} />
          <Route path="/hall-management/assignHall" element={<AssignHall />} />
          <Route path="/hall-management/viewLabs" element={<ViewLabs />} />
          <Route path="/hall-management/assignLab" element={<AssignLab />} />

          <Route path="/hall-management" element={<ClassManagement />} />

          <Route path="/prev-timetables" element={<PrevTimetables />} />
          <Route
            path="/generate-specbatch-selector"
            element={<TTSpecBatchSelector />}
          />

          {/* Lecturer_Routes */}
          <Route path="/lecturer-home" element={<LecturerHome user={user} />} />
          <Route
            path="/lecturer-reschedule"
            element={<LecturerReschedule user={user} />}
          ></Route>

          {/* <Route path="/lecturer-reschedule" element={<RequestForm user={user} />} /> */}

          <Route
            path="/lecturer-default-timetable"
            element={<LecturerTimetables user={user} />}
          />
          <Route
            path="/lecturer-preference"
            element={<LecturerPrefFormWrapper user={user} />}
          />
          <Route path="/lecturer-help" element={<LecturerHelp />} />
          <Route path="/logout" element={<Logout />} />
          <Route path="/report" element={<Report />} />
          <Route path="/requestreport" element={<ReportRequestForm />} />
          <Route path="/reportrequestcard" element={<ReportRequestCard />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
