const jwt = require("jsonwebtoken");
const asyncErrorHandler = require("../utils/asyncErrorHandler")
const CustomError = require("../utils/CustomError") 
const Student = require("../models/studentDetails")
const Teacher = require("../models/teacher")
// check user is authenticated or not 
const isAuth = (User)=> asyncErrorHandler( async (req,res,next) => {
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
      ) {
        token = req.headers.authorization.split(" ")[1];
      }
    if (!token) {
      return next(new CustomError("Unauthorized , Please login to get access", 401));
    }
    // decoding the token and verify its 
    const decoded = jwt.verify(token,process.env.JWT_SECRET)
    // handling error invalidToken  
    if(!decoded){
        next(new CustomError("You are not authenticated",401));
    }
    let user;
    if (User === "Student") {
      
       user = await Student.findById(decoded.id);
    }
    else{
      user = await Teacher.findById(decoded.id);
    }
    // handling user not found error
    if(!user){
        next(new CustomError("You are not authenticated",401));
    }
    req.user = user;
    next();

})

// // handling user roles 
const authorizeRoles = (...roles) => {
    return (req,res,next) => {
        if(!roles.includes(req.user.role)){
            next(new CustomError("You are not authorized",403));
        }
        next();
    } 
  
}


module.exports = {isAuth,authorizeRoles };