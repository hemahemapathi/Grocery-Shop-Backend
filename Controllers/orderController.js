import productModel from "../models/productModel.js";
import Order from "../models/orderModel.js";
import sendError from "../utils/sendError.js";
import mongoose from "mongoose";

//update stock
const updateStock = (cartItems) => {
  cartItems.map(async (item) => {
    const product = await findById(item.id);
    product.stocks = product.stocks - item.quantity;
    await product.save();
  });
};

export const newOrder = async (req, res) => {
  try {
    const { 
      shippingInfo, 
      cartItems, 
      userId,    
      total      
    } = req.body;

    // Add missing required fields to shippingInfo
    const completeShippingInfo = {
      ...shippingInfo,
      country: shippingInfo.country || "India", // Default to India if not provided
      state: shippingInfo.state || shippingInfo.city // Use city as state if not provided
    };
    
    // Validate and convert userId to a valid ObjectId
    let validUserId;
    try {
      validUserId = new mongoose.Types.ObjectId(userId);
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID format",
        error: error.message
      });
    }
    
    // Process cart items and validate productIds
    const completeOrderItems = [];
    for (const item of cartItems) {
      try {
        // Validate that the item.id can be converted to a valid ObjectId
        const productId = new mongoose.Types.ObjectId(item.id);
        
        completeOrderItems.push({
          ...item,
          productId // Use the validated ObjectId
        });
      } catch (error) {
        return res.status(400).json({
          success: false,
          message: `Invalid product ID format for ${item.name}`,
          error: error.message
        });
      }
    }

    const order = await Order.create({
      shippingInfo: completeShippingInfo,
      orderItems: completeOrderItems,
      user: validUserId,         
      totalPrice: total,    
      paidAt: Date.now(),
      status: "Processing" 
    });
    
    res.status(201).json({
      success: true,
      order,
      message: "Order placed successfully"
    });
  } catch (error) {
    console.error("Order creation error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to place order. Please try again later.",
      error: error.message || "Server error"
    });
  }
};



  export const getMyOrders = async  (req, res) => {
    try {
      const userId = req.user._id;
      if (userId) {
        const orders = await Order.find({ user: userId }).sort({ _id: -1 });
        res.status(200).json({
          success: true,
          message: "Orders Get SuccessFully",
          myOrders: orders,
        });
      } else {
        sendError(res, 400, "Invalid User Id ");
      }
    } catch (error) {
      console.error("Get My Orders error:", error);
      sendError(res, 400, "Somethings Is Wrong..!!");
    }
  }

  export const getOrderDetails = async (req, res) => {
    try {
      const { orderId } = req.params;
      if (orderId) {
        const order = await Order.findById(orderId);
        res.status(200).json({
          success: true,
          order,
        });
      } else {
        sendError(res, 400, "Invalid OrderId..!!");
      }
    } catch (error) {
      console.log(error.message);
      sendError(res, 400, "Somethings Is Wrong..!!");
    }
  }

 // Admin get all orders
// Admin get all orders
export const adminAllOrders = async (req, res) => {
  try {
    // Check if user is admin (additional check)
    if (req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Not Authorized User"
      });
    }
    
    // Fix: Use Order instead of orderModel
    const orderDocCount = await Order.countDocuments();
    const AllOrders = await Order.find()
      .populate("user", "firstName lastName email")
      .sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      AllOrders,
      orderDocCount,
      message: "All Orders Get SuccessFully..!!"
    });
  } catch (error) {
    console.error("Admin get all orders error:", error);
    res.status(500).json({
      success: false,
      message: "Something Went Wrong While Fetching Orders"
    });
  }
};



  export const AdminUpdateOrder = async (req, res) => {
    try {
      const { orderId } = req.params;
      if (orderId) {
        // Use Order.findById()
        const updatedOrder = await Order.findById(orderId);
        updatedOrder.status = req.body.oStatus;
        await updatedOrder.save();
        res.status(200).json({
          success: true,
          message: "Order Updated..!!",
          updatedOrder,
        });
      } else {
        sendError(res, 404, "Order Id Not Found");
      }
    } catch (error) {
      console.log(error.message);
      sendError(res, 400, "Somethings Went,s To Wrong..!!");
    }
  };
  
 
