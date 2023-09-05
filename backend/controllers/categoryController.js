const {Category ,SubCategory}= require("../models/category");
const CustomError = require("../utils/CustomError");
const asyncErrorHandler = require("../utils/asyncErrorHandler");


// create a new main category => api/v1/category/new
// Create a new category
const createCategory = asyncErrorHandler( async (req, res) => {
    const { name } = req.body;
    const category = new Category({ name });
    await category.save();
    res.status(201).json({
      success: true,
      category
    });
});

//get all  category => api/v1/category
// Read all categories
const getAllCategory = asyncErrorHandler( async (req, res) => {
    const categories = await Category.find();
    res.status(200).json({
      success: true,
      count: categories.length,
      categories
    });
});

// get single category => api/v1/category/:id
// Read a single category by ID
  const getCategoryById = asyncErrorHandler( async (req, res,next) => {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return next("Cannot find category",404)
    }
    res.status(200).json({
      success: true,
      category
    });
  });
  // update  category => api/v1/category/:id
  // Update a category by ID
  const updateCategory = asyncErrorHandler( async (req, res,next) => {
    const { name } = req.body;
    
    const category = await Category.findById(req.params.id);
    if (!category) {
      return next("category not found",404);
    }
    category.name = name;
    await category.save();
    res.status(200).json({
      success: true,
      category
    });
  });
  // delete category => api/v1/category/:id
  // Delete a category by ID
  const deleteCategory = asyncErrorHandler( async (req, res,next) => {
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) {
      return next("category not found",404);
    }
    res.status(200).json({
      success: true,
      category
    });
  });

  //....................................... sub category section 
  // create a new main category => api/v1/subCategory/new
  // Create a new subCategory
  const createSubCategory = asyncErrorHandler( async (req, res) => {
    const { name,parentCategory,value } = req.body;
    const subcategory = await SubCategory.create({ name,parentCategory,value });
    res.status(201).json({
      success: true,
      subcategory
    });
  });
  // create a new main category => api/v1/subCategory
  // Read all subcategories
  const getAllSubCategory = asyncErrorHandler( async (req, res) => {
    const subCategory = await SubCategory.find();
      res.status(200).json({
        success: true,
        count: subCategory.length,
        subCategory
      });
    });
  // create a new main category => api/v1/subCategory/:id
    // Read a single category by ID
    const getSubCategoryById = asyncErrorHandler( async (req, res,next) => {
      const subCategory = await SubCategory.findById(req.params.id);
      if (!subCategory) {
        return next("Cannot find subcategory",404)
      }
      res.status(200).json({
        success: true,
        subCategory
      });
    });
    // create a new main category => api/v1/subCategory/:id
    // Update a category by ID
    const updateSubCategory = asyncErrorHandler( async (req, res,next) => {
      const { name,parentCategory,value } = req.body;
      
      const subCategory = await SubCategory.findById(req.params.id);
      if (!subCategory) {
        return next("subcategory not found",404);
      }
      
      subCategory.name = name;
      subCategory.parentCategory = parentCategory;
      subCategory.value = value;
      await subCategory.save();
      res.status(200).json({
        success: true,
        subCategory
      });
    });
    // create a new main category => api/v1/subCategory/:id
// Delete a category by ID
const deleteSubCategory = asyncErrorHandler( async (req, res,next) => {
    const subCategory = await SubCategory.findByIdAndDelete(req.params.id);
    if (!subCategory) {
      return next("subcategory not found",404);
    }
    res.status(200).json({
      success: true,
      subCategory
    });
});

// add value category => api/v1/subCategory/add/:id
// Delete a category by ID
const addSubCategoryValue = asyncErrorHandler( async (req, res,next) => {
  const {value} = req.body
  const subCategory = await SubCategory.findById(req.params.id);
  if (!subCategory) {
    return next("subcategory not found",404);
  }
subCategory.value = [...subCategory.value,...value];
await subCategory.save();
    res.status(200).json({
      success: true,
      subCategory
    });
});

// remove value category => api/v1/subCategory/remove/:id
// Delete a category by ID
const removeSubCategoryValue = asyncErrorHandler( async (req, res,next) => {
  const {value} = req.body
    const subCategory = await SubCategory.findById(req.params.id);
    if (!subCategory) {
      return next("subcategory not found",404);
    }
    subCategory.value = subCategory.value.pop(value);
    await subCategory.save();
    res.status(200).json({
      success: true,
      data:subCategory
    });
});



module.exports = {createCategory,getAllCategory,getCategoryById,updateCategory,deleteCategory,createSubCategory,getAllSubCategory,getSubCategoryById,updateSubCategory,deleteSubCategory,addSubCategoryValue,removeSubCategoryValue} 