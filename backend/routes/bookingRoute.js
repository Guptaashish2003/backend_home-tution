const express = require('express');
const Router = express.Router();

//...............................meddleeware imports................................
const { isAuth, authorizeRoles } = require('../middlewares/isAuth');

//...............................controller imports................................
// all user controller imports are here 
const { createBooking, getSingleBooking, getSingleBookingStudentById,getSingleBookingTeacherById, getAllBookings, updateBookingById, deleteBookingById, updateBookingStatusById, bookDemoClass,contactUs,bookByAdmin,dashboard } = require('../controllers/bookingController');

//........................................coupon cantroller.................................
const {getCoupon,createCoupon,getAllCoupon,deletetCoupon} = require("../controllers/couponController")

// create a new booking => api/v1/booking/new
Router.route("/booking/new").post(isAuth("Student"),createBooking)
// get login user booking => api/v1/teacher/booiing/me 
Router.route("/teacher/booking/me").get(isAuth("Teacher"),getSingleBooking)
// get login user booking => api/v1/booiing/me 
Router.route("/student/booking/me").get(isAuth("Student"),getSingleBooking)
// get user by id => api/v1/booking/:id
Router.route("/student/booking/:id").get(isAuth("Student"),getSingleBookingStudentById)  
Router.route("/teacher/booking/:id").get(isAuth("Teacher"),getSingleBookingTeacherById)  

// feature routes 
// book demo class  => api/v1/booking/demo
Router.route("/booking/demo").post(isAuth("Student"),bookDemoClass)
  // update booking status by id => api/v1/booking/:id
Router.route("/booking/:id").put(isAuth("Teacher"),updateBookingStatusById)


//...............................admin routes................................
// get all bookings => api/v1/admin/allotTeachers
Router.route("/admin/allotTeacher").post(isAuth("Student"),authorizeRoles("admin"),bookByAdmin)
// get all bookings => api/v1/admin/bookings
Router.route("/admin/bookings").get(isAuth("Student"),authorizeRoles("admin"),getAllBookings)
// update and delete bookings => api/v1/admin/booking/:id
Router.route("/admin/booking/:id").put(isAuth("Student"),authorizeRoles("admin"),updateBookingById)
.delete(isAuth("Student"),authorizeRoles("admin"),deleteBookingById);


// ............... contact us ................................................................

  // update booking status by id => api/v1/contactus
Router.route("/contactus").post(contactUs)
// ............................. coupon code ................................................
// creat coupon api/v1/coupons
Router.route("/coupon/:code").get(isAuth("Student"),getCoupon)
// creat coupon api/v1/coupons
Router.route("/admin/coupon").post(isAuth("Student"),authorizeRoles("admin"),createCoupon).get(isAuth("Student"),authorizeRoles("admin"),getAllCoupon)
// creat coupon api/v1/coupons
Router.route("/admin/coupon/:id").delete(isAuth("Student"),authorizeRoles("admin"),deletetCoupon)

Router.route("/dashboard").get(isAuth("Student"),authorizeRoles("admin"),dashboard)

module.exports = Router;