const express = require('express');
const router = express.Router()

//...............................middleware imports................................
const {authorizeRoles,isAuth} = require('../middlewares/isAuth');
const {uploadSingleImage} = require( '../middlewares/imageUploader');
//...............................controller imports................................
// all user controller imports are here 
const {tesing,createStudent,loginStudent, logoutStudent, forgotPassword, resetPassword, changePassword, updateStudentProfile, getStudentProfile, getAllStudents, getSingleStudentById, updateStudentProfileById, deleteStudentById,createStudentByAdmin} = require("../controllers/studentController");

const {verifyEmail} = require("../utils/emailVerification");
const {initiatePayment,sucess,cancel,failure }= require('../controllers/Transaction');

//...............................router imports................................
// testing route => api/v1/testing
router.route("/usertest").get(tesing)
//create user => api/v1/student/register
router.route("/student/register").post(createStudent);
//login user => api/v1/student/login
router.route("/student/login").post(loginStudent);
//logoutuser => api/v1/student/logout
router.route("/student/logout").get(logoutStudent);
//forgot password +> /api/v1/student/forgotPassword
router.route("/student/forgotPassword").post(forgotPassword);
//forgot password +> /api/v1/student/forgotPassword
router.route("/student/resetPassword/:resetToken").put(resetPassword);
//change password user => api/v1/student/me/changepassword 
router.route("/student/me/changepassword").put(isAuth("Student"),changePassword);
//update profile user => api/v1/student/me/update
router.route("/student/me/update").put(isAuth("Student"),uploadSingleImage("avatar"),updateStudentProfile);

//imgage uploading profile
router.route("/student/me/avatar").put(isAuth("Student"),uploadSingleImage("avatar"),updateStudentProfile);

//get user details => api/v1/student/me 
router.route("/student/me").get(isAuth("Student"),getStudentProfile);

  // verify email +> /api/v1/verify/email/:VerificationToken
  router.route("/student/verify/email/:verificationToken").get(verifyEmail("Student"));
  // transaction +> /api/v1/pay
  router.route("/pay").post(isAuth("Student"),initiatePayment);
  router.route("/sucess/:bookingId").post(sucess);
  router.route("/failure/:bookingId").post(failure);
  router.route("/cancel/:bookingId").post(cancel);

//..........................................admin routes ......................

// create student => api/v1/admin/student/create
router.route("/admin/student/create").post(isAuth("Student"),authorizeRoles("admin"),createStudentByAdmin);
//get all student => api/v1/admin/students
router.route("/admin/students").get(isAuth("Student"),authorizeRoles("admin"),getAllStudents);
//get singlestudent => api/v1/admin/student/:id
router.route("/admin/student/:id").get(isAuth("Student"),authorizeRoles("admin"),getSingleStudentById);
//update and deletestudent => api/v1/admin/student/:id
router.route("/admin/student/:id").put(isAuth("Student"),authorizeRoles("admin"),updateStudentProfileById)
                                .delete(isAuth("Student"),authorizeRoles("admin"),deleteStudentById);



//...............................router exports................................




module.exports = router;