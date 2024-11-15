import React, { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom'; // Import useNavigate
import axios from 'axios';
import "./Login.css";

function ResetPassAfterOtp() {
    const [password, setPassword] = useState('');
    const [repassword, setRepassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const { userId, token } = useParams();
    const navigate = useNavigate(); // Initialize navigate

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (password !== repassword) {
            setErrorMessage("Passwords do not match");
            return;
        }

        try {
            const response = await axios.post(`http://localhost:3001/api/resetPassword/${userId}/${token}`, {
                newPassword: password
            });
            alert(response.data.message);
            navigate('/login'); // Navigate to login page after successful password reset
        } catch (error) {
            console.error("Error resetting password:", error.response.data.error);
            alert("Error resetting password");
        }
    };

    return (
        <div>
            <nav className='navbar'>
                <div className="contact-us p-1 rounded w-20 position-absolute top-0 end-0">
                    <Link to="/contactUs" className='contactUs'>
                        Contact Us
                    </Link>
                </div>
            </nav>
            <div className="d-flex custom-background justify-content-center align-items-center vh-100">
                <div className="form-bg p-3 rounded w-25 box">
                    <h2 className="custom-text" >Reset Password</h2>
                    <form onSubmit={handleSubmit}>
                        <div className="mb-3">
                            <label htmlFor="password">
                                <strong className="custom-text">Password</strong>
                            </label>
                            <input
                                type="password"
                                placeholder="Enter Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="form-control rounded-0"
                            />
                        </div>
                        <div className="mb-3">
                            <label htmlFor="repassword">
                                <strong className="custom-text">Re Type Password</strong>
                            </label>
                            <input
                                type="password"
                                placeholder="Re Type Password"
                                value={repassword}
                                onChange={(e) => setRepassword(e.target.value)}
                                className="form-control rounded-0"
                            />
                        </div>
                        {errorMessage && <p className="text-danger">{errorMessage}</p>}
                        <button type="submit" className="btn btn-outline-warning w-100">
                            Submit
                        </button>
                    </form>
                    <div className='pt-2 d-flex justify-content-center'></div>
                </div>
            </div>
        </div>
    );
}

export default ResetPassAfterOtp;
