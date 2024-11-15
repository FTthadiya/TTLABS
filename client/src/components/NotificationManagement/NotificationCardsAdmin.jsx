import React, { useEffect, useState } from "react";
import axios from "axios";
/* import { formatDistanceToNow } from "date-fns"; */
import { format, parseISO, formatDistanceToNow } from "date-fns";
import { useNavigate } from "react-router-dom";
import { resAssignHall, resDeleteAssignHall } from "../LabHall-Management/halls/ResAssignHall";
import { resAssignLab, resDeleteAssignLab } from "../LabHall-Management/labs/ResAssignLab";
import SuccessAlert from "../TimeTableManagement/Common/SuccessAlert";
import Swal from "sweetalert2";

function NotificationCardsAdmin(props) {

  const navigate = useNavigate();

  const user = props.user;
  console.log("test notificationcardsadmin: ", user);
  const [reschedules, setReschedules] = useState([]);

  useEffect(() => {
    const fetchRescheduleInfo = async () => {
      try {
        const response = await axios.get(
          "http://localhost:3001/api/notification/getRescheduleInfo"
        );
        const activeReschedules = response.data.filter(
          (reschedule) => reschedule.status == ""
        );
        setReschedules(activeReschedules);
      } catch (error) {
        console.error("Error fetching reschedule data:", error);
      }
    };

    fetchRescheduleInfo();
  }, [props.notificationCount]);

  const handleApprove = async (id) => {
    try {
      const userFirstName = user.firstName;
      /* const userLastName = user.lastName; */
      const role = user.role;

      const sendEmails = () => {
        console.log("send email")
        axios
          .post("http://localhost:3001/api/notification/send-emails")
          .then((response) => {
            console.log("Emails sent successfully:", response.data);
          })
          .catch((error) => {
            console.error("Error sending emails:", error);
          });
      };

      const timeTableResponse = await axios.get(`http://localhost:3001/api/saveRequest/getTimetable/${id}`);

      const timetable = timeTableResponse.data;


      const response = await axios.put(
        `http://localhost:3001/api/notification/approveReschedule/${id}`,
        {},
        {
          headers: {
            "Admin-FirstName": userFirstName,
            /* "Admin-LastName": userLastName, */
            Role: role,
          },
        }
      );
      if (response.status === 200) {
        props.onRescheduleHandled();
        setReschedules(
          reschedules.filter((reschedule) => reschedule._id !== id)
        );

        if(timetable.subject.sessionType !== "Lab")
        {
            if(timetable.lectureHall !== null && timetable.lectureHall.hallId !== "" && timetable.lectureHall.hallId !== " ")
              {
                await resDeleteAssignHall(timetable.lectureHall._id);
              }
            const msg = await resAssignHall(timetable);
            console.log("Lecturehall assign: ", msg);

        }
        else{
          if(timetable.lectureHall !== null && timetable.lectureHall.hallId !== "" && timetable.lectureHall.hallId !== " ")
            {
              await resDeleteAssignLab(timetable.lectureHall._id);
            }
          const msg = await resAssignLab(timetable);
          console.log("Lab assign: ", msg);
        }
        

        setTimeout(sendEmails, 5000);


        if(props.setSelectedModule)
          {
            props.setSelectedModule("");
          }
      }
    } catch (error) {
      console.error("Error approving reschedule:", error);
    }

    try {
      const userFirstName = user.firstName;
      const role = user.role;

      const response = await axios.put(
        `http://localhost:3001/api/saveRequest/approve/${id}`,
        {
          headers: {
            "Admin-FirstName": userFirstName,
            Role: role,
          },
        }
      );
      Swal.fire({
        title: "Success!",
        text: "Reschedule request has been approved",
        icon: "success",
        confirmButtonColor: "#ECB753",
        background: "#f0edd4",
        color: "#000",
      });
      //SuccessAlert("Request approved successfully.");
    } catch (error) {
      console.error("Error approving reschedule:", error);
      if(error.response.data.error)
      {
        alert(error.response.data.error)
      }
    }
  };

  const handleDeny = async (id) => {
    try {
      const userFirstName = user.firstName;
      /* const userLastName = user.lastName; */
      const role = user.role;

      const response = await axios.put(
        `http://localhost:3001/api/notification/denyReschedule/${id}`,
        {},
        {
          headers: {
            "Admin-FirstName": userFirstName,
            /* "Admin-LastName": userLastName, */
            Role: role,
          },
        }
      );
      if (response.status === 200) {
        props.onRescheduleHandled();
        setReschedules(
          reschedules.filter((reschedule) => reschedule._id !== id)
        );
      }
      Swal.fire({
        title: "Success!",
        text: "Reschedule request has been denied",
        icon: "success",
        confirmButtonColor: "#ECB753",
        background: "#f0edd4",
        color: "#000",
      });
    } catch (error) {
      console.error("Error denying reschedule:", error);
    }
  };

  const handleViewReportRequests = () => {
    navigate('/reportrequestcard');
  };

  return (
    <div className="container">
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
      <button
                className="btn btn-success mt-3"
                style={{
                  background: "linear-gradient(to right, #FFFFFF, #FFE9B1)",
                  borderWidth: 0,
                  color: "#000000",
                  fontWeight: "bold",
                }}
                onClick={handleViewReportRequests}
              >
                VIEW REPORT REQUESTS
              </button>
              </div>
              
      {reschedules.map((reschedule, index) => (
        <div key={index} className="mb-3 mt-3">
          <div className="card" style={{ background: "#F9FBE7", color: "black" }}>
            <div className="card-body">
              <h5 className="card-title">{reschedule.lecturerName} - Lecturer</h5>
              <hr />
              <h6 className="card-subtitle mb-2 text-muted" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              Reschedule Request
              <button
                className="btn btn-success me-2 mb-2"
                style={{
                  background: "linear-gradient(to right, #FFFFFF, #FFE9B1)",
                  borderWidth: 0,
                  color: "#000000",
                }}
                onClick={() => props.setPreviewId(prevPreviewId => prevPreviewId === reschedule._id ? null : reschedule._id)}
              >
                {props.previewId === reschedule._id ? "Close Preview" : "Preview"}
              </button>
              </h6>
              <p className="card-text">Module: {reschedule.moduleName}</p>
              <p className="card-text">
              Session Type: {reschedule.sessionType}
              </p>
              <p className="card-text">
              Current Schedule:{" "}
              {format(parseISO(reschedule.previousDate), "PPP")} at{" "}
              {reschedule.previousTime} 
              {/* Current Schedule: {reschedule.previousDate} at{" "}
                {reschedule.previousTime} */}
              </p>
              <p className="card-text">
              Requested Schedule:{" "}
                {format(parseISO(reschedule.currentDate), "PPP")} at{" "}
                {reschedule.currentTime}
                {/* Requested Schedule: {reschedule.currentDate} at {reschedule.currentTime} */}
              </p>
              <p className="card-text">Notes: {reschedule.specialNotes}</p>

              <div className="d-flex bd-highlight mb-3">
                <div className="me-auto p-2 bd-highlight"><button
                className="btn btn-success me-2 mb-2"
                style={{
                  background: "linear-gradient(to right, #FFFFFF, #FFE9B1)",
                  borderWidth: 0,
                  color: "#000000",
                  fontWeight: "bold",
                }}
                onClick={() => handleApprove(reschedule._id)}
              >
                Approve
              </button></div>
                <div className="p-2 bd-highlight">
                  <button
                className="btn btn-danger mb-2"
                style={{
                  background: "linear-gradient(to right, #FFFFFF, #FFE9B1)",
                  borderWidth: 0,
                  color: "#000000",
                  fontWeight: "bold",
                }}
                onClick={() => handleDeny(reschedule._id)}
              >
                Deny
              </button></div>
              </div>

              <hr />
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "start",
                  gap: "10px",
                }}
              >
                <p className="card-text" style={{ marginBottom: "0" }}>
                  {formatDistanceToNow(new Date(reschedule.createdAt), {
                    addSuffix: true,
                  })}
                </p>
              
            </div>
          </div>
        </div>
        </div>
      ))}
    </div>
  );
}

export default NotificationCardsAdmin;