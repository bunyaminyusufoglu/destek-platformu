import User from "../models/User.js";
import SupportRequest from "../models/SupportRequest.js";
import Offer from "../models/Offer.js";
import Message from "../models/Message.js";
import Settings from "../models/Settings.js";
import bcrypt from "bcryptjs";

// Admin Dashboard İstatistikleri
export const getDashboardStats = async (req, res) => {
  try {
    // Son 30 günün tarihi
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Tüm sorguları paralel olarak çalıştır
    const [
      totalUsers,
      totalExperts,
      totalAdmins,
      totalRequests,
      totalOffers,
      totalMessages,
      recentUsers,
      recentRequests,
      recentOffers,
      pendingRequests,
      activeRequests,
      completedRequests
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ isExpert: true }),
      User.countDocuments({ isAdmin: true }),
      SupportRequest.countDocuments(),
      Offer.countDocuments(),
      Message.countDocuments(),
      User.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
      SupportRequest.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
      Offer.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
      SupportRequest.countDocuments({ status: 'pending' }),
      SupportRequest.countDocuments({ status: 'active' }),
      SupportRequest.countDocuments({ status: 'completed' })
    ]);

    res.json({
      users: {
        total: totalUsers,
        experts: totalExperts,
        admins: totalAdmins,
        recent: recentUsers
      },
      requests: {
        total: totalRequests,
        pending: pendingRequests,
        active: activeRequests,
        completed: completedRequests,
        recent: recentRequests
      },
      offers: {
        total: totalOffers,
        recent: recentOffers
      },
      messages: {
        total: totalMessages
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Tüm kullanıcıları getir
export const getAllUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Kullanıcıları ve toplam sayıyı paralel olarak getir
    const [users, total] = await Promise.all([
      User.find({}, { password: 0 })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      User.countDocuments()
    ]);

    res.json({
      users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Kullanıcı detaylarını getir
export const getUserById = async (req, res) => {
  try {
    // Kullanıcı, talepler ve teklifleri paralel olarak getir
    const [user, userRequests, userOffers] = await Promise.all([
      User.findById(req.params.id, { password: 0 }),
      SupportRequest.find({ user: req.params.id }),
      Offer.find({ expert: req.params.id })
    ]);
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      user,
      requests: userRequests,
      offers: userOffers
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Kullanıcı güncelle
export const updateUser = async (req, res) => {
  try {
    const { name, email, isUser, isExpert, isAdmin, skills } = req.body;
    
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Email değişikliği kontrolü
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: "Email already exists" });
      }
    }

    // Admin yetkisini sadece adminler değiştirebilir ve en az 1 admin kalmalı
    if (isAdmin !== undefined && !isAdmin) {
      const adminCount = await User.countDocuments({ isAdmin: true });
      if (adminCount <= 1 && user.isAdmin) {
        return res.status(400).json({ message: "Cannot remove last admin" });
      }
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { name, email, isUser, isExpert, isAdmin, skills },
      { new: true, select: '-password' }
    );

    res.json({ message: "User updated successfully", user: updatedUser });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Kullanıcı sil
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Son admin silinmesin
    if (user.isAdmin) {
      const adminCount = await User.countDocuments({ isAdmin: true });
      if (adminCount <= 1) {
        return res.status(400).json({ message: "Cannot delete last admin" });
      }
    }

    // İlişkili verileri de sil
    await SupportRequest.deleteMany({ user: req.params.id });
    await Offer.deleteMany({ expert: req.params.id });
    await Message.deleteMany({ 
      $or: [
        { sender: req.params.id },
        { receiver: req.params.id }
      ]
    });

    await User.findByIdAndDelete(req.params.id);

    res.json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Kullanıcı şifresini sıfırla
export const resetUserPassword = async (req, res) => {
  try {
    const { newPassword } = req.body;
    
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    await User.findByIdAndUpdate(req.params.id, { password: hashedPassword });

    res.json({ message: "Password reset successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Tüm destek taleplerini getir
export const getAllSupportRequests = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const status = req.query.status;

    const filter = status ? { status } : {};
    
    // Talepleri ve toplam sayıyı paralel olarak getir
    const [requests, total] = await Promise.all([
      SupportRequest.find(filter)
        .populate('user', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      SupportRequest.countDocuments(filter)
    ]);

    res.json({
      requests,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Destek talebini güncelle
export const updateSupportRequest = async (req, res) => {
  try {
    const { status, priority } = req.body;
    
    const request = await SupportRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ message: "Support request not found" });
    }

    const updatedRequest = await SupportRequest.findByIdAndUpdate(
      req.params.id,
      { status, priority },
      { new: true }
    ).populate('user', 'name email');

    res.json({ message: "Support request updated successfully", request: updatedRequest });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Destek talebini sil
export const deleteSupportRequest = async (req, res) => {
  try {
    const request = await SupportRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ message: "Support request not found" });
    }

    // İlişkili teklifleri ve mesajları da sil
    await Offer.deleteMany({ supportRequest: req.params.id });
    await Message.deleteMany({ conversation: req.params.id });
    await SupportRequest.findByIdAndDelete(req.params.id);

    res.json({ message: "Support request deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Raporlar - Detaylı istatistikler
export const getReports = async (req, res) => {
  try {
    const { period = '30d', type = 'overview' } = req.query;
    
    // Tarih aralığını hesapla
    let startDate = new Date();
    switch (period) {
      case '7d':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(startDate.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(startDate.getDate() - 90);
        break;
      case '1y':
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
      default:
        startDate.setDate(startDate.getDate() - 30);
    }

    const endDate = new Date();

    // Genel rapor verileri
    const [
      userStats,
      requestStats,
      offerStats,
      messageStats,
      monthlyData,
      topExperts,
      requestCategories,
      completionRates
    ] = await Promise.all([
      // Kullanıcı istatistikleri
      Promise.all([
        User.countDocuments({ createdAt: { $gte: startDate, $lte: endDate } }),
        User.countDocuments({ isExpert: true, createdAt: { $gte: startDate, $lte: endDate } }),
        User.countDocuments({ isAdmin: true }),
        User.countDocuments()
      ]),
      
      // Talep istatistikleri
      Promise.all([
        SupportRequest.countDocuments({ createdAt: { $gte: startDate, $lte: endDate } }),
        SupportRequest.countDocuments({ status: 'completed', createdAt: { $gte: startDate, $lte: endDate } }),
        SupportRequest.countDocuments({ status: 'open' }),
        SupportRequest.countDocuments({ status: 'in_progress' }),
        SupportRequest.countDocuments()
      ]),
      
      // Teklif istatistikleri
      Promise.all([
        Offer.countDocuments({ createdAt: { $gte: startDate, $lte: endDate } }),
        Offer.countDocuments({ status: 'accepted', createdAt: { $gte: startDate, $lte: endDate } }),
        Offer.countDocuments({ status: 'pending' }),
        Offer.countDocuments()
      ]),
      
      // Mesaj istatistikleri
      Promise.all([
        Message.countDocuments({ createdAt: { $gte: startDate, $lte: endDate } }),
        Message.countDocuments()
      ]),
      
      // Aylık veriler (son 12 ay)
      getMonthlyData(),
      
      // En aktif uzmanlar
      getTopExperts(10),
      
      // Talep kategorileri (skills bazında)
      getRequestCategories(),
      
      // Tamamlanma oranları
      getCompletionRates()
    ]);

    const [newUsers, newExperts, totalAdmins, totalUsers] = userStats;
    const [newRequests, completedRequests, openRequests, inProgressRequests, totalRequests] = requestStats;
    const [newOffers, acceptedOffers, pendingOffers, totalOffers] = offerStats;
    const [newMessages, totalMessages] = messageStats;

    res.json({
      period,
      dateRange: { startDate, endDate },
      summary: {
        users: {
          new: newUsers,
          newExperts,
          totalAdmins,
          totalUsers
        },
        requests: {
          new: newRequests,
          completed: completedRequests,
          open: openRequests,
          inProgress: inProgressRequests,
          total: totalRequests,
          completionRate: totalRequests > 0 ? ((completedRequests / totalRequests) * 100).toFixed(1) : 0
        },
        offers: {
          new: newOffers,
          accepted: acceptedOffers,
          pending: pendingOffers,
          total: totalOffers,
          acceptanceRate: totalOffers > 0 ? ((acceptedOffers / totalOffers) * 100).toFixed(1) : 0
        },
        messages: {
          new: newMessages,
          total: totalMessages
        }
      },
      charts: {
        monthlyData,
        topExperts,
        requestCategories,
        completionRates
      }
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Admin Settings - Get
export const getSettings = async (req, res) => {
  try {
    const doc = await Settings.findOne();
    if (!doc) {
      const created = await Settings.create({});
      return res.json(created);
    }
    res.json(doc);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Admin Settings - Update
export const updateSettings = async (req, res) => {
  try {
    const { platformName, supportEmail, maintenanceMode, seo } = req.body;

    const update = {};
    if (platformName !== undefined) update.platformName = platformName;
    if (supportEmail !== undefined) update.supportEmail = supportEmail;
    if (maintenanceMode !== undefined) update.maintenanceMode = maintenanceMode;
    if (seo !== undefined) {
      update.seo = {
        ...(seo.title !== undefined ? { title: seo.title } : {}),
        ...(seo.description !== undefined ? { description: seo.description } : {}),
        ...(seo.keywords !== undefined ? { keywords: seo.keywords } : {}),
        ...(seo.robots !== undefined ? { robots: seo.robots } : {}),
      };
    }

    const doc = await Settings.findOneAndUpdate({}, update, { upsert: true, new: true, setDefaultsOnInsert: true });
    res.json({ message: "Settings updated", settings: doc });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Offer Approval - Get pending offers
export const getPendingOffers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const [offers, total] = await Promise.all([
      Offer.find({ adminApprovalStatus: "pending" })
        .populate("expert", "name email skills")
        .populate("supportRequest", "title budget deadline user")
        .populate("supportRequest.user", "name email")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Offer.countDocuments({ adminApprovalStatus: "pending" })
    ]);

    res.json({
      offers,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Offer Approval - Approve offer
export const approveOffer = async (req, res) => {
  try {
    const { offerId } = req.params;
    
    const offer = await Offer.findById(offerId);
    if (!offer) {
      return res.status(404).json({ message: "Teklif bulunamadı" });
    }

    if (offer.adminApprovalStatus !== "pending") {
      return res.status(400).json({ message: "Bu teklif zaten işleme alınmış" });
    }

    offer.adminApprovalStatus = "approved";
    offer.status = "admin_approved";
    offer.adminApprovedAt = new Date();
    offer.adminApprovedBy = req.user.id;
    await offer.save();

    res.json({ message: "Teklif onaylandı", offer });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Offer Approval - Reject offer
export const rejectOffer = async (req, res) => {
  try {
    const { offerId } = req.params;
    
    const offer = await Offer.findById(offerId);
    if (!offer) {
      return res.status(404).json({ message: "Teklif bulunamadı" });
    }

    if (offer.adminApprovalStatus !== "pending") {
      return res.status(400).json({ message: "Bu teklif zaten işleme alınmış" });
    }

    offer.adminApprovalStatus = "rejected";
    offer.status = "admin_rejected";
    offer.adminRejectedAt = new Date();
    offer.adminApprovedBy = req.user.id;
    await offer.save();

    res.json({ message: "Teklif reddedildi", offer });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Support Request Approval - Get pending requests
export const getPendingSupportRequests = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const [requests, total] = await Promise.all([
      SupportRequest.find({ adminApprovalStatus: "pending" })
        .populate("user", "name email")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      SupportRequest.countDocuments({ adminApprovalStatus: "pending" })
    ]);

    res.json({
      requests,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Support Request Approval - Approve request
export const approveSupportRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    
    const request = await SupportRequest.findById(requestId);
    if (!request) {
      return res.status(404).json({ message: "Destek talebi bulunamadı" });
    }

    if (request.adminApprovalStatus !== "pending") {
      return res.status(400).json({ message: "Bu talep zaten işleme alınmış" });
    }

    request.adminApprovalStatus = "approved";
    request.status = "open"; // Admin onaylandıktan sonra "open" durumuna geçer
    request.adminApprovedAt = new Date();
    request.adminApprovedBy = req.user.id;
    await request.save();

    res.json({ message: "Destek talebi onaylandı", request });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Support Request Approval - Reject request
export const rejectSupportRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    
    const request = await SupportRequest.findById(requestId);
    if (!request) {
      return res.status(404).json({ message: "Destek talebi bulunamadı" });
    }

    if (request.adminApprovalStatus !== "pending") {
      return res.status(400).json({ message: "Bu talep zaten işleme alınmış" });
    }

    request.adminApprovalStatus = "rejected";
    request.status = "admin_rejected";
    request.adminRejectedAt = new Date();
    request.adminApprovedBy = req.user.id;
    await request.save();

    res.json({ message: "Destek talebi reddedildi", request });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Yardımcı fonksiyonlar
const getMonthlyData = async () => {
  const months = [];
  const now = new Date();
  
  for (let i = 11; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const nextMonth = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
    
    const [users, requests, offers] = await Promise.all([
      User.countDocuments({ createdAt: { $gte: date, $lt: nextMonth } }),
      SupportRequest.countDocuments({ createdAt: { $gte: date, $lt: nextMonth } }),
      Offer.countDocuments({ createdAt: { $gte: date, $lt: nextMonth } })
    ]);
    
    months.push({
      month: date.toLocaleDateString('tr-TR', { month: 'short', year: 'numeric' }),
      users,
      requests,
      offers
    });
  }
  
  return months;
};

const getTopExperts = async (limit = 10) => {
  const experts = await Offer.aggregate([
    {
      $match: { status: 'accepted' }
    },
    {
      $group: {
        _id: '$expert',
        totalOffers: { $sum: 1 },
        totalEarnings: { $sum: '$proposedPrice' }
      }
    },
    {
      $lookup: {
        from: 'users',
        localField: '_id',
        foreignField: '_id',
        as: 'expertInfo'
      }
    },
    {
      $unwind: '$expertInfo'
    },
    {
      $project: {
        name: '$expertInfo.name',
        email: '$expertInfo.email',
        totalOffers: 1,
        totalEarnings: 1
      }
    },
    {
      $sort: { totalOffers: -1 }
    },
    {
      $limit: limit
    }
  ]);
  
  return experts;
};

const getRequestCategories = async () => {
  const categories = await SupportRequest.aggregate([
    { $unwind: '$skills' },
    {
      $group: {
        _id: '$skills',
        count: { $sum: 1 },
        avgBudget: { $avg: '$budget' }
      }
    },
    {
      $sort: { count: -1 }
    },
    {
      $limit: 10
    }
  ]);
  
  return categories;
};

const getCompletionRates = async () => {
  const rates = await SupportRequest.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);
  
  return rates;
};

