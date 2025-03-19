import userModel from "../models/userModel.js";
import { genSalt, hash, compare } from "bcrypt";
import { createTransport } from "nodemailer";
import jwt from "jsonwebtoken";
import sendError from "../utils/sendError.js";
import sendToken from "../utils/sendToken.js";



//User Register
export const userRegister = async (req, res) => {
  try {
    const { firstName, lastName, email, password, confirmPassword } = req.body;
    const isUserExit = await userModel. findOne({ email: email });
    if (isUserExit) {
      res.status(400).json({
        success: false,
        message: ["Oops! Email Already Exit..!!"],
      });
    } else {
      if (password == confirmPassword) {
        const NewUser = await userModel. create({
          firstName,
          lastName,
          email,
          password,
        });
        const salt = await genSalt(10);
        NewUser.password = await hash(NewUser.password, salt);
        await NewUser.save();
        res.status(201).json({
          success: true,
          message: "User Register SuccessFully..!!",
          NewUser,
        });
      } else {
        sendError(res, 400, ["Passwords Field Mismatch"]);
      }
    }
  } catch (error) {
    if (error.name === "ValidationError") {
      const errors = {};
      Object.keys(error.errors).map((key) => {
        errors[key] = error.errors[key].message;
      });
      sendError(res, 400, Object.values(errors));
    } else {
      sendError(res, 400, ["Somethings Went Wrong..!!"]);
    }
  }
};



//Send Password Reset Email To User
export const sendUserPasswordResetEmail = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email || email.trim() === '') {
      return sendError(res, 400, "Email Field Is Required..!!");
    }

    const isUserExit = await userModel.findOne({ email: email });
    if (!isUserExit) {
      return sendError(res, 400, "User Not Exit");
    }

    const token = jwt.sign(
      { userId: isUserExit._id },
      process.env.JWT_RESET_PASSWORD_SECRET_KEY,
      { expiresIn: "5m" }
    );

    const transporter = createTransport({
      service: "gmail",
      auth: {
        user: process.env.SMPT_MAIL,
        pass: process.env.SMPT_PASSWORD
      }
    });

    const link = `${req.protocol}://${req.get("host")}/reset-password/${isUserExit._id}/${token}`;
    
    await transporter.sendMail({
      from: process.env.SMPT_MAIL,
      to: isUserExit.email,
      subject: "E-SHOP - Password Reset Link",
      html: `<h2>Hello ${isUserExit.firstName}</h2><br>
        <center>
        <h5>Your Password Reset Link is <a href=${link}>Click Here To Reset Password</a> </h5>
        </center>`
    });

    res.status(200).json({
      success: true,
      message: `Password Reset Link Send To ${isUserExit.email}`
    });
  } catch (error) {
    console.log(error);
    sendError(res, 400, "Something went wrong while sending reset email");
  }
};

//Password Reset
export const userPasswordReset = async (req, res) => {
  try {
    const { password, confirm_password } = req.body;
    const { id, token } = req.params;
    await jwt.verify(token, process.env.JWT_RESET_PASSWORD_SECRET_KEY);
    
    if (password && confirm_password) {
      if (password === confirm_password) {
        if (password.length >= 4) {
          const user = await userModel.findById(id);
          const salt = await genSalt(10);
          user.password = await hash(password, salt);
          await user.save();
          res.status(200).json({
            success: true,
            message: "Password Reset SuccessFully..!!"
          });
        } else {
          sendError(res, 400, "Password: Minimum Four Character");
        }
      } else {
        sendError(res, 400, "Both Password Field Not Match..!!");
      }
    } else {
      sendError(res, 400, "All Field Are Required..!!");
    }
  } catch (error) {
    if (error.message == "jwt expired") {
      sendError(res, 400, "Invalid Token Or Expired");
    } else {
      sendError(res, 400, "Something Went To Wrong..!!");
    }
  }
};

// User Login - Fix to properly send token

export const userLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return sendError(res, 400, "Email and password are required");
    }
    
    const user = await userModel.findOne({ email });
    if (!user) {
      return sendError(res, 400, "Invalid email or password");
    }
    
    const isPasswordMatch = await compare(password, user.password);
    if (!isPasswordMatch) {
      return sendError(res, 400, "Invalid email or password");
    }
    
    // Generate JWT token with userId
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET_KEY,
      { expiresIn: '7d' }
    );
    
    console.log("Generated token for user:", user._id);
    console.log("Token payload:", { userId: user._id });
    
    // Set cookie
    res.cookie('token', token, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    });
    
    // Send response with token in both body and cookie
    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error("Login error:", error);
    sendError(res, 500, "Something went wrong during login");
  }
};


// Logout function - simplified
export const loggedOutUser = (req, res) => {
  try {
    // Clear the cookie
    res.cookie('token', '', {
      httpOnly: true,
      expires: new Date(0),
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    });
    
    res.status(200).json({
      success: true,
      message: "Logged out successfully"
    });
  } catch (error) {
    console.error("Logout error:", error);
    sendError(res, 500, "Something went wrong during logout");
  }
};

