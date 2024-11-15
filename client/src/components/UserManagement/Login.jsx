import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ttlabs from "../../assets/userManagement/TTLABSGray.png";

function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [showVerification, setShowVerification] = useState(false);
  const navigate = useNavigate();

  // Set withCredentials to true for axios
  axios.defaults.withCredentials = true;
  const handleSubmit = (e) => {
    e.preventDefault();
    axios
      .post("http://localhost:3001/api/login", { email, password })
      .then((res) => {
        console.log("login:", res.data);

        if (res.data.Status === "Success") {
          console.log("twoFactorAuth:", res.data.twoFactorAuth); // Print the value of twoFactorAuth

          if (res.data.twoFactorAuth) {
            setShowVerification(true); // Show the 2FA verification form
          } else {
            // If 2FA is not required, proceed with login
            localStorage.setItem("token", res.data.token);
            onLogin();
            if (res.data.role === "admin") {
              navigate("/admin-home");
            } else {
              navigate("/lecturer-home");
            }
          }
        } else if (res.data.Status === "Verification code sent successfully") {
          // Handle case where 2FA is enabled and verification code is sent successfully
          setShowVerification(true);
        } else {
          toast.error("Incorrect email or password"); // Notification for incorrect credentials
        }
      })
      .catch((error) => {
        console.error("Login failed:", error);
        toast.error("Login failed"); // Notification for login failure
      });
  };

  const handleVerificationSubmit = (e) => {
    e.preventDefault();
    axios
      .post("http://localhost:3001/api/login-2fa", {
        email,
        verificationCode,
      })
      .then((res) => {
        if (res.data.Status === "Success") {
          // If verification successful, proceed with login
          localStorage.setItem("token", res.data.token);
          onLogin();
          if (res.data.role === "admin") {
            navigate("/admin-home");
          } else {
            navigate("/lecturer-home");
          }
        } else if (res.data.message) {
          // Handle verification failure with message from the server
          console.error("Verification failed:", res.data.message);
          toast.error(res.data.message); // Notification for verification failure
        } else {
          // Handle unexpected response
          console.error("Verification failed: Unexpected response", res.data);
          toast.error("Verification failed: Unexpected response");
        }
      })
      .catch((error) => {
        console.error("Verification failed:", error.message);
        toast.error("Verification failed");
      });
  };

  return (
    <div>
      <ToastContainer />
      <div className="d-flex custom-background justify-content-center align-items-center vh-100">
        <img src={ttlabs} alt="TTLabs" className="ttlabs" />
        <div className="form-bg p-3 rounded w-25 box">
          <h2 className="custom-text">Login</h2>
          <form
            onSubmit={
              showVerification ? handleVerificationSubmit : handleSubmit
            }
          >
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
            <div className="mb-3">
              <label htmlFor="password">
                <strong className="custom-text">Password</strong>
              </label>
              <input
                type="password"
                placeholder="Enter Password"
                name="password"
                className="form-control rounded-0"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            {showVerification && (
              <div className="mb-3">
                <label htmlFor="verificationCode">
                  <strong className="custom-text">Verification Code</strong>
                </label>
                <input
                  type="text"
                  placeholder="Enter Verification Code"
                  name="verificationCode"
                  className="form-control rounded-0"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                />
              </div>
            )}
            <button type="submit" className="btn btn-outline-warning w-100">
              {showVerification ? "Verify & Login" : "Login"}
            </button>
          </form>
          <div className="pt-2 d-flex justify-content-center">
            <span className="text-center custom-text">
              Don't have an account?
            </span>
            <Link to="/register" className="ps-1">
              Sign Up
            </Link>
          </div>
          <div className="pt-1 d-flex justify-content-center">
            <Link to="/forgotPassword" className="fogotpass">
              Forgot Password?
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
