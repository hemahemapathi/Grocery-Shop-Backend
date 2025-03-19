import { Schema, model } from "mongoose";

const categorySchema = new Schema({
  categoryName: {
    type: String,
    trim: true,
    required: [true, "Enter Category Name"],
  },
  categoryImage: {
    type: String,
    trim: true,
    default: "https://via.placeholder.com/150",
  },
  description: {
    type: String,
    trim: true,
  }
});

const categoryModel = model("Category", categorySchema);

export default categoryModel;