const Booking = require("../models/booking");
const Teacher = require("../models/teacher");
const Student = require("../models/studentDetails");

const CustomError = require("../utils/CustomError");
const asyncErrorHandler = require("../utils/asyncErrorHandler");
const sendEmail = require("../utils/sendEmail");

// create a new booking with demo => api/v1/booking/new
const createBooking = asyncErrorHandler(async (req, res, next) => {
  const {teacherId,studyMode,locationUrl,studyTerm,specialization ,studyHours,totalPrice } = req.body;

  const booking = await Booking.create({isDemo:true,
                            studyMode,locationUrl,
                            studyTerm,
                            specialization
                             ,studyHours,
                             totalPrice,
                            paidAt: Date.now(),
                            student:req.user._id,
                            teacher:teacherId,
                                 });

  res.status(201).json({
    success:true,
    booking,
  });
});


// get login student details => api/v1/booking/me

const getSingleBooking = asyncErrorHandler(async (req, res, next) => {
  let pending,completed;
  if(req.user.role === 'teacher'){
    pending = await Booking.find({teacher:req.user._id,isApproved:true,bookingStatus:"Pending"});
    completed = await Booking.find({teacher:req.user._id,isApproved:true,bookingStatus:"completed"});
  }else {
    pending = await Booking.find({student:req.user._id,bookingStatus:"Pending"});
    completed = await Booking.find({student:req.user._id,isApproved:true,bookingStatus:"completed"});
   

  }
 let message = "booking found"
  if(!pending && !completed) {
    message = "booking not found"
  }

    res.status(200).json({
      success:true,
      pending,
      completed,
      message
  });
});
// get booking by id => api/v1/teacher/booking/:id

const getSingleBookingTeacherById = asyncErrorHandler(async (req, res, next) => {
  const booking = await Booking.findById(req.params.id).sort('-createdAt').populate("student").populate("teacher").populate("transaction");
  if(!booking){
    return next(new CustomError("Booking not found", 404));}
    res.status(200).json({
      success:true,
      data:booking,
    });
  });
// get booking by id => api/v1/student/booking/:id

const getSingleBookingStudentById = asyncErrorHandler(async (req, res, next) => {
  const booking = await Booking.findById(req.params.id).sort('-createdAt').populate("student").populate("teacher").populate("transaction");
  if(!booking){
    return next(new CustomError("Booking not found", 404));}
    res.status(200).json({
      success:true,
      data:booking,
    });
  });

  // teacher features ....................................
  // demo class 
   // check demo class  => api/v1/booking/demo
const bookDemoClass = asyncErrorHandler(async (req, res, next) => {
  const booking = await Booking.find({teacher:req.body.teacherId,student:req.user._id});
  const isDemo = booking.map(booking => booking.isDemo===true);

  if(isDemo.includes((true))){
    res.status(200).json({
      success: true,
      message:"demo is already used",
      demo: false
    });
  }
  else{
    res.status(200).json({
      success: true,
      message:"demo is available",
      demo: true
    });
  }

});
  // update booking status by id => api/v1/booking/:id
  const updateBookingStatusById = asyncErrorHandler(async (req, res, next) => {

    const booking = await Booking.findByIdAndUpdate(req.params.id, {bookingStatus:req.body.bookingStatus}, {new:true});
    if(!booking){
      return next(new CustomError("Booking not found", 404));} 
    res.status(200).json({
      success:true,
      booking,
    });
  });

  //..................................admin controllers  ..............................
    // get all bookings => api/v1/admin/allotTeahers
  const bookByAdmin = asyncErrorHandler(async (req, res, next) => {
    const { studyMode,studyTerm,locationUrl,studyHours,totalPrice,specialization,paymentMode } = req.body;
    const booking = await Booking.create({teacher:req.body.teacherId,student:req.body.studentId,studyMode,studyTerm,locationUrl,studyHours,totalPrice,specialization,paymentMode });
      res.status(200).json({
        success: true,
        booking,

      });

  
  });
  // get all bookings => api/v1/admin/bookings
  
  const getAllBookings = asyncErrorHandler(async (req, res, next) => {
    const bookings = await Booking.find().sort('-createdAt').populate("student","name street").populate("teacher","name");
    let totalAmount = 0;
    bookings.forEach(booking => {
      totalAmount += booking.totalPrice;
    });
    res.status(200).json({
      success:true,
      totalAmount:totalAmount,
      bookings,
    });
  });

  // update booking by id => api/v1/admin/booking/:id
  const updateBookingById = asyncErrorHandler(async (req, res, next) => {
    const booking = await Booking.findByIdAndUpdate(req.params.id);
    if(!booking){
      return next(new CustomError("Booking not found", 404));}
    if(booking.isApproved === true){
      res.status(200).json({
        success:true,
        booking,
        message:"already approved"
      });}

    booking.isApproved = req.body.isApproved;
    await booking.save();
    res.status(200).json({
      success:true,
      booking,
      message:"approved"
    });
  });


  
  // delete booking by id => api/v1/admin/booking/:id
  const deleteBookingById = asyncErrorHandler(async (req, res, next) => {
    const booking = await Booking.findByIdAndDelete(req.params.id);
    if(!booking){
      return next(new CustomError("Booking not found", 404));}
    res.status(200).json({
      success:true,
      booking,
    });
  });
  

  
  
  // contact us 
  const contactUs = asyncErrorHandler(async (req, res, next) => {
    const {name, email, message} = req.body;
      await sendEmail({
        email: process.env.TZ_EMAIL,
        subject: "contact us ",
        message: `name: ${name} \nemail: ${email} \nmessage: ${message}`
      });
      res.status(200).json({
        success: true,
        message: "message sent successfully"
      });
  
   
  });
  
  //dashboard
  const dashboard = asyncErrorHandler(async (req, res, next) => {
    const studentCount = await Student.countDocuments()
    const teacherCount = await Teacher.countDocuments()
    const bookingCount  = await Booking.countDocuments()
    const booking  = await Booking.find().select("totalPrice")
    let totalRevenue = 0; 
    booking.map((total)=>totalRevenue += total.totalPrice )
    var currentDate = new Date();
    currentDate.setDate(currentDate.getDate() - 30);
    const monthlystudent = await Student.find().select('createdAt').where('createdAt').gte(currentDate);
    const monthlyTeacher = await Teacher.find().select('createdAt').where('createdAt').gte(currentDate);
    const data = {
      studentCount,teacherCount,bookingCount,monthlyTeacher,monthlystudent,totalRevenue
    }

      res.status(200).json({
        success: true,
        message: "message sent successfully",
        data
      });
  
   
  });

  module.exports = {createBooking,getSingleBooking,getSingleBookingTeacherById,getSingleBookingStudentById,getAllBookings,updateBookingById,deleteBookingById,bookDemoClass,updateBookingStatusById,contactUs,bookByAdmin,dashboard}


