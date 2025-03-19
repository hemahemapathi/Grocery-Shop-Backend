import categoryModel from "../models/categoryModel.js";
import { v2 as cloudinary } from "cloudinary";
import sendError from "../utils/sendError.js";



// Add Category
export const addCategory = async (req, res) => {
  try {
    const { categoryName, categoryImage } = req.body;

    // Check if categoryName exists
    if (!categoryName) {
      return sendError(res, 400, "Category name is required");
    }

    // Check if category already exists
    const isCategoryExist = await categoryModel.findOne({
      categoryName: categoryName,
    });
    
    if (isCategoryExist) {
      return sendError(res, 400, "Category Already Exists!");
    } 
    
    let imageUrl = null;
    
    // Handle image upload if provided
    if (categoryImage && categoryImage.trim() !== '') {
      try {
        // Handle both base64 and URL formats
        if (categoryImage.startsWith('data:image')) {
          // Upload base64 image
          const result = await cloudinary.uploader.upload(categoryImage, {
            folder: "category",
            resource_type: "auto"
          });
          imageUrl = result.secure_url; // Use secure_url for HTTPS
        } else if (categoryImage.startsWith('http')) {
          // If it's already a URL, use it directly
          imageUrl = categoryImage;
        } else {
          return sendError(res, 400, "Invalid image format. Please provide a valid image.");
        }
      } catch (uploadError) {
        console.error("Cloudinary upload error details:", uploadError);
        return sendError(res, 400, "Error uploading image. Please try again.");
      }
    }
    
    // Create the category with or without image
    const newCategory = await categoryModel.create({
      categoryName,
      categoryImage: imageUrl
    });
    
    return res.status(201).json({
      success: true,
      message: "Category Added Successfully!",
      newCategory,
    });
  } catch (error) {
    console.error("Error in addCategory:", error);
    return sendError(res, 500, "Server error while adding category");
  }
};




//get all categories
export const getAllCategories = async (req, res) => {
  try {
    const CategoriesCount = await categoryModel.find().countDocuments();
    const Categories = await categoryModel.find();
    if (Categories.length == 0) {
      return sendError(res, 400, "Categories Not Found..!!");
    } else {
      return res.status(200).json({
        success: true,
        Categories,
        CategoriesCount,
        message: "Categories Get Successfully..!!",
      });
    }
  } catch (error) {
    console.error("Error in getAllCategories:", error);
    return sendError(res, 400, "Something Went Wrong..!!");
  }
};

//delete category
export const deleteCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    if (categoryId) {
      const isCategoryExist = await categoryModel.findById(categoryId);
      if (isCategoryExist) {
        const DeletedCategory = await categoryModel.findByIdAndDelete(
          categoryId
        );
        return res.status(200).json({
          success: true,
          message: "Category Delete SuccessFully..!!",
          DeletedCategory,
        });
      } else {
        return sendError(res, 400, "Category Not Found");
      }
    } else {
      return sendError(res, 400, "Category Id Not Found");
    }
  } catch (error) {
    console.error("Error in deleteCategory:", error);
    return sendError(res, 400, "Something Went Wrong..!!");
  }
};

//Update Category

export const updateCategory = async (req, res) => {
  try {
    if (!req.params.categoryId) {
      return sendError(res, 400, "Category Id Required..!!");
    }
    
    const category = await categoryModel.findById(req.params.categoryId);
    if (!category) {
      return sendError(res, 404, "Category not found");
    }
    
    // Handle image upload if provided
    if (req.body.categoryImage && req.body.categoryImage.trim() !== '') {
      try {
        // Handle both base64 and URL formats
        if (req.body.categoryImage.startsWith('data:image')) {
          // Upload base64 image
          const result = await cloudinary.uploader.upload(req.body.categoryImage, {
            folder: "category",
            resource_type: "auto"
          });
          category.categoryImage = result.secure_url; // Use secure_url for HTTPS
        } else if (req.body.categoryImage.startsWith('http')) {
          // If it's already a URL, use it directly
          category.categoryImage = req.body.categoryImage;
        } else {
          return sendError(res, 400, "Invalid image format. Please provide a valid image.");
        }
      } catch (uploadError) {
        console.error("Cloudinary upload error details:", uploadError);
        return sendError(res, 400, "Error uploading image. Please try again.");
      }
    }
    
    // Update other fields if provided
    if (req.body.categoryName) {
      category.categoryName = req.body.categoryName;
    }
    
    if (req.body.description) {
      category.description = req.body.description;
    }
    
    await category.save();
    return res.status(200).json({
      success: true,
      message: "Category Updated Successfully!",
      category
    });
  } catch (error) {
    console.error("Error in updateCategory:", error);
    return sendError(res, 500, "Server error while updating category");
  }
};

