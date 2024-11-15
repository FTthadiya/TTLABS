import React, { useState, useEffect } from "react";
import "./Report.css"; // Make sure to create a Report.css file in the same directory
import Swal from "sweetalert2";
// import DateRangePicker from "./DateRangePicker";
import { format, parseISO, formatDistanceToNow } from "date-fns";

export default function Report() {
  const [filterCriteria, setFilterCriteria] = useState({
    startDate: "",
    endDate: "",
    moduleCode: "",
    sessionType: "",
    lecturerName: "",
    status: "",
  });
  const [filteredResults, setFilteredResults] = useState({
    approved: [],
    denied: [],
  });
  const [reports, setReports] = useState([]);
  const [lecturers, setLecturers] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentReportId, setCurrentReportId] = useState(null);
  const [search, setSearch] = useState("");
  const [showPdf, setShowPdf] = useState(false);
  const [pdfUrl, setPdfUrl] = useState("");
  const [reportName, setReportName] = useState("");
  const reportsResults = reports.filter((report) =>
    report.report_name.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [lecturerRes, subjectRes, reportRes] = await Promise.all([
          fetch("http://localhost:3001/api/lecturers"),
          fetch("http://localhost:3001/api/subjects"),
          fetch("http://localhost:3001/api/notification/listReports"),
        ]);
        if (!lecturerRes.ok || !subjectRes.ok || !reportRes.ok) {
          throw new Error("Failed to fetch initial data");
        }
        const lecturersData = await lecturerRes.json();
        const subjectsData = await subjectRes.json();
        const reportsData = await reportRes.json();
        setLecturers(lecturersData);
        // setSubjects(subjectsData.map(subj => ({
        //   subjectCode: subj.subjectCode,
        //   subjectName: subj.subjectName
        // })));
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
        setReports(reportsData);
      } catch (error) {
        console.error("Error fetching initial data:", error);
      }
    };

    fetchInitialData();
  }, []);
  const handleFilterChange = (field, value) => {
    setFilterCriteria((prev) => ({ ...prev, [field]: value }));
  };
  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!Object.values(filterCriteria).some((value) => value)) {
      Swal.fire({
        icon: "info",
        title: "Oops...",
        text: "Please fill atleast start date and end date",
        confirmButtonColor: "#ECB753",
        background: "#f0edd4",
        color: "#000",
      });
      // alert("Please fill out at least one filter criterion.");
      return;
    }
    setLoading(true);
    try {
      const query = new URLSearchParams(filterCriteria).toString();
      const response = await fetch(
        `http://localhost:3001/api/notification/filterReschedules?${query}`
      );
      if (!response.ok) throw new Error("Failed to fetch filtered results");
      const data = await response.json();
      setFilteredResults({
        approved: data.filter((item) => item.status === "approved"),
        denied: data.filter((item) => item.status === "denied"),
      });
    } catch (error) {
      console.error("Error fetching filtered results:", error);
      setFilteredResults({ approved: [], denied: [] });
    } finally {
      setLoading(false);
    }
  };
  const handleView = (report) => {
    setFilterCriteria({
      startDate: report.filterCriteria.startDate.split("T")[0],
      endDate: report.filterCriteria.endDate.split("T")[0],
      moduleCode: report.filterCriteria.moduleCode,
      sessionType: report.filterCriteria.sessionType,
      lecturerName: report.filterCriteria.lecturerName,
      status: report.filterCriteria.status,
    });
    setFilteredResults({ approved: report.approved, denied: report.denied });
    setCurrentReportId(report._id);
    setShowPdf(false);
  };
  const handleDelete = async (reportId) => {
    try {
      const response = await fetch(
        `http://localhost:3001/api/notification/deleteReport/${reportId}`,
        { method: "DELETE" }
      );
      if (!response.ok) throw new Error("Failed to delete the report");
      setReports(reports.filter((report) => report._id !== reportId));
      Swal.fire({
        title: "Success!",
        text: "Report has been deleted successfully",
        icon: "success",
        confirmButtonColor: "#ECB753",
        background: "#f0edd4",
        color: "#000",
      });
      // alert("Report deleted successfully");
    } catch (error) {
      console.error("Error deleting report:", error);
      Swal.fire({
        title: "Error!",
        text: "Failed to delete report",
        icon: "error",
        confirmButtonColor: "#ECB753",
        background: "#f0edd4",
        color: "#000",
      });
      // alert("Failed to delete the report.");
    }
  };
  const handleSaveOrUpdate = async () => {
    const promptMessage = currentReportId
      ? "Update the report name:"
      : "Please enter a report name:";
    console.log("Before prompt");
    const enteredReportName = prompt(promptMessage, reportName);
    console.log("After prompt");
    if (enteredReportName === null) {
      Swal.fire({
        title: "Oops....",
        text: "You must enter a report name to continue.",
        icon: "info",
        confirmButtonColor: "#ECB753",
        background: "#f0edd4",
        color: "#000",
      });
      // alert("You must enter a report name to continue.");
      return;
    }
    setReportName(enteredReportName);
    const payload = {
      report_name: enteredReportName,
      approved: filteredResults.approved,
      denied: filteredResults.denied,
      filterCriteria: filterCriteria,
    };
    console.log(JSON.stringify(payload));
    const requestOptions = {
      method: currentReportId ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ data: payload }),
    };
    const apiUrl = currentReportId
      ? `http://localhost:3001/api/notification/updateReport/${currentReportId}`
      : "http://localhost:3001/api/notification/saveFilteredReports";
    try {
      const response = await fetch(apiUrl, requestOptions);
      if (!response.ok) throw new Error("Failed to process report");
      const result = await response.json();
      alert(result.message);

      const newReport = {
        _id: currentReportId ? result.report._id : result.reportId,
        report_name: enteredReportName,
        approved: filteredResults.approved,
        denied: filteredResults.denied,
        filterCriteria: filterCriteria
      };

      setReports((prevReports) => {
        if (currentReportId) {
          // Update existing report in the state
          return prevReports.map((report) =>
            report._id === currentReportId ? newReport : report
          );
        } else {
          // Add new report to the state
          return [...prevReports, newReport];
        }
      });

      setCurrentReportId(null);
      setReportName("");
      
    } catch (error) {
      console.error("Error:", error);
      Swal.fire({
        title: "Error!",
        text: "Failed to process report",
        icon: "error",
        confirmButtonColor: "#ECB753",
        background: "#f0edd4",
        color: "#000",
      });
      // alert("Failed to process report.");
    }
  };

  const resetFilteredResults = () => {
    setFilterCriteria({
      startDate: "",
      endDate: "",
      moduleCode: "",
      sessionType: "",
      lecturerName: "",
      status: "",
    });
    setFilteredResults({
      approved: [],
      denied: [],
    });
    setCurrentReportId(null);
  };

  const handlePrint = (reportId) => {
    window.open(
      `http://localhost:3001/api/notification/viewReport/${reportId}`,
      "_blank"
    );
    Swal.fire({
      title: "Success!",
      text: "Report has been printed successfully",
      icon: "success",
      confirmButtonColor: "#ECB753",
      background: "#f0edd4",
      color: "#000",
    });
    /* const url = `http://localhost:3001/api/notification/viewReport/${reportId}`;

    setPdfUrl(url);
    setShowPdf(true);
    console.log(url); */
  };

  const handleDownload = (reportId) => {
    window.open(
      `http://localhost:3001/api/notification/downloadReport/${reportId}`,
      "_blank"
    );
    Swal.fire({
      title: "Success!",
      text: "Report has been downloaded successfully",
      icon: "success",
      confirmButtonColor: "#ECB753",
      background: "#f0edd4",
      color: "#000",
    });
  };

  return (
    <div className="report-container">
      <aside className="sidebar">
        <h4>Saved Reports</h4>
        <div className="saved-reports-list">
      <div style={{ position: 'relative', width: '100%' }}>
        <input
          type="text"
          placeholder="Search reports by name"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            width: '100%',
            paddingRight: '30px',
            boxSizing: 'border-box',
            height: '35px',
          }}
        />
        <i
          className="fa fa-search"
          style={{
            position: 'absolute',
            right: '10px',
            top: '50%',
            transform: 'translateY(-50%)',
            fontSize: '16px',
            color: '#999',
            pointerEvents: 'none'
          }}
        ></i>
        </div>

          {reportsResults.map((report, index) => (
            <div
              key={report._id || index}
              className="saved-report row-cols-2"
              onClick={() => handleView(report)}
            >
              <span className="report-name m-1 col-9">
                {report.report_name}
              </span>
              <div className="col m-1">
                <i
                  className="fa  fa-print fa-fw icons"
                  aria-hidden="true"
                  onClick={() => handlePrint(report._id)}
                ></i>
                <i
                  className="fa fa-trash fa-fw icons"
                  aria-hidden="true"
                  onClick={() => handleDelete(report._id)}
                ></i>
                <i
                  className="fa fa-download fa-fw icons"
                  aria-hidden="true"
                  onClick={() => handleDownload(report._id)}
                ></i>
              </div>
            </div>
          ))}
          
          {/* {showPdf && (
            <div
              style={{
                position: "fixed",
                top: "10%",
                left: "10%",
                right: "10%",
                bottom: "10%",
                backgroundColor: "white",
              }}
            >
              <iframe
                src={pdfUrl}
                style={{ width: "100%", height: "100%" }}
                onLoad={() =>
                  window.frames[0].focus() && window.frames[0].print()
                }
              ></iframe>
              <button onClick={() => setShowPdf(false)}>Close</button>
            </div>
          )} */}

        </div>
      </aside>
      <main className="main-content">
        <section className="filter-section">
          <h4>Filter</h4>
          <form onSubmit={handleSubmit} className="filter-form ">
            <div className="row">
              <div className="col">
                <label htmlFor="startDate">Start Date:</label>
                <input
                  type="date"
                  id="startDate"
                  value={filterCriteria.startDate}
                  className="form-control"
                  onChange={(e) =>
                    handleFilterChange("startDate", e.target.value)
                  }
                />
              </div>
              <div className="col">
                <label htmlFor="endDate">End Date:</label>
                <input
                  type="date"
                  id="endDate"
                  className="form-control"
                  value={filterCriteria.endDate}
                  onChange={(e) =>
                    handleFilterChange("endDate", e.target.value)
                  }
                />
              </div>
              <div className="col">
                <label htmlFor="moduleCode">Module Code:</label>
                <select
                  id="moduleCode"
                  className="form-select"
                  value={filterCriteria.moduleCode}
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
              {/* <input
              type="text"
              id="moduleCode"
              value={moduleCode}
              onChange={(e) => setModuleCode(e.target.value)}
            /> */}
              <div className="col">
                <label htmlFor="sessionType">Session Type:</label>
                <select
                  id="sessionType"
                  className="form-select"
                  value={filterCriteria.sessionType}
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
              {/* <input
              type="text"
              id="sessionType"
              value={sessionType}
              onChange={(e) => setSessionType(e.target.value)}
            /> */}
              <div className="col">
                <label htmlFor="lecturerName">Lecturer Name:</label>
                <select
                  id="lecturerName"
                  className="form-select"
                  value={filterCriteria.lecturerName}
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
              {/* <input
              type="text"
              id="lecturerName"
              value={lecturerName}
              onChange={(e) => setLecturerName(e.target.value)}
            /> */}
              <div className="col">
                <label htmlFor="status">Status:</label>
                <select
                  id="status"
                  className="form-select"
                  value={filterCriteria.status}
                  onChange={(e) => handleFilterChange("status", e.target.value)}
                >
                  <option value="">All</option>
                  <option value="approved">Approved</option>
                  <option value="denied">Denied</option>
                </select>
              </div>
              {/* <input
              type="text"
              id="status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            /> */}
            </div>
            <button
              type="submit"
              className="search-button btn btn-primary me-3 my-2 "
            >
              Search
            </button>
          </form>
        </section>
        <section className="results-section">
          <div>
            <h4>Results</h4>
            {/* {(filteredResults.approved.length > 0 ||
              filteredResults.denied.length > 0) && (
              <button type="button" onClick={handleSaveOrUpdate}>
                {currentReportId ? "Update" : "Save"}
              </button>
            )} */}
            {(filteredResults.approved.length > 0 ||
              filteredResults.denied.length > 0) &&
              (currentReportId ? (
                <i className="fa fa-edit" onClick={handleSaveOrUpdate}></i>
              ) : (
                <i className="fa fa-save" onClick={handleSaveOrUpdate}></i>
              ))}
            {(filteredResults.approved.length > 0 ||
              filteredResults.denied.length > 0) && (
              <i
                className="fa fa-times fa-fw icons"
                aria-hidden="true"
                onClick={resetFilteredResults}
              ></i>
            )}
          </div>

          {/* <input
            type="text"
            placeholder="Enter report name"
            value={reportName}
            onChange={(e) => setReportName(e.target.value)}
          /> */}
          <div className="results-container">
            {filteredResults.approved.length > 0 && (
              <div className="approved-results">
                <h3>Approved reschedule requests</h3>
                {filteredResults.approved.map((result, index) => (
                  <p key={index}>
                    Module Code: {result.moduleCode} <br />
                    Module Name: {result.moduleName} <br />
                    Session Type: {result.sessionType} <br />
                    Lecturer Name: {result.lecturerName} <br />
                    Current Date: {" "}
                    {format(parseISO(result.currentDate), "PPP")} <br />
                    Current Time: {result.currentTime} <br />
                    New Date: {" "}
                    {format(parseISO(result.newDate), "PPP")} <br />
                    New Time: {result.newTime} <br />
                    Special Notes: {result.specialNotes} <br />
                    Created At: {" "}
                    {format(parseISO(result.createdAt), "PPP")} <br />
                    Admin Name: {result.adminName} <br />
                    Approved Or Denied At: {" "}
                    {format(parseISO(result.approvedOrDeniedAt), "PPP")} <br />
                    Is Email Sent: {result.isEmailSent} <br />
                    Student Emails: {result.studentEmails} <br />
                    <hr />
                  </p>
                ))}
              </div>
            )}

            {filteredResults.denied.length > 0 && (
              <div className="denied-results">
                <h3>Denied reschedule requests</h3>
                {filteredResults.denied.map((result, index) => (
                  <p key={index}>
                    Module Code: {result.moduleCode} <br />
                    Module Name: {result.moduleName} <br />
                    Session Type: {result.sessionType} <br />
                    Lecturer Name: {result.lecturerName} <br />
                    Current Date: {" "}
                    {format(parseISO(result.currentDate), "PPP")} <br />
                    Current Time: {result.currentTime} <br />
                    New Date: {" "}
                    {format(parseISO(result.newDate), "PPP")} <br />
                    New Time: {result.newTime} <br />
                    Special Notes: {result.specialNotes} <br />
                    Created At: {" "}
                    {format(parseISO(result.createdAt), "PPP")} <br />
                    Admin Name: {result.adminName} <br />
                    Approved Or Denied At: {" "}
                    {format(parseISO(result.approvedOrDeniedAt), "PPP")} <br />
                    <hr />
                    {/* {result.moduleName} - {result.lecturerName} -{" "}
                    {result.sessionType} */}
                  </p>
                ))}
              </div>
            )}

            {/* {(filteredResults.approved.length > 0 ||
              filteredResults.denied.length > 0) && (
                <button type="button" onClick={handleSaveOrUpdate}>
                {currentReportId ? "Update" : "Save"}
              </button> 
            )} */}

            {filteredResults.approved.length === 0 &&
              filteredResults.denied.length === 0 && (
                <p>No results to display.</p>
              )}
          </div>
        </section>
      </main>
    </div>
  );
}