import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import complaintRoutes from "./routes/complaintRoutes.js";
import cors from "cors";




dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.log(err));

app.use("/api", complaintRoutes);

app.get("/", (req, res) => {
  res.send("🚀 Complaint Analytics API Running");
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
