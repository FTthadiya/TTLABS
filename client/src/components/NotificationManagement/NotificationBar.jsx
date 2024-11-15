import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import NotificationCardsAdmin from "./NotificationCardsAdmin";
import NotificationCardsLecturer from "./NotificationCardsLecturer";
import "./cardStyle.css";
// Import the notification sound, adjust the path as needed
import notificationSound from "./notification.wav"; // If the file is in the src folder
import { useNavigate } from "react-router-dom";

function NotificationBar(props) {
  const user = props.user;
  console.log("test notificationBar: ", user);
  const [open, setOpen] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);
  const lastNotifiedCount = useRef(0);
  const [role, setRole] = useState("");
  /* const [prevCount, setPrevCount] = useState(0); */
  const audioRef = useRef(new Audio(notificationSound)); // Create a ref for the audio element

  const navigate = useNavigate();

  const fetchRescheduleCount = async () => {
    const lastOpened =
      localStorage.getItem("lastOpened") || new Date(0).toISOString();
    /* const userRole = Cookies.get("role");
    const lecturerId = userRole === "lecture" ? Cookies.get("lecturerId") : ""; */
    const role = user.role;
    const lecturerId = role === "lecture" ? user.userId : "";
    try {
      const response = await axios.get(
        `http://localhost:3001/api/notification/getRescheduleCount`,
        {
          params: {
            lastOpened,
            role,
            lecturerId,
          },
        }
      );
      const newCount = response.data.count;
      if (newCount > lastNotifiedCount.current) {
        audioRef.current.play(); // Play the notification sound when count increases
        lastNotifiedCount.current = newCount;
      }
      /* setPrevCount(notificationCount); */ // Update the previous count
      setNotificationCount(newCount);
    } catch (error) {
      console.error("Error fetching notification count:", error);
    }
  };

  useEffect(() => {
    /* const userRole = Cookies.get("role"); */
    const userRole = user.role;
    setRole(userRole);

    const fetchAndSetInterval = () => {
      fetchRescheduleCount();
      return setInterval(fetchRescheduleCount, 5000);
    };

    const interval = fetchAndSetInterval();

    return () => clearInterval(interval);

    /* fetchRescheduleCount();
    const interval = setInterval(fetchRescheduleCount, 5000);
    return () => {
      clearInterval(interval);
    }; */

  }, [open]);

  /* const handleRescheduleHandled = () => {
    fetchRescheduleCount();
  }; */

  const handleDoubleClick = () => {
    if (user.role === "admin") navigate("/report");
  };

  /* useEffect(() => {
    if (open) {
      setNotificationCount(0);
      localStorage.setItem("lastOpened", new Date().toISOString());
    }
  }, [open]); */

  return (
    <div
      className=" d-flex justify-content-end"
      style={{ paddingBottom: 10, paddingTop: 20 }}
    >
      <button
        type="button"
        className="btn position-relative me-3"
        data-intro="Select on bell icon to view reschedule notifications and preview of reschedule request."
        onClick={() => setOpen(!open)}
        onDoubleClick={() => {
          handleDoubleClick();
        }}
        style={{
          background: "linear-gradient(to right, #FFFFFF, #FFE9B1)",
          borderWidth: 0,
          color: "#000000",
          transform: "translateY(-190%)",
        }}
      >
        <i className="fa fa-bell fa-fw" aria-hidden="true"></i>
        {notificationCount > 0 && (
          <span className="position-absolute top-0 start-100 translate-middle p-2 bg-dark border border-light rounded-circle text-light">
            {notificationCount}
            {/* <span className="visually-hidden">New alerts</span> */}
          </span>
        )}
      </button>
      {open && (
        <div className="notification-bar" style={{ zIndex: 10000 }}>
          {notificationCount > 0 ? (
          role === "admin" ? (
            <NotificationCardsAdmin
              setPreviewId={props.setPreviewId}
              onRescheduleHandled={() => fetchRescheduleCount()}
              user={user}
              notificationCount={notificationCount}
            />
          ) : role === "lecture" ? (
            <NotificationCardsLecturer
              onRescheduleHandled={() => fetchRescheduleCount()}
              user={user}
              notificationCount={notificationCount}
            />
          ) : (
            "No New Notifications"
          )) : (
            "No New Notifications"
          )}
        </div>
      )}
    </div>
  );
}

export default NotificationBar;
