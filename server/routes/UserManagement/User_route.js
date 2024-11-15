const express = require("express");
const bcrypt = require('bcrypt');
const UserModel = require('../../models/UserManagement/Users');
const router = express.Router();
const jwt = require('jsonwebtoken')
const nodemailer = require('nodemailer');
const dotenv = require('dotenv')
const cookieParser = require('cookie-parser');

const multer = require('multer')
const path = require('path')

dotenv.config(); 

const verifyUser = (req, res, next) => {
    const token = req.cookies.token;
    //console.log(token);
    if(!token){
        return res.json("The token was not available")    
    } else {
        jwt.verify(token,"jwt-secret-key", (err, decode) => {
            if(err){
            return res.json("Token is Wrong")
            }else{
                if(decode.role === "admin"){
                    next()
                }else if (decode.role === "lecture") {
                    next()
                } else {
                    return res.json("Not A Valid User")
                }
            }
        })
    }
}



router.use(express.json({ limit: '20mb' })); // Set JSON body limit to 20MB
router.use(cookieParser());

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'Assets/');
    },
    filename: (req, file, cb) => {
        cb(null, file.fieldname + "" + Date.now() + path.extname(file.originalname));
    }
});

router.use('/Assets', express.static(path.join(__dirname, 'Assets')));

const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Only images are allowed'));
    }
};

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 1024 * 1024 * 10 // 10MB limit
    },
    fileFilter: fileFilter
});


router.post('/register', async(req, res) => {
    const { Firstname, Lastname, email, Password, role } = req.body;
    bcrypt.hash(Password, 10)
        .then(hash => {
            UserModel.create({ Firstname, Lastname, email, Password: hash, role })
                .then(user => res.json(user))
                .catch(err => res.json(err));
        })
        .catch(err => console.log(err.message));
});

router.post("/login", async (req, res) => {
    const { email, password } = req.body;
    const user = await UserModel.findOne({ email });

    if (!user) {
        return res.json("No record existed");
    }

    bcrypt.compare(password, user.Password, (err, result) => {
        if (result) {
            // If password is correct
            if (!user.twoFactorAuth) {
                // If 2FA is not enabled, proceed with regular login
                const token = jwt.sign({ role: user.role, firstName: user.Firstname, userId: user._id, email: user.email, twoFactorAuth: user.twoFactorAuth }, "jwt-secret-key", { expiresIn: "1d" });
                res.cookie("token", token);
                return res.json({ Status: "Success", role: user.role, token: token });
            } else {
                // If 2FA is enabled, send 2FA code to user's email
                const verificationCode = Math.floor(1000 + Math.random() * 9000);
                user.verificationCode = verificationCode;
                user.save();

                // Send the verification code to the user's email
                const transporter = nodemailer.createTransport({
                    service: 'gmail',
                    host: "smtp.gmail.com",
                    port: 587,
                    secure: false,
                    auth: {
                        user: process.env.GMAIL_USERNAME,
                        pass: process.env.GMAIL_PASSWORD
                    }
                });

                const mailOptions = {
                    from: 'your-email@example.com',
                    to: email,
                    subject: 'Verification Code for Two-Factor Authentication',
                    text: `Your verification code is: ${verificationCode}`
                };

                transporter.sendMail(mailOptions, function (error, info) {
                    if (error) {
                        console.log(error);
                        return res.status(500).json({ error: "Failed to send verification code" });
                    } else {
                        return res.status(200).json({ Status: "Verification code sent successfully", twoFactorAuth: user.twoFactorAuth });
                    }
                });
            }
        } else {
            // If password is incorrect
            return res.json("The password is incorrect");
        }
    });
});

router.post("/login-2fa", async (req, res) => {
    const { email, verificationCode } = req.body;
    const user = await UserModel.findOne({ email });

    if (!user) {
        return res.json("No record existed");
    }

    // Verify the provided verification code
    if (user.verificationCode !== verificationCode) {
        return res.json("Invalid verification code");
    }

    // Clear the verification code after successful verification
    user.verificationCode = null;
    await user.save();

    // Generate JWT token for the user
    const token = jwt.sign({ role: user.role, firstName: user.Firstname, userId: user._id, email: user.email }, "jwt-secret-key", { expiresIn: "1d" });
    res.cookie("token", token);

    // Return success response along with the token and role
    return res.json({ Status: "Success", role: user.role, token: token });
});

