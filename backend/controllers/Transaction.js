
// Constants for PayU integration
const axios = require('axios');
 const Transaction = require("../models/TransactionModel")
 const Booking = require("../models/booking")
const asyncErrorHandler = require('../utils/asyncErrorHandler')
const CustomError = require("../utils/CustomError");
const initiatePayment = asyncErrorHandler(async (req, res, next) => {
    const {  email, phone,name,teacherId,studyMode,locationUrl,studyTerm,specialization ,studyHours,totalPrice } = req.body;

  if(!email || !totalPrice || !phone || !name || !teacherId ){
    return next(new CustomError("Please provide email , amount , phone , name", 400));
  }
  
  let txnid = Date.now().toString()+totalPrice;
  const transaction = await Transaction.create({student : req.user._id,txnid,paidAt:Date.now()});
    const booking = await Booking.create({student : req.user._id, teacher : teacherId,studyMode,transaction:transaction._id,locationUrl,studyTerm,specialization ,studyHours,totalPrice,paymentMode:"By Cash"})
    
      const formData = {
        key: process.env.MERCHANT_KEY,
        salt: process.env.MERCHANT_SALT,
        txnid: txnid, // Generate a unique transaction ID
        amount:totalPrice,
        email:email,
        phone: phone,
        productinfo: teacherId,
        firstname: name,
      surl: `${process.env.SUCCESS_PAGE}/${booking._id}`, // Redirect URL after successful payment
      furl:`${process.env.FAIL_PAGE}/${booking._id}`, // Redirect URL after failed payment
      curl:`${process.env.CANCEL_PAGE}/${booking._id}` , // Redirect URL after cancel payment
      payUBaseUrl:process.env.PAYU_BASE_URL
    };

    // Calculate hash for secure communication with PayU's servers
    const hashString = `${process.env.MERCHANT_KEY}|${formData.txnid}|${formData.amount}|${formData.productinfo}|${formData.firstname}|${formData.email}|||||||||||${process.env.MERCHANT_SALT}`;
    formData.hash = require('crypto').createHash('sha512').update(hashString).digest('hex');

    res.status(200).json({
      success: true,
      data:formData
    });  


  });

  const sucess = asyncErrorHandler(async (req, res, next) => {
    const  {bookingId}  = req.params;
    const booking = await Booking.findById(bookingId).populate("transaction","_id");
    const transaction = await Transaction.findById(booking.transaction._id);
    transaction.transactionStatus = "success";
    transaction.save();
    res.redirect(`${process.env.BASE_URL}/bookingdetails/${bookingId}`);
  });
  const failure = asyncErrorHandler(async (req, res, next) => {
    const  {bookingId}  = req.params;
    const booking = await Booking.findById(bookingId).populate("transaction","_id");
    const transaction = await Transaction.findById(booking.transaction._id);
    transaction.transactionStatus = "fail";
    transaction.save();
    res.redirect(`${process.env.BASE_URL}/bookingdetails/${bookingId}`);
  });
  const cancel = asyncErrorHandler(async (req, res, next) => {
    const  {bookingId}  = req.params;
    const booking = await Booking.findById(bookingId).populate("transaction","_id");
    const transaction = await Transaction.findById(booking.transaction._id);
    transaction.transactionStatus = "cancel";
    transaction.save();
    res.redirect(`${process.env.BASE_URL}/bookingdetails/${bookingId}`);

  });

  module.exports = {initiatePayment,sucess,cancel,failure}