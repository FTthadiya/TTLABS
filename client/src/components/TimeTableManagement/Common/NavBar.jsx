import React from "react";
import { NavLink } from "react-router-dom";
import "./../Css/button.css";
import introJs from "intro.js";

function Navbar({ user }) {
  console.log(user);
  return (
    <nav
      className="navbar navbar-expand-lg navbar-dark "
      style={{ background: "#353535" }}
    >
      <div className="container-fluid">
        <div className="navbar-brand mx-3 me-5" style={{ fontSize: 18 }}>
          Welcome{" "}
          <span style={{ fontWeight: "bolder", fontSize: 20 }}>
            {user.firstName}
          </span>
        </div>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav">
            {user.role === "admin" && (
              <>
                <li className="nav-item">
                  <NavLink
                    className="nav-link"
                    to="/admin-home"
                    data-title="Navigate to home page  <br>"
                    data-intro="To view weekly updated timetables"
                  >
                    Home
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink
                    className="nav-link"
                    to="/admin-reschedule"
                    data-title="Navigate to reschedule page  <br>"
                    data-intro="To reschedule sessions based on lecturer requests"
                  >
                    Reschedule
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    className="nav-link"
                    to="/admin-default-timetables"
                    data-title="Navigate to default timetable page  <br>"
                    data-intro="To view the timetables generated in the begining of the semester"
                  >
                    Original Timetables
                  </NavLink>
                </li>
                <li>
                  <NavLink className="nav-link" to="/adminprofilemanagement">
                    Manage Users
                  </NavLink>
                </li>
              </>
            )}
            {/* Change the role to lecturer */}
            {user.role === "lecture" && (
              <>
                <li className="nav-item">
                  <NavLink
                    className="nav-link"
                    to="/lecturer-home"
                    data-title="Navigate to home page  <br>"
                    data-intro="To view weekly updated personalized timetables"
                  >
                    Home
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink
                    className="nav-link"
                    to="/lecturer-reschedule"
                    data-title="Navigate to reschedule page  <br>"
                    data-intro="To send lecturer reschedule requests to admin"
                  >
                    Reschedule
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    className="nav-link"
                    to="/lecturer-default-timetable"
                    data-title="Navigate to default timetable page  <br>"
                    data-intro="To view the personalized timetables generated in the begining of the semester"
                  >
                    Original Timetable
                  </NavLink>
                </li>
              </>
            )}
          </ul>
          <div className="ms-auto d-flex flex-row">
            <div
              className=" me-3 my-2 help-button d-flex"
              onClick={() => {
                introJs()
                  .setOptions({
                    tooltipClass: "customTooltip",
                    showProgress: true,
                  })
                  .start();
              }}
              style={{ cursor: "pointer" }}

              // to={`/${user.role}-help`}
            >
              <i
                className="fa fa-question-circle my-auto"
                aria-hidden="true"
              ></i>
            </div>
            <NavLink
              className="btn btn-primary me-3 my-2 custom-button fw-bold"
              type="button"
              to="/logout"
            >
              Logout
              <i
                className="fa fa-sign-out fa-fw"
                aria-hidden="true"
                style={{ paddingLeft: 10 }}
              ></i>
            </NavLink>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
