const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    Firstname: String,
    Lastname: String,
    email: String,
    Password: String,
    role: {
        type: String,
        enum: ["visitor", "admin", "lecture"], 
        default: "visitor"
    },
    profilePicture: String,
    twoFactorAuth: {
        type: Boolean,
        default: false // Assuming 2FA is disabled by default
    },
    verificationCode: String // Field to store the verification code
});

const UserModel = mongoose.model("User", UserSchema);
module.exports = UserModel;
