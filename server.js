import { config } from "dotenv";
import { v2 as cloudinary } from "cloudinary";
import expressFileUpload from "express-fileupload";
import express from "express";
import { json } from "express";
import { static as expressStatic } from "express";
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import dotenv from "dotenv";
import cors from 'cors';
import bodyParser from 'body-parser';
import cookieParser from "cookie-parser";
import { connect, set } from "mongoose";
import userRoutes from "./routes/userRoute.js";
import productRoute from "./routes/productRoute.js";
import categoryRoute from "./routes/categoryRoute.js";

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load env variables first
dotenv.config();


// Set strictQuery option
set('strictQuery', false);

//Connect to MongoDB
connect(process.env.MONGODB_URI)
.then(() => console.log('MongoDB connected successfully'))
.catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
});

app.use(bodyParser.urlencoded({ limit: "200mb", extended: true }));
app.use(bodyParser.json({ limit: "50mb" , extended: true }));
app.use(cookieParser());
app.use(json());
app.use (cors());
app.use(expressFileUpload());



//Config Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_CLOUD_API_KEY,
  api_secret: process.env.CLOUDINARY_CLOUD_API_SECRET_KEY,
});

app.use((req, res, next) => {
  // Original send method
  const originalSend = res.send;
  
  // Override send method
  res.send = function(body) {
    console.log("Response being sent:", body);
    return originalSend.call(this, body);
  };
  
  next();
});

//Load Routes
app.use("/api/user", userRoutes);
app.use("/api/product", productRoute);
app.use("/api/category", categoryRoute);

//Access Front End Static Files
app.use(expressStatic(join(__dirname, "../frontend/build")));

app.get("/", (req, res) => {
  res.send("Hello From Serverside!!");
});

app.get("/test", (req, res) => {
  res.status(200).send('OK')
});

app.get("/health", (req, res) => {
  res.send("Hello From Serverside!!");
});

app.use((err, req, res, next) => {
  console.error("Express error handler:", err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Something went wrong on the server"
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
