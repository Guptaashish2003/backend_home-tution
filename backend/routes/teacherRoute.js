const express = require('express');
const router = express.Router()

//...............................middleware imports................................

const {verifyEmail} = require("../utils/emailVerification")
const { isAuth,authorizeRoles } = require('../middlewares/isAuth');
const {uploadSingleImage,uploadSinglePDF} = require( '../middlewares/imageUploader');
//...............................controller imports................................
// all user controller imports are here 
const {tesing,createTeacher,loginTeacher, logoutTeacher, forgotPassword, resetPassword, changePassword, updateTeacherProfile, getTeacherProfile, getAllTeachers, getSingleTeacherById, updateTeacherProfileById, deleteTeacherById,updateTeacherVerification, getAlladminTeachers,createTeacherByAdmin,resumeUpload} = require("../controllers/teacherController");


//...............................router imports................................
// testing route => api/v1/testing
router.route("/usertest").get(tesing)
//create user => api/v1/teacher/register
router.route("/teacher/register").post(createTeacher);
//login user => api/v1/teacher/login
router.route("/teacher/login").post(loginTeacher);
//logoutuser => api/v1/teacher/logout
router.route("/teacher/logout").get(logoutTeacher);
//forgot password +> /api/v1/teacher/forgotPassword
router.route("/teacher/forgotPassword").post(forgotPassword);
//reset password +> /api/v1/teacher/tesetPassword/:resetToken
router.route("/teacher/resetPassword/:resetToken").put(resetPassword);
//self change password => api/v1/teacher/me/changepassword
router.route("/teacher/me/changepassword").put(isAuth("Teacher"),changePassword);
//self update profile => api/v1/teacher/me/update
router.route("/teacher/me/update").put(isAuth("Teacher"),uploadSingleImage("avatar"),updateTeacherProfile);
router.route("/teacher/me/avatar").put(isAuth("Teacher"),uploadSingleImage("avatar"),updateTeacherProfile);
router.route("/teacher/me/resume").put(isAuth("Teacher"),uploadSinglePDF("resume"),resumeUpload);
//get self details => api/v1/teacher/me 
router.route("/teacher/me").get(isAuth("Teacher"),getTeacherProfile);

//get single teacher => api/v1/teacher/:id
router.route("/teacher/:id").get(isAuth("Student"),getSingleTeacherById);
  // verify email +> /api/v1/verify/email/:VerificationToken
  router.route("/teacher/verify/email/:verificationToken").get(verifyEmail("Teacher"));



//get all teachers => api/v1/admin/teachers
router.route("/teachers").get(getAllTeachers);
//..........................................admin routes ......................

// create teacher => api/v1/admin/teacher/create
router.route("/admin/teacher/create").post(isAuth("Student"),authorizeRoles("admin"),createTeacherByAdmin);

//get all teachers => api/v1/admin/teachers
router.route("/admin/teachers").get(isAuth("Student"),authorizeRoles("admin"),getAlladminTeachers);

//update and delete teacher => api/v1/admin/teacher/:id
router.route("/admin/teacher/:id").put(isAuth("Student"),authorizeRoles("admin"),updateTeacherProfileById)
                                .delete(isAuth("Student"),authorizeRoles("admin"),deleteTeacherById);

// some admin feature 
// update teacher verification profile => api/v1/admin/teacher/verify/:id
 router.route("/admin/teacher/verify/:id").put(isAuth("Student"),authorizeRoles("admin"),updateTeacherVerification);

//...............................router exports................................




module.exports = router;