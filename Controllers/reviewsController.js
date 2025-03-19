import reviewModel from "../models/reviewsModel.js";
import  sendError from "../utils/sendError.js";

export const addReviews = async (req, res) => {
  try {
    const { comment, ratings } = req.body;
    
    // Validate required fields
    if (!ratings) {
      return res.status(400).json({
        success: false,
        message: "Ratings field is required"
      });
    }
    
    const isReviewsExist = await reviewModel.findOne({ user: req.user._id });
    if (isReviewsExist) {
      isReviewsExist.comment = comment;
      isReviewsExist.ratings = ratings;
      await isReviewsExist.save();
      res.status(200).json({
        success: true,
        message: "Review Update..!!",
      });
    } else {
      const newReviews = await reviewModel.create({
        user: req.user._id,
        comment,
        ratings,
      });
      res.status(201).json({
        success: true,
        message: "Review Added..!!",
      });
    }
  } catch (error) {
    console.log(error.message);
    // Send more specific error message
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
    sendError(res, 400, "Somethings Went To Wrong..!!");
  }
};

export const getAllReviews = async (req, res) => {
  try {
    // First get the reviews without population
    const reviews = await reviewModel.find({ ratings: { $gte: 3 } })
      .sort({ _id: -1 });
    
    // Then try to populate if needed
    try {
      await reviewModel.populate(reviews, { path: "user", select: "firstName lastName email" });
    } catch (populateError) {
      console.error("Error populating user data:", populateError);
      // Continue without population
    }
    
    res.status(200).json({
      success: true,
      reviews,
    });
  } catch (error) {
    console.error("Error getting reviews:", error);
    sendError(res, 400, "Somethings Went To Wrong..!!");
  }
};


export const AdminGetAllReviews = async (req, res) => {
  try {
    // First get the reviews without population
    const reviews = await reviewModel.find()
      .sort({ _id: -1 });
    
    // Then try to populate if needed
    try {
      await reviewModel.populate(reviews, { path: "user", select: "firstName lastName email" });
    } catch (populateError) {
      console.error("Error populating user data:", populateError);
      // Continue without population
    }
    
    res.status(200).json({
      success: true,
      reviews,
    });
  } catch (error) {
    console.error("Error in AdminGetAllReviews:", error);
    sendError(res, 400, "Somethings Went To Wrong..!!");
  }
};


export const deleteReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    if (reviewId) {
      // Use reviewModel.findById() and reviewModel.findByIdAndDelete()
      const review = await reviewModel.findById(reviewId);
      if (review) {
        const deletedReview = await reviewModel.findByIdAndDelete(reviewId);
        res.status(200).json({
          success: true,
          message: "Review Delete SuccessFully..!!",
        });
      } else {
        sendError(res, 400, "Review Not Found");
      }
    } else {
      sendError(res, 400, "Review Id Not Found");
    }
  } catch (error) {
    console.log(error.message);
    sendError(res, 400, "Somethings Went's Wrong..!!");
  }
};




