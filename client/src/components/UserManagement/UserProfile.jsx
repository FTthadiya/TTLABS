import React, { useState, useEffect } from "react";
import axios from "axios";
import "./Login.css";
import "../TimeTableManagement/Css/form.css";

function UserProfile() {
  const [userData, setUserData] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [editedUserData, setEditedUserData] = useState(null);
  const [profilePicture, setProfilePicture] = useState(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [twoFactorAuth, setTwoFactorAuth] = useState(false); // State to hold 2FA status
  const [verificationCode, setVerificationCode] = useState("");
  const [verificationSent, setVerificationSent] = useState(false);
  const [verificationError, setVerificationError] = useState("");
  const [verificationCodeVisible, setVerificationCodeVisible] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios.get(
          "http://localhost:3001/api/userprofile",
          {
            withCredentials: true,
          }
        );
        setUserData(response.data);
        setEditedUserData(response.data);
        setTwoFactorAuth(response.data.twoFactorAuth);
        // No need to use local storage for profile picture
        setProfilePicture(response.data.profilePicture);
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData();
  }, []);

  const handleEdit = () => {
    setEditMode(true);
    setEditedUserData(userData); // Reset editedUserData to userData when entering edit mode
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditedUserData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onloadend = () => {
      setProfilePicture(reader.result); // Set the base64 encoded image
      // Store profile picture URL in local storage
      localStorage.setItem("profilePicture", reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    try {
      if (!editedUserData) {
        console.error("Edited user data is null.");
        return;
      }

      // Check if 2FA is enabled and trigger verification if necessary
      if (twoFactorAuth) {
        // If 2FA is enabled, prompt for verification code
        setVerificationCodeVisible(true);
        sendVerificationCode();
        return; // Exit the function to prevent further execution
      }

      // Check if any of the fields are empty, and if so, use original values
      const editedDataWithOriginal = Object.keys(editedUserData).reduce(
        (acc, key) => {
          const editedValue =
            typeof editedUserData[key] === "string"
              ? editedUserData[key].trim()
              : editedUserData[key]; // Check if value is a string before trimming
          acc[key] = editedValue === "" ? userData[key] : editedUserData[key];
          return acc;
        },
        {}
      );

      // Include profile picture data in the edited data
      editedDataWithOriginal.profilePicture = profilePicture; // Assuming profilePicture is the base64 encoded string

      await axios.put(
        "http://localhost:3001/api/userprofile",
        editedDataWithOriginal,
        {
          withCredentials: true,
        }
      );
      setUserData(editedDataWithOriginal); // Update userData with editedUserData
      setEditMode(false);
      setUploadSuccess(true);
    } catch (error) {
      console.error("Error saving user data:", error);
    }
  };

  const toggle2fa = async () => {
    try {
      if (!twoFactorAuth) {
        // If 2FA is enabled, prompt for verification code
        setVerificationCodeVisible(true);
        sendVerificationCode();
      } else {
        // If 2FA is not enabled, send request to disable it
        await axios.put(
          "http://localhost:3001/api/userprofile/2fa",
          { verified: false },
          { withCredentials: true }
        );
        setTwoFactorAuth(false);
        setVerificationCodeVisible(false);
        setVerificationSent(false); // Reset verification status
        setVerificationError(""); // Reset verification error
      }
    } catch (error) {
      console.error("Error toggling 2FA:", error);
    }
  };

  const sendVerificationCode = async () => {
    try {
      await axios.post(
        "http://localhost:3001/api/userprofile/send-verification-code",
        null,
        {
          withCredentials: true,
        }
      );
      setVerificationSent(true);
      setVerificationError("");
    } catch (error) {
      setVerificationError("Failed to send verification code");
    }
  };

  const handleVerificationSubmit = async (e) => {
    e.preventDefault();
    try {
      if (verificationCode.trim() === "") {
        setVerificationError("Please enter the verification code.");
        return;
      }

      const response = await axios.post(
        "http://localhost:3001/api/userprofile/verify-2fa",
        { verificationCode: verificationCode },
        { withCredentials: true }
      );

      if (response.status === 200 && response.data.success) {
        // Verification successful
        setVerificationSent(false);
        setVerificationCode("");
        setVerificationError("");

        // Proceed with saving data
        saveUserData();
      } else {
        // Verification failed, show error message
        setVerificationError("Invalid verification code. Please try again.");
      }
    } catch (error) {
      console.error("Error verifying code:", error);
      // Show error message if verification fails
      setVerificationError("Failed to verify code. Please try again later.");
    }
  };

  const saveUserData = async () => {
    try {
      // Check if any of the fields are empty, and if so, use original values
      const editedDataWithOriginal = Object.keys(editedUserData).reduce(
        (acc, key) => {
          const editedValue =
            typeof editedUserData[key] === "string"
              ? editedUserData[key].trim()
              : editedUserData[key]; // Check if value is a string before trimming
          acc[key] = editedValue === "" ? userData[key] : editedUserData[key];
          return acc;
        },
        {}
      );

      // Include profile picture data in the edited data
      editedDataWithOriginal.profilePicture = profilePicture; // Assuming profilePicture is the base64 encoded string

      await axios.put(
        "http://localhost:3001/api/userprofile",
        editedDataWithOriginal,
        {
          withCredentials: true,
        }
      );
      setUserData(editedDataWithOriginal); // Update userData with editedUserData
      setEditMode(false);
      setUploadSuccess(true);
      window.location.reload(); // Refresh the page
    } catch (error) {
      console.error("Error saving user data:", error);
    }
  };

  return (
    <div className="row custom-background justify-content-center">
      <div className="row justify-content-center">
        <div className="col-md-8">
          <div className="card shadow">
            <div className="form-bg card-header text-black">
              <h3 className="mb-0 text-dark text-center">User Profile</h3>
            </div>
            <div className="form-bg card-body">
              <div className="d-flex justify-content-center mb-2">
                <div className="user-data">
                  {editMode ? (
                    <>
                      <div className="row">
                        <div className="col d-block align-content-center">
                          <div className="text-center mb-4">
                            {profilePicture && (
                              <img
                                src={profilePicture}
                                alt="Profile"
                                className="profile-picture"
                              />
                            )}
                          </div>
                        </div>
                        <div className="col d-block align-content-center">
                          <div className="col">
                            <div className="col">
                              <button
                                onClick={toggle2fa}
                                className="btn btn-outline-warning w-100"
                              >
                                {twoFactorAuth ? "Disable 2FA" : "Enable 2FA"}
                              </button>
                              {/* Display verification code input if 2FA is enabled */}
                              {verificationCodeVisible && ( // Render input field only if verificationCodeVisible is true
                                <form
                                  onSubmit={handleVerificationSubmit}
                                  className="mt-2 mb-2 form-container"
                                  style={{ width: "100%" }}
                                >
                                  <div>
                                    <label htmlFor="verificationCode">
                                      <strong>Enter Verification Code:</strong>
                                    </label>
                                    <input
                                      type="text"
                                      id="verificationCode"
                                      value={verificationCode}
                                      onChange={(e) =>
                                        setVerificationCode(e.target.value)
                                      }
                                      className="form-control rounded-0"
                                    />
                                  </div>
                                  <div
                                    className="text-center"
                                    style={{ paddingTop: "0" }}
                                  >
                                    <button
                                      type="submit"
                                      className="btn btn-outline-warning w-75"
                                    >
                                      Submit
                                    </button>
                                  </div>
                                  {/* Display verification sent message */}
                                  {verificationSent && (
                                    <p
                                      className=" text-success text-center  "
                                      style={{
                                        paddingTop: "0",
                                        paddingBottom: verificationError
                                          ? "0"
                                          : "10px",
                                      }}
                                    >
                                      Verification code sent successfully!
                                    </p>
                                  )}
                                  {/* Display verification error message */}
                                  {verificationError && (
                                    <p
                                      className=" text-danger text-center"
                                      style={{
                                        paddingTop: "0",
                                        paddingBottom: "10px",
                                      }}
                                    >
                                      {verificationError}
                                    </p>
                                  )}
                                </form>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="row">
                        <div className="col form-container">
                          <div
                            className="form-group"
                            style={{ paddingBottom: "0" }}
                          >
                            <label
                              htmlFor="firstname"
                              style={{ fontWeight: "bold" }}
                            >
                              First Name:
                            </label>
                            <input
                              type="text"
                              name="Firstname"
                              id="firstname"
                              className="form-control"
                              placeholder="First Name"
                              value={editedUserData?.Firstname}
                              onChange={handleChange}
                            />
                          </div>

                          <div
                            className="form-group"
                            style={{
                              paddingBottom: "10px",
                              paddingTop: "10px",
                            }}
                          >
                            <label
                              htmlFor="lastname"
                              style={{ fontWeight: "bold" }}
                            >
                              Last Name:
                            </label>
                            <input
                              type="text"
                              name="Lastname"
                              id="lastname"
                              className="form-control"
                              placeholder="Last Name"
                              value={editedUserData?.Lastname}
                              onChange={handleChange}
                            />
                          </div>

                          <div
                            className="form-group"
                            style={{ paddingBottom: "0px", paddingTop: "0px" }}
                          >
                            <label
                              htmlFor="email"
                              style={{ fontWeight: "bold" }}
                            >
                              Email:
                            </label>
                            <input
                              type="email"
                              name="email"
                              id="email"
                              className="form-control"
                              placeholder="Email"
                              value={editedUserData?.email}
                              onChange={handleChange}
                            />
                          </div>

                          <div
                            className="form-group"
                            style={{
                              paddingTop: "10px",
                              paddingBottom: "10px",
                            }}
                          >
                            <label
                              htmlFor="profile-picture"
                              style={{ fontWeight: "bold" }}
                            >
                              Profile Picture:
                            </label>
                            <div className="custom-file">
                              <input
                                type="file"
                                className="custom-file-input"
                                id="profile-picture"
                                onChange={handleFileChange}
                                accept="image/*"
                              />
                            </div>
                          </div>

                          <div
                            className="form-group"
                            style={{ paddingTop: "10px" }}
                          >
                            <button
                              onClick={handleSave}
                              className="mt-3 btn btn-warning w-100 "
                            >
                              Save
                            </button>
                          </div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="row mb-4 ">
                        <div className="col text-end">
                          {profilePicture && (
                            <img
                              src={profilePicture}
                              alt="Profile"
                              className="profile-picture"
                            />
                          )}
                        </div>
                        <div className="col d-block align-content-center">
                          <h4 className="mb-0">{userData?.Firstname}</h4>
                          <h4>{userData?.Lastname}</h4>
                          <h6 className="mb-3">{userData?.email}</h6>
                          <button
                            onClick={handleEdit}
                            className="btn btn-warning"
                            style={{ borderRadius: "50%" }}
                          >
                            <i className="fa fa-pencil" aria-hidden="true"></i>
                          </button>
                        </div>
                      </div>
                      <div className="row">
                        <div className="col">
                          <button
                            onClick={toggle2fa}
                            className="btn btn-outline-warning w-100"
                          >
                            {twoFactorAuth ? "Disable 2FA" : "Enable 2FA"}
                          </button>
                          {/* Display verification code input if 2FA is enabled */}
                          {verificationCodeVisible && ( // Render input field only if verificationCodeVisible is true
                            <form
                              onSubmit={handleVerificationSubmit}
                              className="mt-4 form-container"
                              style={{ width: "100%" }}
                            >
                              <div>
                                <label htmlFor="verificationCode">
                                  <strong>Enter Verification Code:</strong>
                                </label>
                                <input
                                  type="text"
                                  id="verificationCode"
                                  value={verificationCode}
                                  onChange={(e) =>
                                    setVerificationCode(e.target.value)
                                  }
                                  className="form-control rounded-0"
                                />
                              </div>
                              <div
                                className="text-center"
                                style={{ paddingTop: "0" }}
                              >
                                <button
                                  type="submit"
                                  className="btn btn-outline-warning w-75"
                                >
                                  Submit
                                </button>
                              </div>
                              {/* Display verification sent message */}
                              {verificationSent && (
                                <p
                                  className=" text-success text-center"
                                  style={{
                                    paddingTop: "0",
                                    paddingBottom: verificationError
                                      ? "0"
                                      : "10px",
                                  }}
                                >
                                  Verification code sent successfully!
                                </p>
                              )}
                              {/* Display verification error message */}
                              {verificationError && (
                                <p
                                  className=" text-danger text-center"
                                  style={{ paddingTop: "0" }}
                                >
                                  {verificationError}
                                </p>
                              )}
                            </form>
                          )}
                        </div>
                        <div
                          className="col-auto d-block align-content-center"
                          style={{ borderLeft: "1px solid black" }}
                        >
                          <p>
                            <strong
                              style={{ fontSize: "18px", marginRight: "0" }}
                            >
                              First Name:
                            </strong>{" "}
                            {userData?.Firstname}
                          </p>
                          <p>
                            <strong
                              style={{ fontSize: "18px", marginRight: "0" }}
                            >
                              Last Name:
                            </strong>{" "}
                            {userData?.Lastname}
                          </p>
                          <p>
                            <strong
                              style={{ fontSize: "18px", marginRight: "0" }}
                            >
                              Email:
                            </strong>{" "}
                            {userData?.email}
                          </p>
                          <p>
                            <strong
                              style={{ fontSize: "18px", marginRight: "0" }}
                            >
                              Role:
                            </strong>{" "}
                            {userData?.role}
                          </p>
                          <p>
                            <strong
                              style={{ fontSize: "18px", marginRight: "0" }}
                            >
                              2FA:
                            </strong>{" "}
                            {twoFactorAuth ? "Enabled" : "Disabled"}
                          </p>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserProfile;
