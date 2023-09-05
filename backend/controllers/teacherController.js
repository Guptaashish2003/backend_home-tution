const Teacher = require("../models/teacher");
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

// create a new teacher => /api/v1/register/teacher
const createTeacher = asyncErrorHandler(async (req, res, next) => {
  const { name, email, password, gender } = req.body;
  const isExist = await Teacher.findOne({ email })
  if (!isExist) {
    const teacher = await Teacher.create({
      name, email, password, gender,
    });
    sendVerificationToken(teacher, req, res, next);
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

// login teacher => api/v1/login/teacher
const loginTeacher = asyncErrorHandler(async (req, res, next) => {
  const { email, password } = req.body;
  // check if email and password enter or not
  if (!email || !password) {

    return next(new CustomError("Please provide email and password", 400));
  }
  // find teacher by email
  const teacher = await Teacher.findOne({ email }).select("+password");
  if (!teacher) {
    return next(new CustomError("Invalid email or password", 401));
  }
  // check if password match
  const isMatch = await teacher.matchPassword(password);
  if (!isMatch) {
    return next(new CustomError("Invalid email or password", 401));
  }
  if (!teacher.isEmailValid) {
    return next(new CustomError("email is not verified", 401));
  }
  // sending token and save in the cookie 
  sendToken(teacher, 200, res)
});

// logout Teacher  => api/v1/logout

const logoutTeacher = asyncErrorHandler(async (req, res, next) => {
  res.clearCookie("token");
  res.status(200).json({
    success: true,
    message: "Logged out successfully"
  });
});
// .....................................forgot and reset password section ........
//forgot password +> /api/v1/teacher/forgotPassword

const forgotPassword = asyncErrorHandler(async (req, res, next) => {
  const { email } = req.body;
  if (!email) {
    return next(new CustomError("Please provide email", 400));
  }
  const teacher = await Teacher.findOne({ email });
  if (!teacher) {
    return next(new CustomError("Invalid email", 401));
  }

  const resetToken = teacher.getResetPasswordToken();
  await teacher.save({ validateBeforeSave: false });

  const resetUrl = `${process.env.BASE_URL}/teacher/resetPassword/${resetToken}`;
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
      email: teacher.email,
      subject: "Password reset token",
      EmailHtml
    });
    res.status(200).json({
      success: true,
      message: "Email sent"
    });

  } catch (error) {
    teacher.resetPasswordToken = undefined;
    teacher.resetPasswordExpire = undefined;
    await teacher.save({ validateBeforeSave: false });
    return next(new CustomError("Email could not be sent", 500));
  }

})

//reset password +> /api/v1/teacher/resetPassword/:resetToken

const resetPassword = asyncErrorHandler(async (req, res, next) => {
  const resetPasswordToken = crypto.createHash('sha256').update(req.params.resetToken).digest('hex');
  const { newPassword, confirmPassword } = req.body;
  const teacher = await Teacher.findOne({
    resetPasswordToken,
    resetPasswordExpires: { $gt: Date.now() }
  });
  if (!teacher) {
    return next(new CustomError("Invalid token", 401));
  }
  if (newPassword !== confirmPassword) {
    return next(new CustomError("Password and confirm not match", 401));
  }
  teacher.password = newPassword;
  teacher.resetPasswordToken = undefined;
  teacher.resetPasswordExpires = undefined;
  await teacher.save();
  sendToken(teacher, 200, res)
});
// .............................work of self profile...................................

// change password => api/v1/teacher/me/changePassword

const changePassword = asyncErrorHandler(async (req, res, next) => {
  const teacher = await Teacher.findById(req.user.id).select("+password");
  if (!teacher) {
    return next(new CustomError("User not found", 401));
  }
  const isMatch = await teacher.matchPassword(req.body.currentPassword);
  if (!isMatch) {
    return next(new CustomError("Current password is incorrect", 401));
  }
  teacher.password = req.body.newPassword;
  await teacher.save();
  res.status(200).json({
    success: true,
    message: "Password changed successfully",
  });
});

//update teacher profile => api/v1/teacher/me/update
const updateTeacherProfile = asyncErrorHandler(async (req, res, next) => {
  const updaterDetails = {
    email: req.body.email,
    name: req.body.name,
    avatar: req?.file?.location,
    phone: req.body.phone,
    gender: req.body.gender,
    address: req.body.address,
    city: req.body.city,
    pinCode: req.body.pinCode,
    country: req.body.country,
    state: req.body.state,
    teacherCategory: req.body.teacherCategory,
    school: req.body.school,
    college: req.body.college,
    subject: req.body.subject,
    hobbies: req.body.hobbies,
    languages: req.body.languages,
    charge: req.body.charge,
    experience: req.body.experience,
    qualification: req.body.qualification,
    street: req.body.street,
    about: req.body.about,

  }
  const teacher = await Teacher.findByIdAndUpdate(req.user.id, updaterDetails, { new: true });
  res.status(200).json({
    success: true,
    message: "updated successfully",
    data: teacher
  });

});


