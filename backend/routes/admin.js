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
  deleteSupportRequest,
  getReports,
  getSettings,
  updateSettings,
  getPendingOffers,
  approveOffer,
  rejectOffer,
  getPendingSupportRequests,
  approveSupportRequest,
  rejectSupportRequest
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

// Raporlar
router.get("/reports", getReports);

// Ayarlar
router.get("/settings", getSettings);
router.put("/settings", updateSettings);

// Teklif onaylama
router.get("/offers/pending", getPendingOffers);
router.put("/offers/:offerId/approve", approveOffer);
router.put("/offers/:offerId/reject", rejectOffer);

// Destek talebi onaylama
router.get("/support-requests/pending", getPendingSupportRequests);
router.put("/support-requests/:requestId/approve", approveSupportRequest);
router.put("/support-requests/:requestId/reject", rejectSupportRequest);

export default router;
