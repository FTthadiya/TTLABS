import React, { useEffect, useState } from "react";
import axios from "axios";
import { format, parseISO, formatDistanceToNow } from "date-fns";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
// import { result } from "lodash";

function ReportRequestCard() {
  const navigate = useNavigate();
  //   const user = props.user;
  //   console.log("test notificationcardsadmin: ", user);
  const [reportRequest, setReportRequest] = useState([]);
  // const [filteredResults, setFilteredResults] = useState({
  //   approved: [],
  //   denied: [],
  // });
  const [currentReportId, setCurrentReportId] = useState(null);

  useEffect(() => {
    const fetchRescheduleInfo = async () => {
      try {
        const response = await axios.get(
          "http://localhost:3001/api/notification/getReportRequest"
        );
        const validReportRequests = response.data.filter(
          (request) => !request.isEmailSent && !request.isNotValid
        );
        setReportRequest(validReportRequests);
      } catch (error) {
        console.error("Error fetching reschedule data:", error);
      }
    };

    fetchRescheduleInfo();
  }, []);

  const sendEmail = async (request) => {
    let filterCriteria = {
      startDate: request.startDate,
      endDate: request.endDate,
      moduleCode: request.moduleCode,
      sessionType: request.sessionType,
      lecturerName: request.lecturerName,
      status: request.status,
    };
    // console.log(filterCriteria);

    let filteredResults = { approved: [], denied: [] };

    try {
      const query = new URLSearchParams(filterCriteria).toString();
      const response = await fetch(
        `http://localhost:3001/api/notification/filterReschedules?${query}`
      );
      if (!response.ok) throw new Error("Failed to fetch filtered results");
      const data = await response.json();

      filteredResults = {
        approved: data.filter((item) => item.status === "approved"),
        denied: data.filter((item) => item.status === "denied"),
      };
      // setFilteredResults({
      //   approved: data.filter((item) => item.status === "approved"),
      //   denied: data.filter((item) => item.status === "denied"),
      // });
    } catch (error) {
      console.error("Error fetching filtered results:", error);
      // setFilteredResults({ approved: [], denied: [] });
    }
    // console.log("Filtered results before timeout:", filteredResults);

    // await new Promise((resolve) => setTimeout(resolve, 10000));

    // console.log("Filtered results after timeout:", filteredResults);

    const now = new Date();
    const datePart = now.toISOString().split("T")[0];
    const timePart = now.toTimeString().split(" ")[0];
    const payload = {
      report_name: `${request.lecturerName}_Report_${datePart}_${timePart}`,
      approved: filteredResults.approved,
      denied: filteredResults.denied,
      filterCriteria: filterCriteria,
    };
    console.log(JSON.stringify(payload));
    const requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ data: payload }),
    };
    const apiUrl = "http://localhost:3001/api/notification/saveFilteredReports";

    let reportId = "";

    try {
      const response = await fetch(apiUrl, requestOptions);
      if (!response.ok) throw new Error("Failed to process report");
      const result = await response.json();
      Swal.fire({
        title: "Success!",
        text: "Report has been saved successfully",
        icon: "success",
        confirmButtonColor: "#ECB753",
        background: "#f0edd4",
        color: "#000",
      });
      // alert(result.message);
      setCurrentReportId(result._id);
      console.log(result);

      reportId = result.reportId;
      console.log(reportId);
      if (!reportId) {
        throw new Error("reportId is not defined in the response");
      }
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

    const emailRequestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        recipientEmail: request.lecturerEmail,
        requestId: request._id,
      }),
    };

    const emailApiUrl = `http://localhost:3001/api/notification/emailReport/${reportId}`;

    try {
      const emailResponse = await fetch(emailApiUrl, emailRequestOptions);
      if (!emailResponse.ok) throw new Error("Failed to send email");
      const emailResult = await emailResponse.json();
      Swal.fire({
        title: "Success!",
        text: "Email has been sent successfully",
        icon: "success",
        confirmButtonColor: "#ECB753",
        background: "#f0edd4",
        color: "#000",
      });
      // alert(emailResult.message);
    } catch (error) {
      console.error("Error:", error);
      Swal.fire({
        title: "Error!",
        text: "Failed to send email",
        icon: "error",
        confirmButtonColor: "#ECB753",
        background: "#f0edd4",
        color: "#000",
      });
      // alert("Failed to send email.");
    }

    const newRequests = reportRequest.filter(
      (reportRequest) => reportRequest._id !== request._id
    );
    setReportRequest(newRequests);
  };

  const handleCancel = async (_id) => {
    try {
      await axios.put(
        `http://localhost:3001/api/notification/updateInvalidRequest/${_id}`
      );
      const newRequests = reportRequest.filter(
        (reportRequest) => reportRequest._id !== _id
      );
      setReportRequest(newRequests);
    } catch (error) {
      console.error("Error marking the invalid request:", error);
    }

    // navigate('/admin-home');
  };

  return (
    <div className="container row row-cols-1 row-cols-md-3 g-4 mx-auto">
      {reportRequest.map((request, index) => (
        <div key={index} className="col">
          <div className="card w-auto m-2">
            <div style={{ background: "#F9FBE7", color: "black" }}>
              <div className="card-body">
              <h4
                  className="card-title mb-2 text-muted"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  Report Request
                </h4>
                {/* <h5 className="card-title">
                  {request.lecturerName} - Lecturer
                </h5> */}
                <hr />
                {/* <h6
                  className="card-subtitle mb-2 text-muted"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  Report Request
                </h6> */}
                <p className="card-text">
                  Start Date: {format(parseISO(request.startDate), "PPP")}
                  {/* Current Schedule: {reschedule.previousDate} at{" "}
                {reschedule.previousTime} */}
                </p>
                <p className="card-text">
                  End Date: {format(parseISO(request.endDate), "PPP")}
                  {/* Requested Schedule: {reschedule.currentDate} at {reschedule.currentTime} */}
                </p>
                <p className="card-text">
                  Module Code:{" "}
                  {request.moduleCode === "" ? "All" : request.moduleCode}{" "}
                </p>
                <p className="card-text">
                  Lecturer Name:{" "}
                  {request.lecturerName === "" ? "All" : request.lecturerName}
                </p>
                <p className="card-text">
                  Session Type:{" "}
                  {request.sessionType === "" ? "All" : request.sessionType}
                </p>
                <p className="card-text">
                  Status: {request.status === "" ? "All" : request.status}
                </p>
                <p className="card-text">Email: {request.lecturerEmail}</p>

                <div className="d-flex bd-highlight mb-3">
                  <div className="me-auto p-2 bd-highlight">
                    <button
                      className="btn btn-success me-2 mb-2"
                      style={{
                        background:
                          "linear-gradient(to right, #FFFFFF, #FFE9B1)",
                        borderWidth: 0,
                        color: "#000000",
                        fontWeight: "bold",
                      }}
                      onClick={() => sendEmail(request)}
                    >
                      Send Email
                    </button>
                  </div>
                  <div className="p-2 bd-highlight">
                    <button
                      className="btn btn-danger mb-2"
                      style={{
                        background:
                          "linear-gradient(to right, #FFFFFF, #FFE9B1)",
                        borderWidth: 0,
                        color: "#000000",
                        fontWeight: "bold",
                      }}
                      onClick={() => handleCancel(request._id)}
                    >
                      Cancel
                    </button>
                  </div>
                </div>

                <hr />

                {
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "start",
                      gap: "10px",
                    }}
                  >
                    <p className="card-text" style={{ marginBottom: "0" }}>
                      {formatDistanceToNow(new Date(request.createdAt), {
                        addSuffix: true,
                      })}
                    </p>
                  </div>
                }
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default ReportRequestCard;
