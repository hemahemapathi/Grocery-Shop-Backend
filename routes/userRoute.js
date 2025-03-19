import { Router } from "express";
import {
  newOrder,
  getMyOrders, 
  getOrderDetails, 
  adminAllOrders, 
  AdminUpdateOrder
}  from '../Controllers/orderController.js'
import {
  addReviews, 
  getAllReviews, 
  AdminGetAllReviews, 
  deleteReview
} from "../Controllers/reviewsController.js";
import {
  userRegister, 
  userLogin, 
  sendUserPasswordResetEmail, 
  userPasswordReset,
  changePassword,
  loggedOutUser, 
  adminGetAllUsers, 
  AdminDeleteUser, 
  adminUpdateUser,
  adminRegister,
  adminLogin
} from "../Controllers/userController.js";
import  isAuthorized  from "../middleware/isAuthorized.js";
import isAuthUser from "../middleware/isAuthUser.js";


const router = Router();

//Public Route
router.post("/register", userRegister);
router.post("/login", userLogin);
router.post("/send-reset-password-email", sendUserPasswordResetEmail);
router.post("/reset-password/:id/:token", userPasswordReset);

//Admin Auth Routes
router.post("/admin/register", adminRegister);
router.post("/admin/login", adminLogin);


router.get("/logOut", isAuthUser, loggedOutUser);
router.put('/changePassword', isAuthUser, changePassword);

router.post("/new/order", isAuthUser, newOrder);
router.get("/my/orders", isAuthUser, getMyOrders);
router.get("/my/order/:orderId", isAuthUser, getOrderDetails);

router.post("/add/review", isAuthUser, addReviews);
router.get("/get/reviews", getAllReviews);
router.get("/get/admin/reviews", isAuthUser, isAuthorized, AdminGetAllReviews);
router.delete("/admin/review/:reviewId", isAuthUser, isAuthorized, deleteReview);

//Admin Route
router.get("/admin/orders", isAuthUser, isAuthorized, adminAllOrders);
router.put("/update/order/:orderId", isAuthUser, isAuthorized, AdminUpdateOrder);
router.get("/admin/user", isAuthUser, isAuthorized, adminGetAllUsers);
router.delete("/admin/user/:userId", isAuthUser, isAuthorized, AdminDeleteUser);
router.put("/admin/user/:userId", isAuthUser, isAuthorized, adminUpdateUser);


export default router;