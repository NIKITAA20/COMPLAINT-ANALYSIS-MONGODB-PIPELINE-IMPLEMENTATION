import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import complaintRoutes from "./routes/complaintRoutes.js";
import cors from "cors";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

// 🔥 Connect DB first, then start server
const startServer = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB Connected");

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });

  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
    process.exit(1); // stop server if DB fails
  }
};

app.use("/api", complaintRoutes);

app.get("/", (req, res) => {
  res.send("🚀 Complaint Analytics API Running");
});

startServer();
