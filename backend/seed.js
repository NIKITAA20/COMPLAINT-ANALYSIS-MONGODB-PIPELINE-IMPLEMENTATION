import mongoose from "mongoose";
import dotenv from "dotenv";
import { faker } from "@faker-js/faker";
import Complaint from "./models/Complaint.js";

dotenv.config();

await mongoose.connect(process.env.MONGO_URI);

const cities = ["Mumbai", "Pune", "Delhi", "Bangalore"];
const categories = ["internet", "electricity", "water", "service"];
const priorities = ["low", "medium", "high"];

const complaints = [];

for (let i = 0; i < 10000; i++) {
  const created = faker.date.past({ years: 1 });
  const resolved = Math.random() > 0.4;

  complaints.push({
    category: faker.helpers.arrayElement(categories),
    city: faker.helpers.arrayElement(cities),
    priority: faker.helpers.arrayElement(priorities),
    status: resolved ? "resolved" : faker.helpers.arrayElement(["open", "pending"]),
    createdAt: created,
    resolvedAt: resolved
      ? faker.date.between({ from: created, to: new Date() })
      : null
  });
}

await Complaint.insertMany(complaints);
console.log("✅ 10,000 complaints inserted");

process.exit();
