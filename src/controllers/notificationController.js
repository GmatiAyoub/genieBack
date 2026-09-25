import Notification from "../models/Notification.js";

// GET /api/notifications — toutes les non lues + les 5 dernières lues
export const listNotifications = async (req, res) => {
  try {
    const baseFilter = {
      recipientRole: req.user.role,
      $or: [{ recipientUser: null }, { recipientUser: req.user._id }],
    };

    const unread = await Notification.find({ ...baseFilter, read: false }).sort({ createdAt: -1 });
    const readOnes = await Notification.find({ ...baseFilter, read: true })
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

export const markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      {
        recipientRole: req.user.role,
        $or: [{ recipientUser: null }, { recipientUser: req.user._id }],
        read: false,
      },
      { read: true }
    );
    res.json({ message: "Toutes les notifications marquées comme lues" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};