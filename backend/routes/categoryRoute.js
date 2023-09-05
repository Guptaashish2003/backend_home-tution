const express = require('express');
const Router = express.Router();

//...............................meddleeware imports................................
const { isAuth, authorizeRoles } = require('../middlewares/isAuth');

//...............................controller imports................................
// all user controller imports are here 
const {createCategory,getAllCategory,getCategoryById,updateCategory,deleteCategory,createSubCategory,getAllSubCategory,getSubCategoryById,updateSubCategory,deleteSubCategory,addSubCategoryValue,removeSubCategoryValue} = require('../controllers/categoryController');


// create a new category => api/v1/mainCategory/new
Router.route("/category/new").post(isAuth("Student"),authorizeRoles("admin"),createCategory)
// get all category => api/v1/categories
Router.route("/categories").get(getAllCategory)
// get single update and delete category => api/v1/category/:id
Router.route("/category/:id").get(isAuth("Student"),authorizeRoles("admin"),getCategoryById).put(isAuth("Student"),authorizeRoles("admin"),updateCategory).delete(isAuth("Student"),authorizeRoles("admin"),deleteCategory)

// ........................sub  Category route ................
// create a new category => api/v1/Category/new
Router.route("/subCategory/new").post(isAuth("Student"),authorizeRoles("admin"),createSubCategory)
// get all category => api/v1/categorys
Router.route("/subCategories").get(getAllSubCategory)
// get single update and delete category => api/v1/category/:id
Router.route("/subCategory/:id").get(isAuth("Student"),getSubCategoryById).put(isAuth("Student"),authorizeRoles("admin"),updateSubCategory).delete(isAuth("Student"),authorizeRoles("admin"),deleteSubCategory)

// add value category => api/v1/subCategory/add/:id
Router.route("/subCategory/add/:id").put(isAuth("Student"),authorizeRoles("admin"),addSubCategoryValue)
// remove value category => api/v1/subCategory/remove/:id
Router.route("/subCategory/remove/:id").delete(isAuth("Student"),authorizeRoles("admin"),removeSubCategoryValue)




module.exports = Router;