import React, { useState } from "react";

const DateRangePicker = () => {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [showPicker, setShowPicker] = useState(false);

  const handleDateChange = (event) => {
    const { name, value } = event.target;
    if (name === "startDate") {
      setStartDate(value);
    } else {
      setEndDate(value);
    }
  };

  const togglePicker = () => {
    setShowPicker(!showPicker);
  };

  return (
    <div>
      <button onClick={togglePicker}>
        {startDate && endDate ? `${startDate} - ${endDate}` : "Select Dates"}
      </button>
      {showPicker && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            padding: "10px",
            border: "1px solid #ccc",
            borderRadius: "5px",
          }}
        >
          <input
            type="date"
            name="startDate"
            value={startDate}
            onChange={handleDateChange}
            style={{ margin: "5px" }}
          />
          <input
            type="date"
            name="endDate"
            value={endDate}
            onChange={handleDateChange}
            style={{ margin: "5px" }}
          />
        </div>
      )}
      <p>Start Date: {startDate}</p>
      <p>End Date: {endDate}</p>
    </div>
  );
};

export default DateRangePicker;
