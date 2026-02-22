import prisma from "@/lib/prisma";
import { RecipientRole, NotificationType } from "@prisma/client";

/**
 * Create a notification
 */
export async function createNotification(
  recipientId: number,
  recipientRole: RecipientRole,
  title: string,
  message: string,
  type: NotificationType = "info"
) {
  // Validate recipient role
  if (!["student", "professor"].includes(recipientRole)) {
    throw new Error("Invalid recipient role");
  }

  // Validate type
  if (!["info", "success", "warning", "error"].includes(type)) {
    throw new Error("Invalid notification type");
  }

  const notification = await prisma.notification.create({
    data: {
      recipientId,
      recipientRole,
      title,
      message,
      type,
      read: false,
    },
  });

  return notification;
}

/**
 * Get notifications by recipient
 */
export async function getNotificationsByRecipient(
  recipientId: number,
  recipientRole: RecipientRole,
  unreadOnly = false
) {
  return prisma.notification.findMany({
    where: {
      recipientId,
      recipientRole,
      ...(unreadOnly ? { read: false } : {}),
    },
    orderBy: { createdAt: "desc" },
  });
}

/**
 * Mark a notification as read
 */
export async function markNotificationAsRead(
  notificationId: number,
  recipientId: number
) {
  const result = await prisma.notification.updateMany({
    where: {
      id: notificationId,
      recipientId,
    },
    data: {
      read: true,
      readAt: new Date(),
    },
  });

  if (result.count === 0) {
    throw new Error("Notification not found or unauthorized");
  }
}

/**
 * Mark all notifications as read for a user
 */
export async function markAllNotificationsAsRead(
  recipientId: number,
  recipientRole: RecipientRole
) {
  await prisma.notification.updateMany({
    where: {
      recipientId,
      recipientRole,
      read: false,
    },
    data: {
      read: true,
      readAt: new Date(),
    },
  });
}

/**
 * Delete a notification
 */
export async function deleteNotification(
  notificationId: number,
  recipientId: number
) {
  const result = await prisma.notification.deleteMany({
    where: {
      id: notificationId,
      recipientId,
    },
  });

  if (result.count === 0) {
    throw new Error("Notification not found or unauthorized");
  }
}

/**
 * Get unread notification count
 */
export async function getUnreadNotificationCount(
  recipientId: number,
  recipientRole: RecipientRole
) {
  return prisma.notification.count({
    where: {
      recipientId,
      recipientRole,
      read: false,
    },
  });
}

/**
 * Notify professor when a student submits a weekly report
 */
export async function notifyNewReport(
  professorId: number,
  studentName: string
) {
  const title = "📝 Weekly Report Submitted";
  const message = `${studentName} submitted a weekly report`;
  return createNotification(professorId, "professor", title, message, "info");
}