//get login user information => api/v1/teacher/me 

const resumeUpload = asyncErrorHandler(async (req, res, next) => {
  console.log(req.file.location)
  const teacher = await Teacher.findByIdAndUpdate(req.user.id, { resume: req.file.location }, { new: true });
  res.status(200).json({
    success: true,
    data: teacher,
    message: "resume uploaded successfully"
  });
});
//get login user information => api/v1/teacher/me 

const getTeacherProfile = asyncErrorHandler(async (req, res, next) => {
  const teacher = await Teacher.findById(req.user.id);
  res.status(200).json({
    success: true,
    data: teacher
  });
});


//get all teacher => api/v1/teachers

const getAllTeachers = asyncErrorHandler(async (req, res, next) => {
  const apiFeatures = new Apifeatures(Teacher.find(), req.query)
    .paginate()
    .search()
    .filter()
    .sort()
    .limitFields()
  const teachers = await apiFeatures.query;
  const totalPages = await Teacher.countDocuments() / req.query.limit || 10;
  const docCount = await Teacher.countDocuments();
  res.status(200).json({
    success: true,
    count: teachers.length,
    data: teachers,
    totalPages: totalPages,
    docCount: docCount
  });
});

//..........................................admin routes ......................
//get create teacher => api/v1/admin/teachers/create

const createTeacherByAdmin = asyncErrorHandler(async (req, res, next) => {
  const { name, email, password, pinCode, gender } = req.body;
  const teacher = await Teacher.create({
    name, email, password, pinCode, gender

  });
  res.status(200).json({
    success: true,
    message: "user created successfully",
    data: teacher,

  });
});

//get all teacher => api/v1/admin/teachers

const getAlladminTeachers = asyncErrorHandler(async (req, res, next) => {
  const apiFeatures = new Apifeatures(Teacher.find(), req.query)
    // .paginate()
    .search()
    .filter()
    .sort()
    .limitFields()
  const teachers = await apiFeatures.query;
  const totalPages = await Teacher.countDocuments() / req.query.limit || 10;
  const docCount = await Teacher.countDocuments();
  res.status(200).json({
    success: true,
    count: teachers.length,
    data: teachers,
    totalPages: totalPages,
    docCount: docCount
  });
});

//get single Teacher => api/v1/admin/teacher/:id

const getSingleTeacherById = asyncErrorHandler(async (req, res, next) => {
  const teacher = await Teacher.findById(req.params.id);
  if (!teacher) {
    return next(new CustomError("Teacher not found", 401));
  }
  res.status(200).json({
    success: true,
    data: teacher
  });
});

//update profile teacher by id => api/v1/admin/teacher/:id

const updateTeacherProfileById = asyncErrorHandler(async (req, res, next) => {
  const updaterDetails = {
    email: req.body.email,
    name: req.body.name,
  }
  const teacher = await Teacher.findByIdAndUpdate(req.params.id, updaterDetails, { new: true });
  if (!teacher) {
    return next(new CustomError("User not found", 401));
  }
  res.status(200).json({
    success: true,
    message: "updated successfully",
    data: teacher
  });
});

//delete teacher by id => api/v1/admin/Teacher/:id

const deleteTeacherById = asyncErrorHandler(async (req, res, next) => {
  const teacher = await Teacher.findByIdAndRemove(req.params.id);
  if (!teacher) {
    return next(new CustomError("User not found", 401));
  }
  res.status(200).json({
    success: true,
    message: "deleted successfully",
    data: teacher
  });
});


// some admin feature 
// update teacher verification profile => api/v1/admin/teacher/verify/:id

const updateTeacherVerification = asyncErrorHandler(async (req, res, next) => {
  const teacher = await Teacher.findById(req.params.id);
  if (!teacher) {
    return next(new CustomError("User not found", 401));
  }
  teacher.isVerified = req.body.isVerified;
  let message;
  if (req.body.isVerified) {
    message = "verified successfully"
  } else {
    message = "unverified successfully"

  }
  await teacher.save();
  res.status(200).json({
    success: true,
    message: message,
    data: teacher
  });
});





module.exports = { tesing, createTeacher, loginTeacher, logoutTeacher, resetPassword, forgotPassword, changePassword, updateTeacherProfile, getTeacherProfile, getAllTeachers, getSingleTeacherById, updateTeacherProfileById, deleteTeacherById, updateTeacherVerification, getAlladminTeachers, createTeacherByAdmin, resumeUpload };