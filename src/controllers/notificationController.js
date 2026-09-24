import Notification from "../models/Notification.js";

// GET /api/notifications (Admin ou Contributeur, selon son rôle)
export const listNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ recipientRole: req.user.role })
      .sort({ createdAt: -1 })
      .limit(30);
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PATCH /api/notifications/:id/read
export const markAsRead = async (req, res) => {
  try {
    const notif = await Notification.findById(req.params.id);
    if (!notif) return res.status(404).json({ message: "Notification introuvable" });
    notif.read = true;
    await notif.save();
    res.json(notif);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// PATCH /api/notifications/read-all
export const markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany({ recipientRole: req.user.role, read: false }, { read: true });
    res.json({ message: "Toutes les notifications marquées comme lues" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};