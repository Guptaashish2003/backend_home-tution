const CustomError = require("./CustomError");
const asyncErrorHandler = require("./asyncErrorHandler");
const sendEmail = require("./sendEmail");
const crypto = require("crypto");
const Teacher = require("../models/teacher");
const Student = require("../models/studentDetails");
// ....................................email verification section ........

const sendVerificationToken = async (User, req, res, next) => {
  const { role } = User
  const verficationToken = User.getEmailVerificationToken();
  await User.save({ validateBeforeSave: false });

  const verficationUrl = `${process.env.BASE_URL}/${role}/verify/email/${verficationToken}`;
  const EmailHtml = `<html lang="en">

  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Document</title>
  
      <style>
          @import url('https://fonts.googleapis.com/css2?family=Roboto+Condensed:wght@400;700&display=swap');
      </style>
  
  </head>
  
  <body>
      <div style="
      justify-content: center !important;
      flex-direction: column !important;
      align-items: center !important;
      margin: 0px auto;
      padding: 0px;
      font-family: 'Roboto Condensed', sans-serif;
  ">
          <h1 style="  font-family: 'Roboto Condensed', sans-serif;
          text-transform: uppercase;
          font-weight: bold;
          font-size: 55px;
      "><span style=" color: #f0c512;">Study</span>Spot</h1>
          <div>
              <h3 style="font-family: 'Roboto Condensed', sans-serif;
              ">Verify your email for Studyspot</h3><br>
              <p> Click below to Verify your email.</p>
              <p>If you didn’t ask to register on studySpot, you can ignore this email</p>
              <p>Thanks,</p>
              <p> StudySpot</p>
  
          </div>
          <div>
              <a href=${verficationUrl}><button style="color: white;
                  background-color: #333;
                  width: 150px;
                  height: 45px;
                  cursor: pointer;">Verify Email</button></a>
              <p>We're happy to help!</p>
          </div>
  </body>
  
  </html>`

  try {
    await sendEmail({
      email: User.email,
      subject: "email verification",
      EmailHtml
    });
    const message = `We have send an email to ${User.email}  please click the link included to verify your email adress`
    res.status(200).json({
      success: true,
      message
    });

  } catch (error) {
    User.emailVerificationToken = undefined;
    User.emailVerificationExpires = undefined;
    await User.save({ validateBeforeSave: false });
    return next(new CustomError("Email could not be sent", 500));
  }

}


// verify email +> /api/v1/student/verify/email/:VerificationToken

const verifyEmail = (User) => asyncErrorHandler(async (req, res, next) => {
  const emailVerificationToken = crypto.createHash('sha256').update(req.params.verificationToken).digest('hex');
  // const { user } = req.body;
  let user;
  if (User === "Student") {

    user = await Student.findOne({
      emailVerificationToken,
      emailVerificationExpires: { $gt: Date.now() }
    });
  }
  else {

    user = await Teacher.findOne({
      emailVerificationToken,
      emailVerificationExpires: { $gt: Date.now() }
    });
  }

  if (!user) {
    return next(new CustomError("Invalid token", 401));
  }

  user.isEmailValid = true;
  user.emailVerificationToken = undefined;
  user.emailVerificationExpires = undefined;
  await user.save();
  res.status(200).json({
    success: true,
    message: "email verified successfully"
  });
});

module.exports = { sendVerificationToken, verifyEmail }




