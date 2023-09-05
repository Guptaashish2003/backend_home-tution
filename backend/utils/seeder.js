
const connectDatabase = require("../config/dbConnect");
const teachers = require("../data/teacher.json")
const Teacher = require("../models/teacher");
const {SubCategory} = require("../models/category");
const students = require("../data/student.json")
const subCategory = require("../data/subcategory.json")
const Student = require("../models/studentDetails");
const dotenv = require("dotenv");
dotenv.config()
// connect to connectDatabase 
connectDatabase();

const seedproducts = async () => {
    try {
        // await Teacher.deleteMany();
        // await Student.deleteMany();
        await SubCategory.deleteMany();
        console.log("all Data deleted...")
        // await Teacher.insertMany(teachers)
        await SubCategory.insertMany(subCategory)
        // await Student.insertMany(students)
        console.log("🟢 Data Inserted 🟢");
        process.exit()
        
    } catch (error) {
        console.log(error.message)
        process.exit();
        
    }
  
}

seedproducts()


