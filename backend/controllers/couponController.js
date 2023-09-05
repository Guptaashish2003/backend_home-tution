const CustomError = require("../utils/CustomError");
const asyncErrorHandler = require("../utils/asyncErrorHandler");
const Coupon = require("../models/couponCode")
const Student = require("../models/studentDetails")

// create coupon api/v1/admin/coupons
const createCoupon = asyncErrorHandler(async (req, res, next) => {
    const { code, percentage, expirationDate } = req.body;
    const coupon = await Coupon.create({code, percentage, isApplied: false, expirationDate:expirationDate});
    await coupon.save();

    res.status(200).json({
      success: true,
      message:"coupon created successfully", 
      data:coupon,
      
    });
  });

  // get coupon api/v1/coupons
const getCoupon = asyncErrorHandler(async (req, res, next) => {
    const { code } = req.params;
    const coupon = await Coupon.findOne({ code: code }).populate('students');
    if (!coupon) {
      return next(new CustomError("Coupon not found", 401));
    }
    if (coupon.expirationDate < Date.now()) {
      return next(new CustomError("Coupon is expired", 401));
    }
    const user = await Student.findById(req.user._id);
    if (!user) {
      return next(new CustomError("User not found", 400));
    }
    if (req.user.role !== "admin") {
      if (coupon.students.some((u) => u._id.equals(user._id))) {
        return next(new CustomError("Coupon already used by the user", 400));
      }
    }
    coupon.students.push(user);
    await coupon.save();

    res.status(200).json({
      success: true,
      data:coupon,
      message:"coupon applied successfully"
      
    });
  });
  // get coupon api/v1/admin/coupons
  const getAllCoupon = asyncErrorHandler(async (req, res, next) => {
    const coupon = await Coupon.find().sort("-createAt");
    if (!coupon) {
      return next(new CustomError("Coupon not found", 401));
    }

    
    res.status(200).json({
      success: true,
      data:coupon,
      
    });
  });
  
  // get coupon api/v1/coupons
const deletetCoupon = asyncErrorHandler(async (req, res, next) => {
    const { id } = req.params;
    const coupon = await Coupon.findOneAndDelete(id);
    if (!coupon) {
      return next(new CustomError("Coupon not found", 401));
    }

    res.status(200).json({
      success: true,
      data:coupon,
      message: 'Coupon deleted successfully'
      
    });
  });
  module.exports ={createCoupon,getCoupon,getAllCoupon,deletetCoupon}