import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "./Login.css";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false); // New loading state
  const navigate = useNavigate();

  axios.defaults.withCredentials = true;

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true); // Set loading state to true when sending request
    axios
      .post("http://localhost:3001/api/forgotPassword", { email })
      .then((res) => {
        if (res.data.Status === "Success") {
          setMessage("Password reset link successfully sent.");
          // Clear email input after successful submission
          setEmail("");
          setTimeout(() => {
            setMessage("");
            navigate("/login");
          }, 4000); // Clear message after 5 seconds and navigate to login page
        }
      })
      .catch((err) => {
        if (
          err.response &&
          err.response.data &&
          err.response.data.error === "User not found"
        ) {
          setMessage("There is no user with this email.");
        } else {
          setMessage("An error occurred. Please try again later.");
        }
        console.error(err);
      })
      .finally(() => {
        setLoading(false); // Set loading state to false after request completion
      });
  };

  return (
    <div>
      <div className="d-flex custom-background justify-content-center align-items-center vh-100">
        <div className="form-bg p-3 rounded w-25 box">
          <h4 className="custom-text">Forgot Password</h4>
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="email">
                <strong className="custom-text">Email</strong>
              </label>
              <input
                type="email"
                placeholder="Enter Email"
                autoComplete="off"
                name="email"
                className="form-control rounded-0"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <button
              type="submit"
              className="btn btn-outline-warning w-100"
              disabled={loading}
            >
              {loading ? "Sending..." : "Send"}
            </button>
          </form>
          {message && (
            <div
              className={`alert mt-3 ${
                message === "Password reset link successfully sent."
                  ? "alert-success"
                  : "alert-danger"
              }`}
              role="alert"
            >
              {message}
            </div>
          )}
          <Link to="/login" className="btn btn-outline-warning w-100 mt-3">
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;
