import { Notification } from "../models/notification.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

const createNotification = asyncHandler(async (recipientId, senderId, type, postId = null) => {
    const notification = await Notification.create({
        recipient: recipientId,
        sender: senderId,
        type,
        post: postId
    });
    return notification;
});

const getNotifications = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    
    const notifications = await Notification.find({ recipient: userId })
        .sort({ createdAt: -1 })
        .populate("sender", "username fullname profilePicture")
        .populate("post", "content image")
        .limit(50);

    return res.status(200).json(
        new ApiResponse(200, notifications, "Notifications fetched successfully")
    );
});

const markNotificationAsRead = asyncHandler(async (req, res) => {
    const notificationId = req.params.notificationId;
    
    const notification = await Notification.findByIdAndUpdate(
        notificationId,
        { read: true },
        { new: true }
    );

    if (!notification) {
        throw new ApiError(404, "Notification not found");
    }

    return res.status(200).json(
        new ApiResponse(200, notification, "Notification marked as read")
    );
});

const markAllNotificationsAsRead = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    
    await Notification.updateMany(
        { recipient: userId, read: false },
        { read: true }
    );

    return res.status(200).json(
        new ApiResponse(200, {}, "All notifications marked as read")
    );
});

export {
    createNotification,
    getNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead
}; 