// Change password function - fixed
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;
    
    // Validate input
    if (!currentPassword || !newPassword || !confirmPassword) {
      return sendError(res, 400, "All password fields are required");
    }
    
    // Get user from auth middleware
    const user = req.user;
    
    if (!user) {
      return sendError(res, 404, "User not found");
    }
    
    // Check if current password is correct
    try {
      const isPasswordMatch = await compare(currentPassword, user.password);
      if (!isPasswordMatch) {
        return sendError(res, 400, "Current password is incorrect");
      }
    } catch (compareError) {
      console.error("Password comparison error:", compareError);
      return sendError(res, 500, "Error verifying current password");
    }
    
    // Check if new password and confirm password match
    if (newPassword !== confirmPassword) {
      return sendError(res, 400, "New password and confirm password do not match");
    }
    
    try {
      // Hash the new password
      const salt = await genSalt(10);
      user.password = await hash(newPassword, salt);
      
      // Save the updated user
      await user.save();
      
      res.status(200).json({
        success: true,
        message: "Password updated successfully"
      });
    } catch (hashError) {
      console.error("Password hashing error:", hashError);
      return sendError(res, 500, "Error updating password");
    }
  } catch (error) {
    console.error("Change password error:", error);
    sendError(res, 500, "Something went wrong while changing password");
  }
};

export const adminGetAllUsers = async (req, res) => {
  try {
    // Use userModel.countDocuments() and userModel.find()
    const userDocCount = await userModel.find().countDocuments();
    const AllUsers = await userModel.find().sort({ _id: -1 });
    res.status(200).json({
      success: true,
      AllUsers,
      userDocCount,
      message: "All Orders Get SuccessFully..!!",
    });
  } catch (error) {
    console.log(error);
    sendError(res, 400, "Somethings Went's Wrong..!!");
  }
};

export const AdminDeleteUser = async (req, res) => {
  try {
    const { userId } = req.params;
    console.log(req.params);
    if (userId) {
      // Use userModel.findById() and userModel.findByIdAndDelete()
      const isUserExit = await userModel.findById(userId);
      if (isUserExit) {
        const DeletedUser = await userModel.findByIdAndDelete(userId);
        res.status(200).json({
          success: true,
          message: "Delete SuccessFully..!!",
          DeletedUser,
        });
      } else {
        sendError(res, 400, "User Not Found");
      }
    } else {
      sendError(res, 400, "User Id Not Found");
    }
  } catch (error) {
    sendError(res, 400, "Somethings Is Wrong");
  }
};

export const adminUpdateUser = async (req, res) => {
  try {
    const { userId } = req.params;
    if (userId) {
      // Use userModel.findById()
      const isUserExit = await userModel.findById(userId);
      if (isUserExit) {
        isUserExit.role = req.body.UserRole;
        await isUserExit.save();
        res.status(200).json({
          success: true,
          message: "User Role Updated..!!",
          isUserExit,
        });
      } else {
        sendError(res, 400, "User Not Found..!!");
      }
    } else {
      sendError(res, 400, "User Not Found..!!");
    }
  } catch (error) {
    console.log(error.message);
    sendError(res, 400, "Somethings Went's Wrong..!!");
  }
};



// Make sure to export adminLogin
// Admin Registration - only allows emails ending with @admin.com
export const adminRegister = async (req, res) => {
  try {
    const { firstName, lastName, email, password, confirmPassword } = req.body;
    
    // Validate admin email format
    if (!email.endsWith('@admin.com')) {
      return sendError(res, 400, ["Admin email must end with @admin.com"]);
    }
    
    const isUserExit = await userModel.findOne({ email: email });
    if (isUserExit) {
      return res.status(400).json({
        success: false,
        message: ["Oops! Email Already Exists..!!"],
      });
    }
    
    if (password !== confirmPassword) {
      return sendError(res, 400, ["Passwords Field Mismatch"]);
    }
    
    const newAdmin = await userModel.create({
      firstName,
      lastName,
      email,
      password,
      role: "admin" // Set role as admin
    });
    
    const salt = await genSalt(10);
    newAdmin.password = await hash(newAdmin.password, salt);
    await newAdmin.save();
    
    res.status(201).json({
      success: true,
      message: "Admin Registered Successfully!",
      admin: {
        _id: newAdmin._id,
        firstName: newAdmin.firstName,
        lastName: newAdmin.lastName,
        email: newAdmin.email,
        role: newAdmin.role
      }
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      const errors = {};
      Object.keys(error.errors).map((key) => {
        errors[key] = error.errors[key].message;
      });
      sendError(res, 400, Object.values(errors));
    } else {
      console.error("Admin registration error:", error);
      sendError(res, 400, ["Something Went Wrong During Admin Registration!"]);
    }
  }
};

// Admin Login - verifies admin role and @admin.com email
export const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return sendError(res, 400, "Email and password are required");
    }
    
    // Validate admin email format
    if (!email.endsWith('@admin.com')) {
      return sendError(res, 400, "Invalid admin email format");
    }
    
    const admin = await userModel.findOne({ email });
    if (!admin) {
      return sendError(res, 400, "Invalid admin credentials or not authorized");
    }
    
    const isPasswordMatch = await compare(password, admin.password);
    if (!isPasswordMatch) {
      return sendError(res, 400, "Invalid admin credentials");
    }
    
    // Update the user's role to admin if it's not already
    if (admin.role !== "admin") {
      admin.role = "admin";
      await admin.save();
    }
    
    // Generate JWT token with userId and role
    const token = jwt.sign(
      { userId: admin._id, role: admin.role },
      process.env.JWT_SECRET_KEY,
      { expiresIn: '7d' }
    );
    
    // Set cookie
    res.cookie('admin_token', token, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    });
    
    // Send response
    res.status(200).json({
      success: true,
      message: "Admin login successful",
      token,
      admin: {
        _id: admin._id,
        firstName: admin.firstName,
        lastName: admin.lastName,
        email: admin.email,
        role: admin.role
      }
    });
  } catch (error) {
    console.error("Admin login error:", error);
    sendError(res, 500, "Something went wrong during admin login");
  }
};







