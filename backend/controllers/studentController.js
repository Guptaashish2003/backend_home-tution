const Student = require("../models/studentDetails");
const sendToken = require("../utils/jwtToken");
const CustomError = require("../utils/CustomError");
const asyncErrorHandler = require("../utils/asyncErrorHandler");
const sendEmail = require("../utils/sendEmail");
const crypto = require("crypto");
const Apifeatures = require("../utils/ApiFeatures");
const { sendVerificationToken } = require("../utils/emailVerification");

//testing
const tesing = (req, res, next) => {
  res.status(200).json({
    success: true,
    test: "Worker"
  });
}

// create a new student => /api/v1/student/register
const createStudent = asyncErrorHandler(async (req, res, next) => {
  const { name, email, password, gender } = req.body;
  const isExist = await Student.findOne({ email })
  if (!isExist) {
    const student = await Student.create({
      name, email, password, gender
    });
    sendVerificationToken(student, req, res, next);
  }
  else {
    if (!isExist.isEmailValid) {
      sendVerificationToken(isExist, req, res, next);
    }
    else {

      res.status(200).json({
        success: true,
        message: "user already exists"
      });
    }

  }
});



// login student => api/v1/student/login
const loginStudent = asyncErrorHandler(async (req, res, next) => {
  const { email, password } = req.body;
  // check if email and password enter or not
  if (!email || !password) {

    return next(new CustomError("Please provide email and password", 400));
  }
  // find student by email
  const student = await Student.findOne({ email }).select("+password");
  if (!student) {
    return next(new CustomError("Invalid email or password", 401));
  }
  // check if password match
  const isMatch = await student.matchPassword(password);
  if (!isMatch) {
    return next(new CustomError("Invalid email or password", 401));
  }
  if (!student.isEmailValid) {
    return next(new CustomError("email is not verified", 401));
  }
  // sending token and save in the cookie 
  sendToken(student, 200, res)
});

// logout Student  => api/v1/student/logout

const logoutStudent = asyncErrorHandler(async (req, res, next) => {
  res.clearCookie("token");
  res.status(200).json({
    success: true,
    message: "Logged out successfully"
  });
});
// .....................................forgot and reset password section ........
//forgot password +> /api/v1/student/forgotPassword

const forgotPassword = asyncErrorHandler(async (req, res, next) => {
  const { email } = req.body;
  if (!email) {
    return next(new CustomError("Please provide email", 400));
  }
  const student = await Student.findOne({ email });
  if (!student) {
    return next(new CustomError("Invalid email", 401));
  }

  const resetToken = student.getResetPasswordToken();
  await student.save({ validateBeforeSave: false });

  const resetUrl = `${process.env.BASE_URL}/student/resetPassword/${resetToken}`;
  const EmailHtml = `<html lang="en">
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Document</title>
    
      <style> 
      @import url('https://fonts.googleapis.com/css2?family=Roboto+Condensed:wght@400;700&display=swap');
      .Main-reset-container{
          justify-content:center;
          flex-direction: column;
          align-items: center;
          margin: 0px auto;
          padding: 0px;
          font-family: 'Roboto Condensed', sans-serif;
      
      }
      .Main-reset-container h1{
          font-family: 'Roboto Condensed', sans-serif;
          text-transform: uppercase;
          font-weight: bold;
          font-size: 55px;
      }
      .Main-reset-container h1 span{
          color: #f0c512;
      }
      .reset-container h3{
          font-family: 'Roboto Condensed', sans-serif;
      }
      .reset-logo img{
          width: 100%;
          height: 100%;
      }
      .reset-logo{
          width: 250px;
          height: 150px;
      }
      .reset-btn  button{
          color: white;
          background-color: #333;
          width: 150px;
          height: 45px;
          cursor: pointer;
      }
      
      </style>
  </head>
  <body>
      <div class="Main-reset-container">
      <h1><span>Study</span>Spot</h1>
      <div class="reset-container">
       <h3>Change your password for Studyspot</h3><br>
      <p> Click below to change your password.</p>
      <p>If you didn’t ask to change your password, you can ignore this emai</p>
      <p>Thanks,</p>
      <p> Studyspot</p>   
      
  </div>
  <div class="reset-btn" >
      <a href=${resetUrl}><button>Reset password</button></a>
      <p>We're happy to help!</p>
  </div>
  </body>
  </html>
    `;
  try {
    await sendEmail({
      email: student.email,
      subject: "Password reset token",
      EmailHtml

    });
    res.status(200).json({
      success: true,
      message: "Email sent"
    });

  } catch (error) {
    student.resetPasswordToken = undefined;
    student.resetPasswordExpires = undefined;
    await student.save({ validateBeforeSave: false });
    return next(new CustomError("Email could not be sent", 500));
  }

})

