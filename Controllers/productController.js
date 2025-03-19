import productModel from "../models/productModel.js";
import { v2 } from "cloudinary";
import sendError from "../utils/sendError.js";
import { filterData } from "../utils/filterQuery.js";

//Add Product
export const addProduct = async (req, res) => {
  try {
    const { name, rate, category, stocks, kilogramOption, image } = req.body;

    // Validate required fields
    if (!name || !rate || !category || !stocks) {
      return sendError(res, 400, "Please provide all required fields");
    }

    // Upload image to Cloudinary
    let imageData = {};
    if (image && image !== "") {
      if (image.startsWith('data:image')) {
        const result = await v2.uploader.upload(image, {
          folder: "products",
        });

        imageData = {
          public_id: result.public_id,
          url: result.url
        };
      } else {
        return sendError(res, 400, "Invalid image format");
      }
    } else {
      return sendError(res, 400, "Product image is required");
    }

    // Create product
    const product = await productModel.create({
      name,
      rate,
      category,
      stocks,
      kilogramOption: kilogramOption || [0.5],
      public_id: imageData.public_id,
      url: imageData.url
    });

    res.status(201).json({
      success: true,
      message: "Product Added Successfully!",
      product
    });
  } catch (error) {
    console.error("Add product error:", error);

    if (error.name === "ValidationError") {
      const errors = {};
      Object.keys(error.errors).forEach((key) => {
        errors[key] = error.errors[key].message;
      });
      return res.status(400).json({
        success: false,
        message: Object.values(errors)
      });
    }

    res.status(500).json({
      success: false,
      message: ["Something Went Wrong!"]
    });
  }
};

//Delete Product
export const deleteProduct = async (req, res) => {
  try {
    const { productId } = req.params;

    if (productId) {
      const isProductExit = await productModel.findById(productId);
      if (isProductExit) {
        const DeletedProduct = await productModel.findByIdAndDelete(productId)
          .populate("category");
        res.status(200).json({
          success: true,
          message: "Product Delete SuccessFully..!!",
          DeletedProduct,
        });
      } else {
        sendError(res, 400, "Product Not Found");
      }
    } else {
      sendError(res, 400, "Product Id Not Found");
    }
  } catch (error) {
    sendError(res, 400, error.message);
  }
};

//Update Products
export const updateProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    const { name, rate, kilogramOption, category, stocks, image } = req.body;

    if (productId) {
      const isProductExit = await productModel.findById(productId);

      if (!isProductExit) {
        return sendError(res, 404, "Product not found");
      }

      // Upload image to Cloudinary
      let imageData = {};
      if (image && image !== "") {
        if (image.startsWith('data:image')) {
          const result = await v2.uploader.upload(image, {
            folder: "products",
          });

          imageData = {
            public_id: result.public_id,
            url: result.url
          };
        } else {
          return sendError(res, 400, "Invalid image format");
        }
      } else {
        return sendError(res, 400, "Product image is required");
      }

      // Update other fields
      isProductExit.name = name;
      isProductExit.rate = rate;
      isProductExit.category = category;
      isProductExit.stocks = stocks;
      isProductExit.kilogramOption = kilogramOption;
      isProductExit.url = imageData.url;
      isProductExit.public_id = imageData.public_id;

      await isProductExit.save();

      res.status(200).json({
        success: true,
        message: "Product Updated Successfully!",
        product: isProductExit
      });
    } else {
      sendError(res, 400, "Product Id Not Found");
    }
  } catch (error) {
    console.log(error);
    sendError(res, 400, error.message);
  }
};

//Retrieve All Products
export const getAllProduct = async (req, res) => {
  try {
    const productsDocCount = await productModel.find().countDocuments();
    const queryStr = filterData(productModel.find(), req.query);
    const products = await queryStr.populate("category");
    res.status(200).json({
      success: true,
      message: "Product Retrieve SuccessFully..!!",
      products,
      productsDocCount,
    });
  } catch (error) {
    console.log(error);
    sendError(res, 400, error.message);
  }
};

//Retrieve First Five Products
export const getRecentProducts = async (req, res) => {
  try {
    const products = await productModel.find().sort({ date: -1 }).limit(10);
    res.status(200).json({
      success: true,
      products,
    });
  } catch (error) {
    sendError(res, 400, "Something Is Wrong..!!");
  }
};

//Retrieve Single Product
export const getSingleProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    if (productId) {
      const product = await productModel.findById(productId)
        .populate("category");

      if (product) {
        res.status(200).json({
          success: true,
          message: "Product Retrieve SuccessFully..!!",
          product,
        });
      } else {
        sendError(res, 400, "Product Not Found..!!");
      }
    } else {
      sendError(res, 400, "Product Id Not Found");
    }
  } catch (error) {
    console.log(error.message);
    sendError(res, 400, "Somethings Is Wrong..!!");
  }
};