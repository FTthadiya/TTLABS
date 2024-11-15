import React, { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ttlabs from "../../assets/userManagement/TTLABSGray.png";

function Signup() {
  const [Firstname, setFirstName] = useState("");
  const [Lastname, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [Password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("lecture"); // Holds the selected role
  const navigate = useNavigate();

  const validatePassword = (password) => {
    // Password validation criteria
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChars = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    return (
      password.length >= minLength &&
      hasUpperCase &&
      hasLowerCase &&
      hasNumbers &&
      hasSpecialChars
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Check if any field is empty
    if (!Firstname || !Lastname || !email || !Password || !confirmPassword) {
      return toast.error("Please fill in all fields.");
    }

    if (!validatePassword(Password)) {
      return toast.error(
        "Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character."
      );
    }

    if (Password !== confirmPassword) {
      return toast.error("Passwords do not match.");
    }

    axios
      .post("http://localhost:3001/api/register", {
        Firstname,
        Lastname,
        email,
        Password,
        role,
      })
      .then((res) => {
        if (role === "lecture") {
          const user = {
            _id: res.data._id,
            lecturerName: `${Firstname} ${Lastname}`,
            email: res.data.email,
          };
          axios
            .post("http://localhost:3001/api/lecturers", user)
            .then((res) => {
              navigate("/login");
            })
            .catch((err) => console.log(err));
        }
        navigate("/login");
      })
      .catch((err) => {
        console.log(err);
        toast.error("Failed to register. Please try again later.");
      });
  };

  return (
    <div>
      <div className="d-flex custom-background justify-content-center align-items-center vh-100">
        <img src={ttlabs} className="ttlabs" alt="TTLABS logo" />
        <div className="form-bg p-3 rounded w-25 box">
          <h2 className="custom-text">Register</h2>
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="First">
                <strong className="custom-text">First Name</strong>
              </label>
              <input
                type="text"
                placeholder="Enter First Name"
                autoComplete="off"
                name="name"
                className="form-control rounded-0"
                onChange={(e) => setFirstName(e.target.value)}
              />
            </div>
            <div className="mb-3">
              <label htmlFor="Last">
                <strong className="custom-text">Last Name</strong>
              </label>
              <input
                type="text"
                placeholder="Enter Last Name"
                autoComplete="off"
                name="name"
                className="form-control rounded-0"
                onChange={(e) => setLastName(e.target.value)}
              />
            </div>
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
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div className="mb-3">
              <label htmlFor="repassword">
                <strong className="custom-text">Re Type Password</strong>
              </label>
              <input
                type="password"
                placeholder="Re Type Password"
                name="repassword"
                className="form-control rounded-0"
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
            <button type="submit" className="btn btn-outline-warning w-100">
              Register
            </button>
          </form>
          <div className="have-account d-flex justify-content-center custom-text">
            Already Have an Account ?
          </div>
          <Link to="/login" className="btn btn-outline-warning w-100">
            Login
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Signup;
