import User from "../models/User.js";
import SupportRequest from "../models/SupportRequest.js";
import Offer from "../models/Offer.js";
import Message from "../models/Message.js";
import bcrypt from "bcryptjs";

// Admin Dashboard İstatistikleri
export const getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalExperts = await User.countDocuments({ isExpert: true });
    const totalAdmins = await User.countDocuments({ isAdmin: true });
    const totalRequests = await SupportRequest.countDocuments();
    const totalOffers = await Offer.countDocuments();
    const totalMessages = await Message.countDocuments();

    // Son 30 günün istatistikleri
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentUsers = await User.countDocuments({ createdAt: { $gte: thirtyDaysAgo } });
    const recentRequests = await SupportRequest.countDocuments({ createdAt: { $gte: thirtyDaysAgo } });
    const recentOffers = await Offer.countDocuments({ createdAt: { $gte: thirtyDaysAgo } });

    // Durum bazlı istatistikler
    const pendingRequests = await SupportRequest.countDocuments({ status: 'pending' });
    const activeRequests = await SupportRequest.countDocuments({ status: 'active' });
    const completedRequests = await SupportRequest.countDocuments({ status: 'completed' });

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

    const users = await User.find({}, { password: 0 })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await User.countDocuments();

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
    const user = await User.findById(req.params.id, { password: 0 });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Kullanıcının destek talepleri
    const userRequests = await SupportRequest.find({ userId: req.params.id });
    
    // Kullanıcının teklifleri
    const userOffers = await Offer.find({ expertId: req.params.id });

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
    await SupportRequest.deleteMany({ userId: req.params.id });
    await Offer.deleteMany({ expertId: req.params.id });
    await Message.deleteMany({ 
      $or: [
        { senderId: req.params.id },
        { receiverId: req.params.id }
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
    
    const requests = await SupportRequest.find(filter)
      .populate('userId', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await SupportRequest.countDocuments(filter);

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
    ).populate('userId', 'name email');

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
    await Offer.deleteMany({ requestId: req.params.id });
    await Message.deleteMany({ requestId: req.params.id });
    await SupportRequest.findByIdAndDelete(req.params.id);

    res.json({ message: "Support request deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

