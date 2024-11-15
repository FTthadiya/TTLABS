import React from "react";
import { Link } from "react-router-dom";
import "../Css/button.css";

function PrefCard(props) {
  return (
    <div
      className="card text-dark mb-3 mt-5 text-center"
      data-intro="Add preffered dates and times for assigned modules"
      style={{
        padding: 10,
        background: "#f0edd4",
        boxShadow: "0 0 10px 0 rgba(0, 0, 0, 0.1)",
      }}
    >
      <div className="card-header">
        <h5>Lecturer Preference</h5>
      </div>
      <div className="card-body">
        <p className="card-text">
          The provided button will direct you to a forum where you can specify
          preferred time slots for each of your subjects.
        </p>
      </div>
      <div>
        <Link
          to="/lecturer-preference"
          className="btn btn-primary custom-button"
        >
          Add Preference
        </Link>
      </div>
    </div>
  );
}

export default PrefCard;
