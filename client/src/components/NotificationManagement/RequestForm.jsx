import React, { useState } from "react";
import "./RequestForm.css";
import Cookies from "js-cookie";

function RequestForm({ user }) {
  console.log(user);
  const initialFormData = {
    moduleName: "",
    sessionType: "",
    currentDate: "",
    currentTime: "",
    newDate: "",
    newTime: "",
    specialNotes: "",
    lecturerName: user.firstName
      /* Cookies.get("userFirstName") + " " + Cookies.get("userLastName"), */
  };

  const modules = ["DAA", "DSA", "PDI"];
  const [formData, setFormData] = useState({
    ...initialFormData,
    lecturerName: user.firstName
    /* `${Cookies.get("userFirstName") || ""} ${
      Cookies.get("userLastName") || ""
    }`.trim(), */
  });
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const response = await fetch("http://localhost:3001/api/notification/reschedule", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const result = await response.json();
      console.log("Success:", result);
      setFormData(initialFormData);
      setShowSuccessMessage(true);
      setTimeout(() => setShowSuccessMessage(false), 3000);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <div>
      <main className="container mx-auto">
        {showSuccessMessage && (
          <div className="alert alert-success" role="alert">
            Request submitted successfully!
          </div>
        )}
        <div className="row">
          <div
            className="col card text-bg-dark mb-3 mt-5 text-center"
            style={{
              borderImage: "linear-gradient(to right, #FFFFFF, #5CD6E0)2",
              margin: 50,
              padding: 40,
            }}
          >
            <form onSubmit={handleSubmit}>
              {/* Module Name */}
              <div className="form-group">
                <label htmlFor="moduleName">Module Name</label>
                <input
                  list="data"
                  autoFocus
                  id="moduleName"
                  name="moduleName"
                  type="text"
                  placeholder="Select module"
                  value={formData.moduleName}
                  onChange={handleInputChange}
                  required
                />
                <datalist id="data">
                  {modules.map((module, index) => (
                    <option key={index} value={module}>
                      {module}
                    </option>
                  ))}
                </datalist>
              </div>

              {/* Session Type */}
              <div className="form-group">
                <label htmlFor="sessionType">Session Type</label>
                <select
                  id="sessionType"
                  name="sessionType"
                  value={formData.sessionType}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select type</option>
                  <option value="Lecture">Lecture</option>
                  <option value="Lab">Lab</option>
                  <option value="Workshop">Workshop</option>
                </select>
              </div>

              {/* Current Date */}
              <div className="form-group">
                <label htmlFor="currentDate">Current Date</label>
                <input
                  id="currentDate"
                  name="currentDate"
                  type="date"
                  value={formData.currentDate}
                  onChange={handleInputChange}
                  required
                />
              </div>

              {/* Current Time */}
              <div className="form-group">
                <label htmlFor="currentTime">Current Time</label>
                <input
                  id="currentTime"
                  name="currentTime"
                  type="time"
                  value={formData.currentTime}
                  onChange={handleInputChange}
                  required
                />
              </div>

              {/* New Date */}
              <div className="form-group">
                <label htmlFor="newDate">New Date</label>
                <input
                  id="newDate"
                  name="newDate"
                  type="date"
                  value={formData.newDate}
                  onChange={handleInputChange}
                  required
                />
              </div>

              {/* New Time */}
              <div className="form-group">
                <label htmlFor="newTime">New Time</label>
                <input
                  id="newTime"
                  name="newTime"
                  type="time"
                  value={formData.newTime}
                  onChange={handleInputChange}
                  required
                />
              </div>

              {/* Special Notes */}
              <div className="form-group">
                <label htmlFor="specialNotes">Special Notes</label>
                <input
                  id="specialNotes"
                  name="specialNotes"
                  type="text"
                  placeholder="Any special notes"
                  value={formData.specialNotes}
                  onChange={handleInputChange}
                />
              </div>

              <br />

              {/* Submit Button */}
              <button
                type="submit"
                className="btn btn-primary"
                style={{
                  background: "linear-gradient(to right, #FFFFFF, #5CD6E0)",
                  borderWidth: 0,
                  color: "#000000",
                  fontWeight: "bold",
                }}
              >
                Submit
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}

export default RequestForm;