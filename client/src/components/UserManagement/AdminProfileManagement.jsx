import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import { deleteLecturer } from "../TimeTableManagement/Services/LecturerService";
import "react-toastify/dist/ReactToastify.css";
import "../TimeTableManagement/Css/button.css";

function AdminProfileManagement() {
  const [users, setUsers] = useState(() => {
    const storedUsers = localStorage.getItem("users");
    return storedUsers ? JSON.parse(storedUsers) : [];
  });
  const [newUser, setNewUser] = useState({
    Firstname: "",
    Lastname: "",
    email: "",
    Password: "",
    role: "",
  });
  const [editingUserId, setEditingUserId] = useState(null);
  const [loading, setLoading] = useState(true); // Loading state
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearch, setIsSearch] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    localStorage.setItem("users", JSON.stringify(users));
  }, [users]);

  const fetchUsers = async () => {
    try {
      const response = await axios.get(
        "http://localhost:3001/api/adminprofilemanagement/users"
      );
      if (Array.isArray(response.data)) {
        setUsers(response.data);
      } else {
        //console.error("Data fetched is not an array:", response.data);
      }
      setLoading(false); // Data fetched, set loading to false
    } catch (error) {
      //console.error("Error fetching users:", error);
      //toast.error("Error fetching users. Please try again later.");
    }
  };

  const addUser = async () => {
    if (
      !newUser.Firstname ||
      !newUser.Lastname ||
      !newUser.email ||
      !newUser.Password ||
      !newUser.role
    ) {
      toast.error("All fields are required.");
      return;
    }

    if (!newUser.email.includes("@")) {
      toast.error("Invalid email address.");
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:3001/api/register",
        newUser
      );
      setUsers((prevUsers) => [...prevUsers, response.data]);
      setNewUser({
        Firstname: "",
        Lastname: "",
        email: "",
        Password: "",
        role: "",
      });
      if (newUser.role === "lecture") {
        const user = {
          _id: response.data._id,
          lecturerName: `${newUser.Firstname} ${newUser.Lastname}`,
          email: response.data.email,
        };
        axios
          .post("http://localhost:3001/api/lecturers", user)
          .then((res) => {
            console.log("Lecturer added successfully!");
          })
          .catch((err) => console.log(err));
      }
      toast.success("User added successfully!", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
    } catch (error) {
      console.error("Error adding user:", error);
      toast.error("Error adding user. Please try again later.");
    }
  };

  const deleteUser = async (userId) => {
    try {
      await axios.delete(
        `http://localhost:3001/api/adminprofilemanagement/users/${userId}`
      );
      if (users.find((user) => user._id === userId).role === "lecture") {
        const response = await deleteLecturer(userId);
      }
      setUsers((prevUsers) => prevUsers.filter((user) => user._id !== userId));
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  };

  const editUser = (userId) => {
    setEditingUserId(userId);
    const userToEdit = users.find((user) => user._id === userId);
    setNewUser({ ...userToEdit });
  };

  const saveUserChanges = async () => {
    if (
      !newUser.Firstname ||
      !newUser.Lastname ||
      !newUser.email ||
      !newUser.Password ||
      !newUser.role
    ) {
      toast.error("All fields are required.");
      return;
    }

    if (!newUser.email.includes("@")) {
      toast.error("Invalid email address. Email must contain '@' sign.");
      return;
    }

    try {
      await axios.put(
        `http://localhost:3001/api/adminprofilemanagement/users/${editingUserId}`,
        newUser
      );
      setEditingUserId(null);
      setNewUser({
        Firstname: "",
        Lastname: "",
        email: "",
        Password: "",
        role: "",
      });
      const updatedUsers = users.map((user) =>
        user._id === editingUserId ? { ...user, ...newUser } : user
      );
      setUsers(updatedUsers);
      if (newUser.role === "lecture") {
        const user = {
          _id: editingUserId,
          lecturerName: `${newUser.Firstname} ${newUser.Lastname}`,
          email: newUser.email,
        };
        axios
          .post("http://localhost:3001/api/lecturers", user)
          .then((res) => {
            console.log("Lecturer added successfully!");
          })
          .catch((err) => console.log(err));
      } else if (newUser.role === "admin") {
        const response = await deleteLecturer(editingUserId);
      }
      toast.success("User information updated successfully!");
    } catch (error) {
      console.error("Error updating user:", error);
      toast.error("Error updating user information. Please try again later.");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewUser((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const toggleView = () => {
    setIsSearch((prevState) => !prevState);
  };

  return (
    <div>
      <div className="row custom-background justify-content-center">
        <div className={isSearch ? 'col-md-6' :'col-md-4' }>
          <div className="card shadow">
            <div className="form-bg card-body p-4">
              <div className="d-flex justify-content-between">
                    <h2  className="col-md-2">Users</h2>
                    {isSearch && <button onClick={toggleView} className="btn btn-primary custom-button">New User</button>}
                    {!isSearch && <button onClick={toggleView} className="btn btn-primary custom-button">Search Users</button>}
                  </div>
                  <hr />

                {!isSearch ?  <div>
                <h4 className="mb-5 mt-4 text-center">Add New User</h4>
                <div className="input-group mb-3">
                  <label  className="col-md-2">First Name</label>
                  <input type="text" name="Firstname" value={newUser.Firstname} onChange={handleChange} className="form-control" />
                </div>
                <div className="input-group mb-3">
                  <label className="col-md-2">Last Name</label>

                  <input type="text" name="Lastname" value={newUser.Lastname} onChange={handleChange} className="form-control" />
                </div>
                <div className="input-group mb-3">
                  <label className="col-md-2">Email</label>

                  <input type="email" name="email" value={newUser.email} onChange={handleChange} className="form-control" />
                  </div>
                  <div className="input-group mb-3">
                  <label className="col-md-2">Password</label>
                  <input type="password" name="Password" value={newUser.Password} onChange={handleChange} className="form-control" />
                  </div>

                  <div className="input-group mb-3">
                  <label className="col-md-2">Role</label>
                  <select name="role" value={newUser.role} onChange={handleChange} className="form-control">
                    <option value="">Select Role</option>
                    <option value="admin">Admin</option>
                    <option value="lecture">Lecture</option>
                    <option value="visitor">Visitor</option>
                  </select>
                  </div>
                  <div className="d-flex justify-content-end align-items-end mt-5">
                    <button onClick={addUser} className="btn btn-primary custom-button">Add User</button>
                  </div>
              </div>
                : <div className="mb-4">
                  <h4 className="mb-4 mt-4 text-center">Search Users</h4>
                  <div className="input-group mb-3">
                    <input
                      type="text"
                      placeholder="Search users"
                      value={searchQuery}
                      onChange={handleSearch}
                      className="form-control mb-4"
                    />
                  </div>
                  <hr />
                </div>}
                {isSearch && <div className="row justify-content-center overflow-y-scroll" style={{maxHeight: '50vh'}}>
                  {users.length > 0 ? (
                    <table className="c-table" style={{minWidth: '90%'}}>
                      <thead>
                        <tr>
                          <th>First Name</th>
                          <th>Last Name</th>
                          <th>Email</th>
                          <th>Role</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {users
                          .filter((user) =>
                            `${user.Firstname} ${user.Lastname} ${user.email} ${user.role}`
                              .toLowerCase()
                              .includes(searchQuery.toLowerCase())
                          )
                          .map((user) => (
                            <tr key={user._id}>
                              <td>
                                {editingUserId === user._id ? (
                                  <input
                                    type="text"
                                    name="Firstname"
                                    value={newUser.Firstname}
                                    onChange={handleChange}
                                  />
                                ) : (
                                  user.Firstname
                                )}
                              </td>
                              <td>
                                {editingUserId === user._id ? (
                                  <input
                                    type="text"
                                    name="Lastname"
                                    value={newUser.Lastname}
                                    onChange={handleChange}
                                  />
                                ) : (
                                  user.Lastname
                                )}
                              </td>
                              <td>
                                {editingUserId === user._id ? (
                                  <input
                                    type="text"
                                    name="email"
                                    value={newUser.email}
                                    onChange={handleChange}
                                  />
                                ) : (
                                  user.email
                                )}
                              </td>
                              <td>
                                {editingUserId === user._id ? (
                                  <select
                                    name="role"
                                    value={newUser.role}
                                    onChange={handleChange}
                                    className="form-control"
                                  >
                                    <option value="">Select Role</option>
                                    <option value="admin">Admin</option>
                                    <option value="lecture">Lecture</option>
                                    <option value="visitor">Visitor</option>
                                  </select>
                                ) : (
                                  user.role
                                )}
                              </td>
                              <td>
                              {editingUserId === user._id ? (
                                <div className="d-flex gap-1">
                                  <button onClick={saveUserChanges} className="btn btn-success">Save</button>&nbsp;
                                  <button onClick={() => setEditingUserId(null)} className="btn btn-secondary">Cancel</button>
                                </div>
                              ) : (
                                <div className="d-flex gap-1">
                                  <button onClick={() => editUser(user._id)} className="btn btn-primary custom-button">Edit</button>&nbsp;
                                  <button onClick={() => deleteUser(user._id)} className="btn btn-danger">Delete</button>
                                </div>
                              )}
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  ) : (
                    <p>No users found.</p>
                  )}
                </div>}
              </div>
          </div>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
}

export default AdminProfileManagement;
