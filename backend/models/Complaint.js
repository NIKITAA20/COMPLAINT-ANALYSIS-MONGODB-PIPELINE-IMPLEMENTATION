import mongoose from "mongoose";

const complaintSchema = new mongoose.Schema({
  category: {
    type: String,
    enum: ["internet", "electricity", "water", "service"],
    required: true
  },
  city: String,
  priority: {
    type: String,
    enum: ["low", "medium", "high"]
  },
  status: {
    type: String,
    enum: ["open", "pending", "resolved"]
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  resolvedAt: Date
});

export default mongoose.model("Complaint", complaintSchema);
