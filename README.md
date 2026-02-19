# 🔍 Complaint Analysis — MongoDB Aggregation Pipeline Implementation

> A full-stack analytics dashboard built to demonstrate real-world **MongoDB Aggregation Pipeline** usage — from raw complaint data to interactive charts.

🌐 **Live Demo:** [https://complaint-analysis-mongodb-pipeline.vercel.app/](https://complaint-analysis-mongodb-pipeline.vercel.app/)

---

## 🎯 Project Aim

The core goal of this project was to **implement MongoDB's Aggregation Pipeline** to transform, group, filter, and analyze complaint data — and visualize the results on a live React dashboard.

This is NOT a CRUD app. Every chart on the dashboard is powered by a **MongoDB pipeline stage**.

---

## 🗂️ Project Structure

```
complaint-analytics/
├── backend/
│   ├── controllers/
│   │   └── complaintController.js   # All pipeline logic lives here
│   ├── models/
│   │   └── Complaint.js             # Mongoose schema
│   ├── routes/
│   │   └── complaintRoutes.js       # API endpoints
│   └── index.js                     # Express server entry
│
├── frontend/
│   └── src/
│       ├── App.jsx                  # Dashboard UI + chart rendering
│       └── api.js                   # Axios base config
│
└── README.md
```

---

## ⚙️ Tech Stack

| Layer       | Technology                     |
|-------------|--------------------------------|
| Database    | MongoDB Atlas                  |
| ODM         | Mongoose                       |
| Backend     | Node.js + Express.js           |
| Frontend    | React.js                       |
| Charts      | Recharts                       |
| Styling     | CSS-in-JS (inline styles)      |
| HTTP Client | Axios                          |
| Deployment  | Vercel (Frontend)              |

---

## 🧠 MongoDB Pipelines Implemented

This is the heart of the project. Each API endpoint runs a different aggregation pipeline.

---

### 1️⃣ Dashboard Summary
**Endpoint:** `GET /api/dashboard-summary`

**Pipeline Stages:** `$group` → `$project`

```js
Complaint.aggregate([
  { $group: {
      _id: null,
      total:    { $sum: 1 },
      resolved: { $sum: { $cond: [{ $eq: ["$status", "resolved"] }, 1, 0] } },
      pending:  { $sum: { $cond: [{ $eq: ["$status", "pending"]  }, 1, 0] } },
      open:     { $sum: { $cond: [{ $eq: ["$status", "open"]     }, 1, 0] } }
  }},
  { $project: {
      total: 1, resolved: 1, pending: 1, open: 1,
      resolutionRate: {
        $round: [{ $multiply: [{ $divide: ["$resolved", "$total"] }, 100] }, 1]
      }
  }}
])
```

**Concepts used:** `$group`, `$cond`, `$project`, `$divide`, `$multiply`, `$round`

---

### 2️⃣ Category Stats
**Endpoint:** `GET /api/category-stats?status=`

**Pipeline Stages:** `[$match]` → `$group` → `$sort`

```js
Complaint.aggregate([
  ...(status ? [{ $match: { status } }] : []),
  { $group: { _id: "$category", count: { $sum: 1 } } },
  { $sort:  { count: -1 } }
])
```

**Concepts used:** Dynamic `$match`, `$group by field`, `$sort descending`

---

### 3️⃣ Monthly Trend
**Endpoint:** `GET /api/monthly-trend?status=`

**Pipeline Stages:** `[$match]` → `$group` (date operator) → `$sort`

```js
Complaint.aggregate([
  ...(status ? [{ $match: { status } }] : []),
  { $group: {
      _id:   { $month: "$createdAt" },
      total: { $sum: 1 }
  }},
  { $sort: { _id: 1 } }
])
```

**Concepts used:** `$month` date operator, grouping by extracted date part

---

### 4️⃣ Last 30 Days Trend
**Endpoint:** `GET /api/last-30-days?status=`

**Pipeline Stages:** `$match` (date range) → `$group` (compound _id) → `$sort`

```js
const thirtyDaysAgo = new Date();
thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

Complaint.aggregate([
  { $match: { createdAt: { $gte: thirtyDaysAgo }, ...(status && { status }) } },
  { $group: {
      _id:   { day: { $dayOfMonth: "$createdAt" }, month: { $month: "$createdAt" } },
      total: { $sum: 1 }
  }},
  { $sort: { "_id.month": 1, "_id.day": 1 } }
])
```

**Concepts used:** Date range `$match`, compound `_id` grouping, `$dayOfMonth`, multi-field sort

---

### 5️⃣ City Volume
**Endpoint:** `GET /api/city-volume?status=`

**Pipeline Stages:** `[$match]` → `$group` → `$sort`

```js
Complaint.aggregate([
  ...(status ? [{ $match: { status } }] : []),
  { $group: { _id: "$city", count: { $sum: 1 } } },
  { $sort:  { count: -1 } }
])
```

**Concepts used:** Group by string field, descending sort

---

### 6️⃣ Avg Resolution Time
**Endpoint:** `GET /api/avg-resolution`

**Pipeline Stages:** `$match` → `$project` (arithmetic) → `$group` (avg) → `$sort`

```js
Complaint.aggregate([
  { $match: { status: "resolved" } },
  { $project: {
      category: 1,
      hours: { $divide: [{ $subtract: ["$resolvedAt", "$createdAt"] }, 3600000] }
  }},
  { $group: {
      _id:      "$category",
      avgHours: { $avg: "$hours" }
  }},
  { $sort: { avgHours: 1 } }
])
```

**Concepts used:** `$subtract` on dates, `$divide`, `$avg` accumulator, `$project` for computed fields

---

### 7️⃣ City + Status Breakdown (Advanced)
**Endpoint:** `GET /api/city-status`

**Pipeline Stages:** `$group` (level 1) → `$group` (level 2, nested push)

```js
Complaint.aggregate([
  { $group: {
      _id:   { city: "$city", status: "$status" },
      count: { $sum: 1 }
  }},
  { $group: {
      _id:      "$_id.city",
      statuses: { $push: { status: "$_id.status", count: "$count" } }
  }}
])
```

**Concepts used:** Two-level `$group`, `$push` accumulator, nested document output

---

## 🔌 API Reference

| Method | Endpoint                          | Description                          | Supports Filter    |
|--------|-----------------------------------|--------------------------------------|--------------------|
| GET    | `/api/dashboard-summary`          | Total, resolved, pending, open count | ✅ `?status=`      |
| GET    | `/api/category-stats`             | Complaints grouped by category       | ✅ `?status=`      |
| GET    | `/api/monthly-trend`              | Complaints per month                 | ✅ `?status=`      |
| GET    | `/api/last-30-days`               | Daily complaints (last 30 days)      | ✅ `?status=`      |
| GET    | `/api/city-volume`                | Complaints grouped by city           | ✅ `?status=`      |
| GET    | `/api/avg-resolution`             | Avg resolution hours by category     | ❌ (resolved only) |
| GET    | `/api/city-status`                | City × status breakdown              | ❌                 |
| GET    | `/api/category-by-status/:status` | Category stats by status param       | via param          |

---

## 📊 Dashboard Features

- **Summary Cards** — Total, Open, Pending, Resolved, Resolution Rate %
- **Category Bar Chart** — Which complaint types are most common
- **Category Pie Chart** — Proportional share per category
- **Monthly Line Chart** — Complaint volume trends over months
- **Last 30 Days Line Chart** — Daily complaint activity
- **City Horizontal Bar** — Top cities by complaint volume
- **Avg Resolution Bar** — Which categories take longest to resolve
- **Status Filter** — One click filters ALL charts simultaneously via `?status=` query param

---

## 🚀 Setup & Run

### Prerequisites
- Node.js v18+
- MongoDB Atlas account (or local MongoDB)

### Backend

```bash
cd backend
npm install
```

Create `.env`:
```env
MONGO_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<dbname>
PORT=5000
```

```bash
node index.js
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

---

## 🗃️ Complaint Schema

```js
{
  title:       String,
  description: String,
  category:    String,   // "internet", "water", "electricity", "service"
  status:      String,   // "open" | "pending" | "resolved"
  city:        String,
  createdAt:   Date,
  resolvedAt:  Date      // populated when status → "resolved"
}
```

---

## 🧩 Key Learning — Pipeline Concepts Used

| Pipeline Stage | Used For                                          |
|----------------|---------------------------------------------------|
| `$match`       | Filter by status, date range                      |
| `$group`       | Aggregate by category, city, month, day           |
| `$project`     | Compute new fields (hours, resolutionRate)        |
| `$sort`        | Order results ascending/descending                |
| `$push`        | Build nested arrays (city-status breakdown)       |
| `$sum`         | Count documents, conditional counting             |
| `$avg`         | Average resolution hours                          |
| `$cond`        | Conditional sum (open vs resolved vs pending)     |
| `$subtract`    | Date arithmetic (resolvedAt - createdAt)          |
| `$divide`      | Convert milliseconds → hours                      |
| `$multiply`    | Compute percentage                                |
| `$round`       | Round resolution rate to 1 decimal                |
| `$month`       | Extract month from Date field                     |
| `$dayOfMonth`  | Extract day from Date field                       |

---

## 🔒 Common Issues

| Error | Fix |
|-------|-----|
| `ESERVFAIL` on connect | Check Atlas IP Whitelist → Allow `0.0.0.0/0` |
| Charts blank | Verify `dataKey` matches actual MongoDB field names (`_id`, not `category`) |
| Filter not working | Ensure status values are lowercase (`open`, not `Open`) |
| `resolvedAt` null | Only complaints with `status: "resolved"` appear in avg resolution |

---

## 👨‍💻 Author

Built as a learning project to implement and understand **MongoDB Aggregation Pipelines** in a real full-stack application.

---

> **Golden Rule:** `Frontend dataKey === Backend aggregation output key` — always.
