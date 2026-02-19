import express from "express";
import {
  getComplaints,
  getDashboardSummary,
  getCategoryStats,
  getCityStatusStats,
  getCityVolume,
  getMonthlyTrend,
  getLast30DaysTrend,
  getAvgResolution,
  getCategoryByStatus
} from "../controllers/complaintController.js";

const router = express.Router();

router.get("/complaints",           getComplaints);
router.get("/dashboard-summary",    getDashboardSummary);
router.get("/category-stats",       getCategoryStats);
router.get("/city-status",          getCityStatusStats);   
router.get("/city-volume",          getCityVolume);        
router.get("/monthly-trend",        getMonthlyTrend);
router.get("/last-30-days",         getLast30DaysTrend);
router.get("/avg-resolution",       getAvgResolution);
router.get("/category-by-status/:status", getCategoryByStatus);

export default router;