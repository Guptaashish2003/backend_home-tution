const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const studentSchma = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "please enter your name"],
        maxlength: [255, "Please enter a valid name"]
    },
    email: {
        type: String,
        required: [true, "please enter your email"],
        unique: true,
        validate: [validator.isEmail, "please enter a valid email"]
    },
    password: {
        type: String,
        required: [true, "please enter your password"],
        minlength: [6, "Password must be atleast 6 characters long"],
        select: false,
    },
    avatar:{type: String},
    phone: {
        type: String,
        maxlength: [15, "Please enter a valid phone number"]
    },
    gender: {
        type: String,
        enum: ["male", "female", "other"]
    },
    studentCategory: {
        type: String,
        enum: ["student", "parent"]
    },
    budget:{type: String},
    address: {
        type: String,
    },
    street: {type: String,},
    
    city: {type: String},
    
    state:{type: String},

    pinCode: {type: String},

    country: {type: String},

    school: [{ type: String }],

    college: [{ type: String }],

    hobbies: [{ type: String }],
    
    languages: [{ type: String }],

    role: {
        type: String,
        enum: ["student", "admin"],
        default: "student"
    },
    bookingStatus:{type: String,default: "NULL"},
    isEmailValid:{type: Boolean, default: false},
    emailVerificationToken: String,
    emailVerificationExpires: Date,
    createdAt: {
        type: Date,
        default: Date.now
    },
    resetPasswordToken: String,
    resetPasswordExpires: Date
});

// encrpting password before saveing user schema 
studentSchma.pre("save", async function (next) {
    if (!this.isModified("password")) return next();

    this.password = await bcrypt.hash(this.password, 10)

})
// match password 

studentSchma.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password)
}

// return jwt token 

studentSchma.methods.getSignedJwtToken = function () {
    return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN
    })
}

// genrating password reset token

studentSchma.methods.getResetPasswordToken = function () {
    const resetToken = crypto.randomBytes(20).toString("hex");

    this.resetPasswordToken = crypto
        .createHash("sha256")
        .update(resetToken)
        .digest("hex");

    this.resetPasswordExpires = Date.now() + 10 * 60 * 1000;

    return resetToken;
}

// genrating email verification token

studentSchma.methods.getEmailVerificationToken = function () {
    const emailToken = crypto.randomBytes(20).toString("hex");

    this.emailVerificationToken = crypto
        .createHash("sha256")
        .update(emailToken)
        .digest("hex");

    this.emailVerificationExpires = Date.now() + 10 * 60 * 1000;
    return emailToken;
}



module.exports = mongoose.model("Student", studentSchma);