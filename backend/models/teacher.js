const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const teacherSchema = mongoose.Schema({
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
    role:{type: String,enum: ["teacher"],
    default: "teacher" },
    avatar:{type: String},
    phone: {
        type: String,
        maxlength: [15, "Please enter a valid phone number"]
    },
    gender: {
        type: String,
        enum: ["male", "female", "other"]
    },
    address: {
        type: String,
    },
    street:{
        type: String,
    },
    city: {
        type: String,
    },
    state:{type: String},
    pinCode: {
        type: String,
    },
    country: {
        type: String,
    },
    qualification: {
        type: String,
    },
    about:{
        type: String,
    },
    teacherCategory: { type: String },
    experience: { type: String },
    subject: [{ type: String }],
    school: [{ type: String }],
    college: [{ type: String }],
    hobbies: [{ type: String }],
    languages: [{ type: String }],
    charge: {
        type: Number
    },
    resume:{
        type:String
    },
    isVerified: { type: Boolean, default: false },
    ratings: {
        type: Number,
        default: 0
    },
    numoffeedback: {
        type: Number,
        default: 0
    },
    feedbacks: [{
        student: {
            type: mongoose.Schema.ObjectId,
            ref: "Student",
            required: true
        },
        name: { type: String, required: true },
        rating: { type: String, required: true },
        comment: { type: String, required: true }
    }],
    isEmailValid:{type: Boolean, default: false},
    emailVerificationToken: String,
    emailVerificationExpires: Date,
    createdAt: {
        type: Date,
        default: Date.now
    },
    resetPasswordToken: String,
    resetPasswordExpires: Date


})

// encrpting password before saveing user schema 
teacherSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();

    this.password = await bcrypt.hash(this.password, 10)

})
// match password 

teacherSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password)
}

// return jwt token 

teacherSchema.methods.getSignedJwtToken = function () {
    return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN
    })
}

// genrating password reset token

teacherSchema.methods.getResetPasswordToken = function () {
    const resetToken = crypto.randomBytes(20).toString("hex");

    this.resetPasswordToken = crypto
        .createHash("sha256")
        .update(resetToken)
        .digest("hex");

    this.resetPasswordExpires = Date.now() + 10 * 60 * 1000;

    return resetToken;
}
// genrating email verification token

teacherSchema.methods.getEmailVerificationToken = function () {
    const emailToken = crypto.randomBytes(20).toString("hex");

    this.emailVerificationToken = crypto
        .createHash("sha256")
        .update(emailToken)
        .digest("hex");

    this.emailVerificationExpires = Date.now() + 10 * 60 * 1000;

    return emailToken;
}

module.exports = mongoose.model("Teacher", teacherSchema)