import Complaint from "../models/Complaint.js";

/* 🔥 Basic */
export const getComplaints = async (req, res) => {
  try {
    const data = await Complaint.find().limit(50);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/* 🔥 Dashboard Summary — supports ?status= filter */
export const getDashboardSummary = async (req, res) => {
  try {
    const { status } = req.query;
    const matchStage = status ? [{ $match: { status } }] : [];

    const data = await Complaint.aggregate([
      ...matchStage,
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          resolved: {
            $sum: { $cond: [{ $eq: ["$status", "resolved"] }, 1, 0] }
          },
          pending: {
            $sum: { $cond: [{ $eq: ["$status", "pending"] }, 1, 0] }
          },
          open: {
            $sum: { $cond: [{ $eq: ["$status", "open"] }, 1, 0] }
          }
        }
      },
      {
        $project: {
          _id: 0,
          total: 1,
          resolved: 1,
          pending: 1,
          open: 1,
          resolutionRate: {
            $round: [
              { $multiply: [{ $divide: ["$resolved", "$total"] }, 100] },
              1
            ]
          }
        }
      }
    ]);

    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/* 🔥 Category Stats — supports ?status= filter */
export const getCategoryStats = async (req, res) => {
  try {
    const { status } = req.query;
    const matchStage = status ? [{ $match: { status } }] : [];

    const data = await Complaint.aggregate([
      ...matchStage,
      { $group: { _id: "$category", count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/* 🔥 City Volume (replaces getCityStatusStats for chart) — supports ?status= */
export const getCityVolume = async (req, res) => {
  try {
    const { status } = req.query;
    const matchStage = status ? [{ $match: { status } }] : [];

    const data = await Complaint.aggregate([
      ...matchStage,
      { $group: { _id: "$city", count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/* 🔥 City + Status Breakdown (keep for future use) */
export const getCityStatusStats = async (req, res) => {
  try {
    const data = await Complaint.aggregate([
      {
        $group: {
          _id: { city: "$city", status: "$status" },
          count: { $sum: 1 }
        }
      },
      {
        $group: {
          _id: "$_id.city",
          statuses: {
            $push: { status: "$_id.status", count: "$count" }
          }
        }
      }
    ]);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/* 🔥 Monthly Trend — supports ?status= filter */
export const getMonthlyTrend = async (req, res) => {
  try {
    const { status } = req.query;
    const matchStage = status ? [{ $match: { status } }] : [];

    const data = await Complaint.aggregate([
      ...matchStage,
      {
        $group: {
          _id: { $month: "$createdAt" },
          total: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/* 🔥 Last 30 Days Trend — supports ?status= filter */
export const getLast30DaysTrend = async (req, res) => {
  try {
    const { status } = req.query;
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const matchCondition = status
      ? { createdAt: { $gte: thirtyDaysAgo }, status }
      : { createdAt: { $gte: thirtyDaysAgo } };

    const data = await Complaint.aggregate([
      { $match: matchCondition },
      {
        $group: {
          _id: {
            day: { $dayOfMonth: "$createdAt" },
            month: { $month: "$createdAt" }
          },
          total: { $sum: 1 }
        }
      },
      { $sort: { "_id.month": 1, "_id.day": 1 } }
    ]);

    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/* 🔥 Category By Status (param-based, kept for backward compat) */
export const getCategoryByStatus = async (req, res) => {
  try {
    const { status } = req.params;
    const data = await Complaint.aggregate([
      { $match: { status } },
      { $group: { _id: "$category", count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/* 🔥 Avg Resolution Time — supports ?status= filter (only resolved matters here) */
export const getAvgResolution = async (req, res) => {
  try {
    const data = await Complaint.aggregate([
      { $match: { status: "resolved" } },
      {
        $project: {
          category: 1,
          hours: {
            $divide: [
              { $subtract: ["$resolvedAt", "$createdAt"] },
              3600000
            ]
          }
        }
      },
      {
        $group: {
          _id: "$category",
          avgHours: { $avg: "$hours" }
        }
      },
      { $sort: { avgHours: 1 } }
    ]);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};