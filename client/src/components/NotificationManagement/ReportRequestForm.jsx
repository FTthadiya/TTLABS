import React, { useState, useEffect } from "react";
import "./ReportRequestForm.css";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

function ReportRequestForm() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    startDate: "",
    endDate: "",
    moduleCode: "",
    sessionType: "",
    lecturerName: "",
    status: "",
    lecturerEmail: "",
  });

  const [lecturers, setLecturers] = useState([]);
  const [subjects, setSubjects] = useState([]);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [lecturerRes, subjectRes] = await Promise.all([
          fetch("http://localhost:3001/api/lecturers"),
          fetch("http://localhost:3001/api/subjects"),
        ]);
        if (!lecturerRes.ok || !subjectRes.ok) {
          throw new Error("Failed to fetch initial data");
        }
        const lecturersData = await lecturerRes.json();
        const subjectsData = await subjectRes.json();
        setLecturers(lecturersData);

        const uniqueSubjects = Array.from(
          new Set(subjectsData.map((subject) => subject.subjectCode))
        ).map((code) => {
          return {
            subjectCode: code,
            subjectName: subjectsData.find((s) => s.subjectCode === code)
              .subjectName,
          };
        });
        setSubjects(uniqueSubjects);

        console.log(uniqueSubjects);
      } catch (error) {
        console.error("Error fetching initial data:", error);
      }
    };

    fetchInitialData();
  }, []);

  const handleFilterChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSend = async (event) => {
    event.preventDefault();
    try {
      const response = await fetch(
        "http://localhost:3001/api/notification/reportRequest",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const result = await response.json();
      Swal.fire({
        title: "Success!",
        text: "Request has been submitted scuccessfully",
        icon: "success",
        confirmButtonColor: "#ECB753",
        background: "#f0edd4",
        color: "#000",
      });
      // console.log("Success:", result);
      setFormData({
        startDate: "",
        endDate: "",
        moduleCode: "",
        sessionType: "",
        lecturerName: "",
        status: "",
        lecturerEmail: "",
      });
      // setShowSuccessMessage(true);
      // setTimeout(() => setShowSuccessMessage(false), 3000);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleCancel = () => {
    navigate("/lecturer-home");
  };

  return (
    <form>
      <div className="form-group">
        <div
          className="card p-3 w-50 mx-auto"
          style={{ backgroundColor: "#F0EDD4" }}
        >
          <h4 className="card-title mx-auto m-4"> Report Request Form</h4>
          <div className="row">
            <div className="col">
              <div className="m-3">
                <label htmlFor="startDate">Start Date:</label>
                <input
                  type="date"
                  id="startDate"
                  value={formData.startDate}
                  className="form-control"
                  onChange={(e) =>
                    handleFilterChange("startDate", e.target.value)
                  }
                />
              </div>
              <div className="m-3">
                <label htmlFor="endDate">End Date:</label>
                <input
                  type="date"
                  id="endDate"
                  className="form-control"
                  value={formData.endDate}
                  onChange={(e) =>
                    handleFilterChange("endDate", e.target.value)
                  }
                />
              </div>
              <div className="m-3">
                <label htmlFor="moduleCode">Module Code:</label>
                <select
                  id="moduleCode"
                  className="form-select"
                  value={formData.moduleCode}
                  onChange={(e) =>
                    handleFilterChange("moduleCode", e.target.value)
                  }
                >
                  <option value="">All</option>
                  {subjects.map((subject) => (
                    <option key={subject._id} value={subject.subjectCode}>
                      {subject.subjectCode}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="col">
              <div className="m-3">
                <label htmlFor="sessionType">Session Type:</label>
                <select
                  id="sessionType"
                  className="form-select"
                  value={formData.sessionType}
                  onChange={(e) =>
                    handleFilterChange("sessionType", e.target.value)
                  }
                >
                  <option value="">All</option>
                  <option value="Lecture">Lecture</option>
                  <option value="Lab">Lab</option>
                  <option value="Tute">Tute</option>
                  <option value="Workshop">Workshop</option>
                  <option value="Seminar">Seminar</option>
                </select>
              </div>
              <div className="m-3">
                <label htmlFor="lecturerName">Lecturer Name:</label>
                <select
                  id="lecturerName"
                  className="form-select"
                  value={formData.lecturerName}
                  onChange={(e) =>
                    handleFilterChange("lecturerName", e.target.value)
                  }
                >
                  <option value="">All</option>
                  {lecturers.map((lecturer) => (
                    <option key={lecturer._id} value={lecturer.lecturerName}>
                      {lecturer.lecturerName}
                    </option>
                  ))}
                </select>
              </div>
              <div className="m-3">
                <label htmlFor="status">Status:</label>
                <select
                  id="status"
                  className="form-select"
                  value={formData.status}
                  onChange={(e) => handleFilterChange("status", e.target.value)}
                >
                  <option value="">All</option>
                  <option value="approved">Approved</option>
                  <option value="denied">Denied</option>
                </select>
              </div>
            </div>
            <div className="m-3">
              <label htmlFor="lecturer email">Lecturer Email:</label>
              <input
                id="lecturer email"
                className="form-control"
                value={formData.lecturerEmail}
                onChange={(e) =>
                  handleFilterChange("lecturerEmail", e.target.value)
                }
              ></input>
            </div>
          </div>
          <button
            type="submit"
            className="submit-button btn btn-primary me-3 my-2 m-3"
            style={{
              background: "linear-gradient(to right, #FFFFFF, #FFE9B1)",
              borderWidth: 0,
              color: "#000000",
              fontWeight: "bold",
            }}
            onClick={handleSend}
          >
            Send
          </button>
          <button
            type="submit"
            className="submit-button btn btn-primary me-3 my-2 m-3"
            style={{
              background: "linear-gradient(to right, #FFFFFF, #FFE9B1)",
              borderWidth: 0,
              color: "#000000",
              fontWeight: "bold",
            }}
            onClick={handleCancel}
          >
            Cancel
          </button>
        </div>
      </div>
    </form>
  );
}

export default ReportRequestForm;
