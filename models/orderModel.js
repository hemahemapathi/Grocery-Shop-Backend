import mongoose, { Schema, Types, model } from "mongoose";

const orderSchema = new mongoose.Schema({
  user: {
    type: Types.ObjectId,
    ref: "user",
    required: true,
  },
  orderItems: [
    {
      productId: { type: Types.ObjectId, ref: "Product", required: true },
      name: { type: String, required: true },
      quantity: { type: Number, required: true },
      rate: { type: Number, required: true },
      image: { type: String, required: true },
    },
  ],
  totalPrice: {
    type: Number,
    required: true,
  },
  shippingInfo: {
    address: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    country: { type: String, required: true },
    mobileNumber: { type: String, required: true },
    pinCode: { type: String, required: true },
  },
  status: {
    type: String,
    default: "Processing",
  },
  orderDate: {
    type: String,
    default: () =>
      new Date().toLocaleDateString("en-us", {
        year: "numeric",
        month: "short",
        day: "numeric",
      }),
  },
});

const orderModel = model("orders", orderSchema);

export default orderModel;