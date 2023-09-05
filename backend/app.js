// all import 
const express = require('express');
const errorMiddleware = require("./middlewares/errorsMiddlewares");
var path = require('path');
const bodyParser = require('body-parser');

var cors = require('cors')
let app = express();

// meddlwares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({origin: '*'}))
app.use(bodyParser.json());

// public folder 
app.use(express.static(path.join(__dirname, '../public')));

// all routes imports 
const student = require("./routes/studentRoute");
const teacher = require("./routes/teacherRoute");
const booking = require('./routes/bookingRoute');
const category = require('./routes/categoryRoute');
const CustomError = require('./utils/CustomError');


app.get("/",(req,res) => {
  res.send("server is running...");
}
)
// version control 
app.use("/api/v1/", student)
app.use("/api/v1/", teacher)
app.use("/api/v1/", booking)
app.use("/api/v1/", category)

//page not found error handler
app.all("*", (req, res, next) => {
    const err = new CustomError(`Can't find ${req.originalUrl} on the server!`, 404);
    next(err);
}
)

// error handler
app.use(errorMiddleware)

module.exports = app;