router.post('/forgotPassword', (req, res) => {
    const { email } = req.body;
    UserModel.findOne({ email: email })
        .then(user => {
            if (!user) {
                // If user is not found, send appropriate error response
                return res.status(404).json({ error: "User not found" });
            }
            const token = jwt.sign({ id: user._id }, "jwt-secret-key", { expiresIn: "10m" })
            var transporter = nodemailer.createTransport({
                service: 'gmail',
                host: "smtp.gmail.com",
                port: 587,
                secure: false,
                auth: {
                   user: process.env.GMAIL_USERNAME,
                   pass: process.env.GMAIL_PASSWORD
                }
            });

            var mailOptions = {
                from: process.env.GMAIL_USERNAME,
                to: email,
                subject: 'Reset Password Link',
                text: `http://localhost:5173/resetPass/${user._id}/${token}`
            };

            transporter.sendMail(mailOptions, function (error, info) {
                if (error) {
                    console.log(error);
                    // If there's an error sending the email, send appropriate error response
                    return res.status(500).json({ error: "Failed to send reset password email" });
                } else {
                    // If email is sent successfully, send success response
                    return res.status(200).json({ Status: "Success" });
                }
            });
        })
        .catch(err => {
            console.error(err);
            // If there's an error in processing the request, send appropriate error response
            return res.status(500).json({ error: "Internal server error" });
        });
});

router.post('/resetPassword/:userId/:token', (req, res) => {
    const { userId, token } = req.params;
    const { newPassword } = req.body;

    // Verify token
    jwt.verify(token, "jwt-secret-key", (err, decoded) => {
        if (err) {
            return res.status(400).json({ error: "Invalid or expired token" });
        }

        // Check if the decoded user id matches the provided user id
        if (decoded.id !== userId) {
            return res.status(400).json({ error: "Invalid user id" });
        }

        // Hash the new password
        bcrypt.hash(newPassword, 10)
            .then(hash => {
                // Update user's password in the database
                UserModel.findByIdAndUpdate(userId, { Password: hash })
                    .then(() => {
                        res.json({ message: "Password reset successfully" });
                        
                    })
                    .catch(err => {
                        res.status(500).json({ error: err.message });
                    });
            })
            .catch(err => {
                res.status(500).json({ error: err.message });
            });
    });
});

router.get('/adminprofilemanagement/users', verifyUser, (req, res) => {
    UserModel.find()
        .then(users => {
            res.json(users);
        })
        .catch(err => {
            console.error(err);
            res.status(500).json({ error: "Internal server error" });
        });
});

router.delete('/adminprofilemanagement/users/:userId', verifyUser, (req, res) => {
    const { userId } = req.params;
    UserModel.findByIdAndDelete(userId)
        .then(() => {
            res.json({ message: "User deleted successfully" });
        })
        .catch(err => {
            console.error(err);
            res.status(500).json({ error: "Internal server error" });
        });
});

// Update user profile
router.put("/adminprofilemanagement/users/:userId", verifyUser, (req, res) => {
    const { userId } = req.params;
    const { Firstname, Lastname, email, role } = req.body;

    // Find the user by ID and update their information
    UserModel.findByIdAndUpdate(userId, { Firstname, Lastname, email, role }, { new: true })
        .then(updatedUser => {
            if (!updatedUser) {
                return res.status(404).json({ error: "User not found" });
            }
            res.json({ message: "User information updated successfully", user: updatedUser });
        })
        .catch(err => {
            console.error(err);
            res.status(500).json({ error: "Internal server error" });
        });
});

router.get('/userprofile', verifyUser, (req, res) => {
    const token = req.cookies.token;
    if (!token) {
        return res.status(401).json({ error: "Token not found" });
    }

    jwt.verify(token, "jwt-secret-key", (err, decoded) => {
        if (err) {
            return res.status(401).json({ error: "Invalid token" });
        }
        const userEmail = decoded.email;
        UserModel.findOne({ email: userEmail })
            .then(user => {
                if (user) {
                    // Include profile picture data in the response
                    const userData = {
                        Firstname: user.Firstname,
                        Lastname: user.Lastname,
                        email: user.email,
                        role: user.role,
                        profilePicture: user.profilePicture, // Include profile picture in the response
                        twoFactorAuth: user.twoFactorAuth // Include 2FA status in response
                    };
                    res.json(userData);
                } else {
                    res.status(404).json({ error: "User not found" });
                }
            })
            .catch(err => res.status(500).json({ error: err.message }));
    });
});

