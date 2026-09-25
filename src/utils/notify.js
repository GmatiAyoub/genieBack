import Notification from "../models/Notification.js";

export const notifyAdmins = async (type, message, link = null) => {
  await Notification.create({ recipientRole: "admin", recipientUser: null, type, message, link });
};

export const notifyContributor = async (userId, type, message, link = null) => {
  await Notification.create({ recipientRole: "contributeur", recipientUser: userId, type, message, link });
};