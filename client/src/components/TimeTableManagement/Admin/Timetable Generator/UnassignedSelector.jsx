import React, { useState } from "react";
import "../../Css/form.css";
import "../../Css/button.css";

function UnassignedSelector({ data, days, times, isSelected, onLoad, onSave }) {
  const [selectedDayId, setSelectedDayId] = useState("");
  const [selectedTimeId, setSelectedTimeId] = useState("");
  const [timetableObj, setTimetableObj] = useState({});
  const [error, setError] = useState({});

  const handleLoadClick = () => {
    onLoad(data);
  };

  const handleSaveClick = () => {
    const hasErrors = handleErrors();
    if (hasErrors) {
      return;
    }
    onSave(data, selectedDayId, selectedTimeId);
  };

  const handleDayChange = (event) => {
    setSelectedDayId(event.target.value);
    setError("");
  };

  const handleTimeChange = (event) => {
    setSelectedTimeId(event.target.value);
    setError("");
  };

  const handleErrors = () => {
    if (selectedDayId === "") {
      setError({ message: "Please select a day" });
      return true;
    }
    if (selectedTimeId === "") {
      setError({ message: "Please select a time" });
      return true;
    }
    setError("");
    return false;
  };

  return (
    <div
      className="text-dark text-center form-container ms-3 mb-3"
      style={{ width: "96%" }}
    >
      <div className="row" style={{ marginBottom: 0, paddingBottom: 0 }}>
        {data.subjectCode} - {data.subjectName} ({data.sessionType})
        <br />
        {data.lecturer.lecturerName}
        <br />
        {data.duration} Hours
      </div>
      <div className="row">
        {isSelected ? (
          <div>
            <div className="row">
              <div className="col">
                <select
                  className="form-select form-select-sm"
                  style={{ backgroundColor: "#F9FBE7" }}
                  aria-label="Select day"
                  value={selectedDayId}
                  onChange={handleDayChange}
                >
                  <option key="default" value="">
                    Select
                  </option>
                  {days.map((day) => (
                    <option key={day._id} value={day._id}>
                      {day.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col">
                <select
                  className="form-select form-select-sm"
                  style={{ backgroundColor: "#F9FBE7" }}
                  aria-label="Select time"
                  value={selectedTimeId}
                  onChange={handleTimeChange}
                >
                  <option key="default" value="">
                    Select
                  </option>
                  {times.map((time) => (
                    <option key={time._id} value={time._id}>
                      {time.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            {error.message && (
              <div className="text-danger mt-1">{error.message}</div>
            )}
            <div className="text-danger"></div>
            <div className="row">
              <button
                className="btn btn-primary custom-button mt-2"
                onClick={handleSaveClick}
              >
                Save
              </button>
            </div>
          </div>
        ) : (
          <button
            className="btn btn-primary custom-button"
            onClick={handleLoadClick}
          >
            Load
          </button>
        )}
      </div>
    </div>
  );
}

export default UnassignedSelector;
