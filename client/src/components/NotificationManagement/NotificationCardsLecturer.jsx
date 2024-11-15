import React, { useEffect, useState } from "react";
import axios from "axios";
/* import { formatDistanceToNow } from "date-fns"; */
import { format, parseISO, formatDistanceToNow } from "date-fns";
import { useNavigate } from "react-router-dom";

function NotificationCardsLecturer(props) {
  useNavigate();
  const [reschedules, setReschedules] = useState([]);

  useEffect(() => {
    const fetchRescheduleInfo = async () => {
      try {
        const response = await axios.get(
          "http://localhost:3001/api/notification/getRescheduleInfo"
        );
        const filteredReschedules = response.data.filter(
          (reschedule) =>
            (reschedule.status == "approved" || reschedule.status == "denied") &&
            !reschedule.isResolved
        );
        setReschedules(filteredReschedules);
      } catch (error) {
        console.error("Error fetching reschedule data:", error);
      }
    };

    fetchRescheduleInfo();
  }, [props.notificationCount]); // Add props.notificationCount as a dependency

  const markAsResolved = async (_id) => {
    try {
      await axios.put(`http://localhost:3001/api/notification/markRescheduleAsResolved/${_id}`);
      const newReschedules = reschedules.filter(
        (reschedule) => reschedule._id !== _id
      );
      setReschedules(newReschedules);
      if (props.onRescheduleHandled) {
        props.onRescheduleHandled();
      }
    } catch (error) {
      console.error("Error marking reschedule as resolved:", error);
    }
  };

  const navigate = useNavigate();

  const handleRequestReportButtonClick = () => {
    navigate('/requestreport');
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
                onClick={handleRequestReportButtonClick}
              >
                REQUEST REPORT
              </button>
              </div>
      <div className="justify-content-start">
        {reschedules.map((reschedule, index) => (
          <div key={index} className="mb-3 mt-3">
            <div
              className={`card ${
                reschedule.status == "approved" ? "border-success" : "border-danger"
              }`} style={{ background: "#F9FBE7", color: "black" }}
            >
              <div className="card-body">
                <h5 className="card-title">
                  Admin: {reschedule.adminName}
                </h5>
                <hr />
                <h6 className="card-subtitle mb-2">
                  Reschedule Request {reschedule.status == "approved" ? "Approved" : "Denied"}
                </h6>
                <p className="card-text">
                  Module: {reschedule.moduleName}
                </p>
                <p className="card-text">
                  Session Type: {reschedule.sessionType}
                </p>
                <p className="card-text">
                Current Schedule:{" "}
                {format(parseISO(reschedule.previousDate), "PPP")} at{" "}
                {reschedule.previousTime}
                  {/* Original Schedule: {reschedule.previousDate} at{" "}
                  {reschedule.previousTime} */}
                </p>
                <p className="card-text">
                Requested Schedule:{" "}
                {format(parseISO(reschedule.currentDate), "PPP")} at{" "}
                {reschedule.currentTime}
                  {/* Rescheduled To: {reschedule.currentDate} at {reschedule.currentTime} */}
                </p>
                <p className="card-text">Notes: {reschedule.specialNotes}</p>
                <div style={{ display: "flex", justifyContent: "center" }}>
                <button
                  onClick={() => markAsResolved(reschedule._id)}
                  className="btn btn-primary"
                  style={{
                    background: "linear-gradient(to right, #FFFFFF, #FFE9B1)",
                    borderWidth: 0,
                    color: "#000000",
                    fontWeight: "bold",
                  }}
                >
                  Mark as Read
                </button>
                </div>
                <hr />
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <p className="card-text" style={{ marginBottom: "0" }}>
                    {formatDistanceToNow(new Date(reschedule.approvedOrDeniedAt), {
                      addSuffix: true,
                    })}
                  </p>
                
              </div>
            </div>
          </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default NotificationCardsLecturer;