//reset password +> /api/v1/student/resetPassword/:resetToken

const resetPassword = asyncErrorHandler(async (req, res, next) => {
  const resetPasswordToken = crypto.createHash('sha256').update(req.params.resetToken).digest('hex');
  const { newPassword, confirmPassword } = req.body;
  const student = await Student.findOne({
    resetPasswordToken,
    resetPasswordExpires: { $gt: Date.now() }
  });
  if (!student) {
    return next(new CustomError("Invalid token", 401));
  }
  if (newPassword !== confirmPassword) {
    return next(new CustomError("Password and confirm not match", 401));
  }
  student.password = newPassword;
  student.resetPasswordToken = undefined;
  student.resetPasswordExpires = undefined;
  await student.save();
  sendToken(student, 200, res)
});
// .............................work of self profile...................................

// change password => api/v1/student/me/changePassword

const changePassword = asyncErrorHandler(async (req, res, next) => {
  const student = await Student.findById(req.user.id).select("+password");
  if (!student) {
    return next(new CustomError("User not found", 401));
  }
  const isMatch = await student.matchPassword(req.body.currentPassword);
  if (!isMatch) {
    return next(new CustomError("Current password is incorrect", 401));
  }
  student.password = req.body.newPassword;
  await student.save();
  res.status(200).json({
    success: true,
    message: "Password changed successfully",
  });
});

//update student profile => api/v1/student/me/update
const updateStudentProfile = asyncErrorHandler(async (req, res, next) => {

  const updaterDetails = {
    name: req.body.name,
    avatar: req?.file?.location,
    phone: req.body.phone,
    gender: req.body.gender,
    address: req.body.address,
    city: req.body.city,
    pinCode: req.body.pinCode,
    country: req.body.country,
    state: req.body.state,
    school: req.body.school,
    college: req.body.college,
    hobbies: req.body.hobbies,
    languages: req.body.languages,
    studentCategory: req.body.studentCategory,
    street: req.body.street,
    budget: req.body.budget

  }
  const student = await Student.findByIdAndUpdate(req.user.id, updaterDetails, { new: true });
  res.status(200).json({
    success: true,
    message: "updated successfully",
    data: student
  });

});

//get login user information => api/v1/student/me 

const getStudentProfile = asyncErrorHandler(async (req, res, next) => {
  const student = await Student.findById(req.user.id);
  res.status(200).json({
    success: true,
    data: student
  });
});

//..........................................admin routes ......................
//get create student => api/v1/admin/student/create

const createStudentByAdmin = asyncErrorHandler(async (req, res, next) => {
  const { name, email, password, pinCode, gender } = req.body;
  const student = await Student.create({
    name, email, password, pinCode, gender

  });
  res.status(200).json({
    success: true,
    message: "user created successfully",
    data: student,

  });
});

//get all student => api/v1/admin/students

const getAllStudents = asyncErrorHandler(async (req, res, next) => {
  const apiFeatures = new Apifeatures(Student.find(), req.query)
    // .paginate()
    .sort()
    .search()
    .filter()
    .limitFields()
  const students = await apiFeatures.query;
  const totalPages = await Student.countDocuments() / req.query.limit || 10;
  const docCount = await Student.countDocuments();
  res.status(200).json({
    success: true,
    count: students.length,
    data: students,
    totalPages: totalPages,
    docCount: docCount
  });
});

//get single Student => api/v1/admin/student/:id

const getSingleStudentById = asyncErrorHandler(async (req, res, next) => {
  const student = await Student.findById(req.params.id);
  if (!student) {
    return next(new CustomError("User not found", 401));
  }
  res.status(200).json({
    success: true,
    data: student
  });
});

//update profile student by id => api/v1/admin/student/:id

const updateStudentProfileById = asyncErrorHandler(async (req, res, next) => {
  const updaterDetails = {
    studentCategory: req.body.studentCategory,
    bookingStatus: req.body.bookingStatus,
    phone: req.body.phone,
    street: req.body.street,
    budget: req.body.budget


  }
  const student = await Student.findByIdAndUpdate(req.params.id, updaterDetails, { new: true });
  res.status(200).json({
    success: true,
    message: "updated successfully",
    data: student
  });
});

//delete student by id => api/v1/admin/Student/:id

const deleteStudentById = asyncErrorHandler(async (req, res, next) => {
  const student = await Student.findByIdAndRemove(req.params.id);
  if (!student) {
    return next(new CustomError("User not found", 401));
  }
  res.status(200).json({
    success: true,
    message: "deleted successfully",
    data: student
  });
});





module.exports = { tesing, createStudent, loginStudent, logoutStudent, resetPassword, forgotPassword, changePassword, updateStudentProfile, getStudentProfile, getAllStudents, getSingleStudentById, updateStudentProfileById, deleteStudentById, createStudentByAdmin };