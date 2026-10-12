import Notification from "../models/Notification.js";

// Une notification appartient à un rôle, et éventuellement à un utilisateur précis
const ownFilter = (user) => ({
  recipientRole: user.role,
  $or: [{ recipientUser: null }, { recipientUser: user._id }],
});

// GET /api/notifications — toutes les non lues + les 5 dernières lues
export const listNotifications = async (req, res) => {
  try {
    const base = ownFilter(req.user);

    const unread = await Notification.find({ ...base, read: false }).sort({ createdAt: -1 });
    const readOnes = await Notification.find({ ...base, read: true })
      .sort({ createdAt: -1 })
      .limit(5);

    const notifications = [...unread, ...readOnes].sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );

    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PATCH /api/notifications/:id/read — uniquement ses propres notifications
export const markAsRead = async (req, res) => {
  try {
    const notif = await Notification.findOne({ _id: req.params.id, ...ownFilter(req.user) });
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
    await Notification.updateMany({ ...ownFilter(req.user), read: false }, { read: true });
    res.json({ message: "Toutes les notifications marquées comme lues" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};