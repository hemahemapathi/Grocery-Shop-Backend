import sendError from "../utils/sendError.js";
import jwt from "jsonwebtoken";
import userModel from "../models/userModel.js";
import dotenv from "dotenv";

dotenv.config();

const isAuthUser = async (req, res, next) => {
  try {
    // Check for token in both headers and cookies
    let token = null;
    
    // Check Authorization header (Bearer token)
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    } 
    // Check for token in cookies as fallback
    else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    if (!token) {
      return sendError(res, 401, "Please login to access this resource");
    }

    // Verify token and find user
    try {
      // Log the token for debugging
      console.log("Token being verified:", token);
      
      const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
      console.log("Decoded token:", decoded);
      
      if (!decoded.userId) {
        return sendError(res, 401, "Invalid token format");
      }
      
      const user = await userModel.findById(decoded.userId);
      console.log("User found:", user ? "Yes" : "No");
      
      if (!user) {
        return sendError(res, 404, "User not found");
      }
      
      // Attach user to request object
      req.user = user;
      next();
    } catch (jwtError) {
      console.error("JWT verification error:", jwtError);
      return sendError(res, 401, "Invalid or expired token. Please login again.");
    }
  } catch (error) {
    console.error("Auth middleware error:", error);
    sendError(res, 500, "Authentication error occurred");
  }
};

export default isAuthUser;
