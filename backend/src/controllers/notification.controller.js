import { Notification } from "../models/notification.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import mongoose from "mongoose";

const getNotifications = asyncHandler(async (req, res, next) => {
    const userId = req.user._id;

    const notifications = await Notification.find({ recipient: userId })
        .sort({ createdAt: -1 })
        .populate("sender", "fullname username profilePicture")
        .populate("post", "content image");

    return res
        .status(200)
        .json(new ApiResponse(200, notifications, "Notifications fetched successfully"));
});

const markNotificationAsRead = asyncHandler(async (req, res, next) => {
    const { notificationId } = req.params;
    const userId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(notificationId)) {
        throw new ApiError(400, "Invalid notification ID");
    }

    const notification = await Notification.findOne({
        _id: notificationId,
        recipient: userId,
    });

    if (!notification) {
        throw new ApiError(404, "Notification not found");
    }

    notification.read = true;
    await notification.save();

    return res
        .status(200)
        .json(new ApiResponse(200, notification, "Notification marked as read"));
});

const markAllNotificationsAsRead = asyncHandler(async (req, res, next) => {
    const userId = req.user._id;

    await Notification.updateMany(
        { recipient: userId, read: false },
        { $set: { read: true } }
    );

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "All notifications marked as read"));
});

export { getNotifications, markNotificationAsRead, markAllNotificationsAsRead };
