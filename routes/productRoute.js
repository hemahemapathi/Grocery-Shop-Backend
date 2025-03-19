import { Router } from "express";
import {
  addProduct,
  deleteProduct,
  updateProduct,
  getAllProduct,
  getSingleProduct,
  getRecentProducts
} from "../Controllers/productController.js";
import isAuthorized from "../middleware/isAuthorized.js";
import isAuthUser from "../middleware/isAuthUser.js";
const router = Router();

router.post("/add", isAuthUser, isAuthorized, addProduct);
router.get("/getAllProducts", getAllProduct);
router.get("/recent/products", getRecentProducts);
router.get("/getSingleProduct/:productId", getSingleProduct);
router.put("/update/:productId", isAuthUser, isAuthorized, updateProduct);
router.delete("/delete/:productId", isAuthUser, isAuthorized, deleteProduct);

export default router;