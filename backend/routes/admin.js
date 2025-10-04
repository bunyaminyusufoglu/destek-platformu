import express from "express";
import adminMiddleware from "../middleware/adminMiddleware.js";
import {
  getDashboardStats,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  resetUserPassword,
  getAllSupportRequests,
  updateSupportRequest,
  deleteSupportRequest
} from "../controllers/adminController.js";

const router = express.Router();

// Tüm admin route'ları admin middleware ile korunur
router.use(adminMiddleware);

// Dashboard istatistikleri
router.get("/dashboard/stats", getDashboardStats);

// Kullanıcı yönetimi
router.get("/users", getAllUsers);
router.get("/users/:id", getUserById);
router.put("/users/:id", updateUser);
router.delete("/users/:id", deleteUser);
router.put("/users/:id/reset-password", resetUserPassword);

// Destek talepleri yönetimi
router.get("/support-requests", getAllSupportRequests);
router.put("/support-requests/:id", updateSupportRequest);
router.delete("/support-requests/:id", deleteSupportRequest);

export default router;
