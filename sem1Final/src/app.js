import dotenv from "dotenv";
import express from "express";
import connectDB from "./config/db.js";
import cors from "cors";
import userRoutes from "./routes/userRoutes.js";

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect Database
connectDB();

// Test Route
app.get("/", (req, res) => {
  res.send("API is running...");
});

// Routes
app.use("/api/users", userRoutes);

const PORT = process.env.MONGO_PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));