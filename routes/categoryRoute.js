import { Router } from "express";
import  {
  addCategory, getAllCategories, deleteCategory, updateCategory,
}from "../Controllers/categoryController.js";


const router= Router();

router.post("/add", addCategory);
router.get("/get", getAllCategories);

router.delete("/delete/:categoryId", deleteCategory);
router.put("/update/:categoryId", updateCategory);

export default router;