router.put("/userprofile", async (req, res) => {
    const { Firstname, Lastname, email, profilePicture } = req.body;
    const token = req.cookies.token;

    if (!token) {
        return res.status(401).json({ error: "Token not found" });
    }

    try {
        const decoded = jwt.verify(token, "jwt-secret-key");
        const userEmail = decoded.email;

        if (email !== userEmail) {
            const existingUser = await UserModel.findOne({ email });
            if (existingUser) {
                return res.status(400).json({ error: "Email already in use. Please use a different email address." });
            }
        }

        // Store the profile picture data in the database
        const user = await UserModel.findOneAndUpdate(
            { email: userEmail },
            { $set: { Firstname, Lastname, email, profilePicture } }, // Include profilePicture in the update
            { new: true }
        );

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        // Construct the user data to send back in the response
        const userData = {
            Firstname: user.Firstname,
            Lastname: user.Lastname,
            email: user.email,
            role: user.role,
            profilePicture: user.profilePicture // Include profile picture in the response
        };

        return res.json(userData);
    } catch (err) {
        return res.status(500).json({ error: "Internal server error" });
    }
});

// Toggle 2FA status
router.put("/userprofile/2fa", verifyUser, async (req, res) => {
    const token = req.cookies.token;
    if (!token) {
        return res.status(401).json({ error: "Token not found" });
    }

    try {
        const decoded = jwt.verify(token, "jwt-secret-key");
        const userEmail = decoded.email;

        // Find the user by email and update their 2FA status
        const user = await UserModel.findOne({ email: userEmail });
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        // If the user verifies the code, enable 2FA
        if (req.body.verified === true) {
            user.twoFactorAuth = true;
        } else {
            // If the user chooses not to verify, disable 2FA
            user.twoFactorAuth = false;
        }

        await user.save();

        return res.json({ message: "Two-factor authentication status updated successfully", twoFactorAuth: user.twoFactorAuth });
    } catch (err) {
        return res.status(500).json({ error: "Internal server error" });
    }
});


// Send verification code via email for 2FA
router.post("/userprofile/send-verification-code", verifyUser, async (req, res) => {
    const token = req.cookies.token;
    if (!token) {
        return res.status(401).json({ error: "Token not found" });
    }

    try {
        const decoded = jwt.verify(token, "jwt-secret-key");
        const userEmail = decoded.email;

        // Generate a random 4-digit verification code
        const verificationCode = Math.floor(1000 + Math.random() * 9000);

        // Store the verification code in the user model
        const user = await UserModel.findOneAndUpdate(
            { email: userEmail },
            { verificationCode: verificationCode },
            { new: true }
        );

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        // Send the verification code to the user's email
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            host: "smtp.gmail.com",
            port: 587,
            secure: false,
            auth: {
                user: process.env.GMAIL_USERNAME,
                pass: process.env.GMAIL_PASSWORD
            }
        });

        const mailOptions = {
            from: 'your-email@example.com',
            to: userEmail,
            subject: 'Verification Code for Two-Factor Authentication',
            text: `Your verification code is: ${verificationCode}`
        };

        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.log(error);
                return res.status(500).json({ error: "Failed to send verification code" });
            } else {
                return res.status(200).json({ message: "Verification code sent successfully" });
            }
        });
    } catch (err) {
        return res.status(500).json({ error: "Internal server error" });
    }
});

// Verify 2FA code
router.post("/userprofile/verify-2fa", verifyUser, async (req, res) => {
    const token = req.cookies.token;
    if (!token) {
        return res.status(401).json({ error: "Token not found" });
    }

    try {
        const decoded = jwt.verify(token, "jwt-secret-key");
        const userEmail = decoded.email;

        const { verificationCode } = req.body;

        // Retrieve the user by email
        const user = await UserModel.findOne({ email: userEmail });
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        // Check if the verification code matches
        if (verificationCode !== user.verificationCode) {
            return res.status(400).json({ success: false, error: "Invalid verification code" });
        }

        // Clear the verification code after successful verification
        user.verificationCode = null;
        await user.save();

        // Update twoFactorAuth status to true after successful verification
        user.twoFactorAuth = true;
        await user.save();

        return res.status(200).json({ success: true, message: "Verification successful" });
    } catch (err) {
        return res.status(500).json({ error: "Internal server error" });
    }
});


router.put("/userprofile/2fa", verifyUser, async (req, res) => {
    const token = req.cookies.token;
    if (!token) {
        return res.status(401).json({ error: "Token not found" });
    }

    try {
        const decoded = jwt.verify(token, "jwt-secret-key");
        const userEmail = decoded.email;

        // Find the user by email and update their 2FA status
        const user = await UserModel.findOne({ email: userEmail });
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        // If the user verifies the code, enable 2FA
        if (req.body.verified === true) {
            user.twoFactorAuth = true;
        } else {
            // If the user chooses not to verify, keep 2FA disabled
            // Alternatively, you may choose to remove the 'else' block to leave 2FA status unchanged.
            user.twoFactorAuth = false;
        }

        await user.save();

        return res.json({ message: "Two-factor authentication status updated successfully", twoFactorAuth: user.twoFactorAuth });
    } catch (err) {
        return res.status(500).json({ error: "Internal server error" });
    }
});

module.exports = router;
