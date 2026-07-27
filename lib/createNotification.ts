import Notification, { INotification } from "@/models/Notification";
import mongoose from "mongoose";

type NotificationData = {
  userId: string | mongoose.Types.ObjectId;
  message: string;
  type?: 'security' | 'general';
  link?: string;
};

export const createNotification = async (data: NotificationData): Promise<void> => {
  try {
    await Notification.create(data);
  } catch (error) {
    console.error("Failed to create notification:", error);
    // Depending on the use case, you might want to handle this more gracefully
  }
};