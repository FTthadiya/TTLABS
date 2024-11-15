import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { deleteLecturerPreferences } from "../Services/LecturerPreferenceService";
import {
  getFunctionalities,
  updateFunctionality,
} from "../Services/FunctionalitiesService";
import ToggleBtn from "./ToggleBtn";
import "./../Css/sidebar.css";
import "./../Css/button.css";
import DeleteConfirmation from "./DeleteConfirmation";
import SuccessAlert from "./SuccessAlert";
import { toast } from "react-toastify";

function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isToggled, setIsToggled] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setInitToggleState();
  }, []);

  const setInitToggleState = async () => {
    const { data } = await getFunctionalities("getLectPrefVisibility");
    setIsToggled(data.isToggled);
  };

  const handleToggle = async () => {
    let initToggleState;
    try {
      const { data } = await getFunctionalities("getLectPrefVisibility");
      initToggleState = data.isToggled;
      const body = {
        functionName: "getLectPrefVisibility",
        isToggled: !initToggleState,
      };
      setIsToggled(!initToggleState);
      await updateFunctionality("getLectPrefVisibility", body);
    } catch (error) {
      toast.error("Something went wrong. Please try again.");
      setIsToggled(initToggleState);
    }
  };

  const closeSidebar = () => {
    if (isOpen) {
      toggleSidebar();
    }
  };

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const handleMouseOver = (e) => {
    e.currentTarget.classList.add("btn-linear-gradient");
    e.currentTarget.classList.remove("nav-link-custom");
  };

  const handleMouseLeave = (e) => {
    e.currentTarget.classList.remove("btn-linear-gradient");
    e.currentTarget.classList.add("nav-link-custom");
  };

  return (
    <div style={{zIndex: 100}}>
      <button
        className="btn btn-primary mx-3 transparent-btn"
        type="button"
        data-bs-toggle="offcanvas"
        data-bs-target="#offcanvasExample"
        aria-controls="offcanvasExample"
        onClick={toggleSidebar}
        style={{zIndex: 100}}
        data-intro="Select on sidebar icon to view the sidebar menu items."
      >
        <i className="fa fa-bars fa-2x text-dark" aria-hidden="true"></i>
      </button>

      {isOpen && (
        <div
          className="sidebar-overlay"
          style={{
            pointerevents: "auto",
          }}
          onClick={closeSidebar}
        ></div>
      )}

      <div
        className={`offcanvas offcanvas-start ${
          isOpen ? "show" : ""
        } text-white offcanvas-width`}
        style={{ background: "#353535" }}
        tabIndex="-1"
        id="offcanvasDark"
        aria-labelledby="offcanvasDarkLabel"
      >
        <div className="offcanvas-header d-flex justify-content-end">
          <i
            className="fa fa-user-circle fa-4x fa-inverse mx-2 "
            aria-hidden="true"
            style={{ cursor: "pointer" }}
            onClick={() => {
              toggleSidebar();
              navigate("/userprofile");
            }}
          ></i>
        </div>
        <hr />
        <div className="offcanvas-body">
          <ul className="nav nav-pills flex-column mb-auto">
            <li>
              <Link
                to="/specilization-management"
                className="nav-link nav-link-custom"
                onClick={toggleSidebar}
                onMouseOver={handleMouseOver}
                onMouseLeave={handleMouseLeave}
              >
                Specialization Management
              </Link>
            </li>
            <li>
              <Link
                to="/lecturer-management"
                className="nav-link nav-link-custom"
                onClick={toggleSidebar}
                onMouseOver={handleMouseOver}
                onMouseLeave={handleMouseLeave}
              >
                Lecturer Management
              </Link>
            </li>
            <li>
              <Link
                to="/subject-management"
                className="nav-link nav-link-custom "
                onClick={toggleSidebar}
                onMouseOver={handleMouseOver}
                onMouseLeave={handleMouseLeave}
              >
                Subject Management
              </Link>
            </li>
            <li>
              <Link
                to="/hall-management"
                className="nav-link nav-link-custom"
                onClick={toggleSidebar}
                onMouseOver={handleMouseOver}
                onMouseLeave={handleMouseLeave}
              >
                Hall Management
              </Link>
            </li>
            <li>
              <Link
                to="/prev-timetables"
                className="nav-link nav-link-custom"
                onClick={toggleSidebar}
                onMouseOver={handleMouseOver}
                onMouseLeave={handleMouseLeave}
              >
                View Previous Timetables
              </Link>
            </li>
          </ul>
        </div>
        <hr />
        <div className="offcanvas-body">
          <h5 className="text-center">Start New Semester</h5>
          <br />
          <p>Clean previous semester Preferences</p>
          <button
            type="button"
            className="btn btn-primary custom-button"
            onClick={() => {
              DeleteConfirmation(async () => {
                try {
                  const result = await deleteLecturerPreferences();
                } catch (error) {
                  if (error.response && error.response.status === 404) {
                    SuccessAlert(
                      "Previous   Semester Preferences are already removed."
                    );
                  }
                }
              }, "Are you sure you want to clean previous semester Preferences?");
            }}
          >
            Clean Lecturer Preferences
          </button>
          <br />
          <br />
          <ToggleBtn toggled={isToggled} onToggle={handleToggle} />
          <br />
          <div className="d-flex justify-content-center">
            <Link
              to="/generate-specbatch-selector"
              type="button"
              className="btn btn-primary custom-button w-100"
              onClick={toggleSidebar}
            >
              Generate Timetable
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Sidebar;
