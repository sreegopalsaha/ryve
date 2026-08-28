import mongoose from "mongoose";
import { Conversation } from "../models/conversation.model.js";
import { Message } from "../models/message.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import { sendToUser } from "../services/websocket.service.js";

export const getOrCreateConversation = asyncHandler(async (req, res) => {
    const { targetUserId } = req.params;
    const currentUserId = req.user._id;

    if (targetUserId === currentUserId.toString()) {
        throw new ApiError(400, "You cannot message yourself");
    }

    const targetUser = await User.findById(targetUserId);
    if (!targetUser) {
        throw new ApiError(404, "User not found");
    }

    let conversation = await Conversation.findOne({
        participants: { $all: [currentUserId, targetUserId], $size: 2 }
    }).populate("participants", "fullname username profilePicture isPrivateAccount");

    if (!conversation) {
        conversation = await Conversation.create({
            participants: [currentUserId, targetUserId]
        });
        conversation = await conversation.populate("participants", "fullname username profilePicture isPrivateAccount");
    }

    return res.status(200).json(new ApiResponse(200, conversation, "Conversation fetched successfully"));
});

export const getConversations = asyncHandler(async (req, res) => {
    const currentUserId = req.user._id;

    const conversations = await Conversation.find({ participants: currentUserId })
        .populate("participants", "fullname username profilePicture isPrivateAccount")
        .populate("lastMessage")
        .sort({ updatedAt: -1 });

    const conversationsWithUnreadCount = await Promise.all(
        conversations.map(async (conv) => {
            const unreadCount = await Message.countDocuments({
                conversation: conv._id,
                recipient: currentUserId,
                seen: false
            });
            return {
                ...conv.toObject(),
                unreadCount
            };
        })
    );

    return res.status(200).json(new ApiResponse(200, conversationsWithUnreadCount, "Conversations fetched successfully"));
});

export const getMessages = asyncHandler(async (req, res) => {
    const { conversationId } = req.params;
    const currentUserId = req.user._id;

    const conversation = await Conversation.findOne({
        _id: conversationId,
        participants: currentUserId
    });

    if (!conversation) {
        throw new ApiError(404, "Conversation not found or unauthorized");
    }

    const messages = await Message.find({ conversation: conversationId })
        .sort({ createdAt: 1 });

    return res.status(200).json(new ApiResponse(200, messages, "Messages fetched successfully"));
});

export const sendMessage = asyncHandler(async (req, res) => {
    const { conversationId, content } = req.body;
    const currentUserId = req.user._id;

    if (!content || !content.trim()) {
        throw new ApiError(400, "Message content cannot be empty");
    }

    const conversation = await Conversation.findOne({
        _id: conversationId,
        participants: currentUserId
    });

    if (!conversation) {
        throw new ApiError(404, "Conversation not found or unauthorized");
    }

    const recipientId = conversation.participants.find(
        (p) => p.toString() !== currentUserId.toString()
    );

    const newMessage = await Message.create({
        conversation: conversationId,
        sender: currentUserId,
        recipient: recipientId,
        content: content.trim(),
        seen: false
    });

    conversation.lastMessage = newMessage._id;
    await conversation.save();

    // Notify recipient
    sendToUser(recipientId, {
        type: "new_message",
        message: newMessage
    });
    // Sync sender's other tabs
    sendToUser(currentUserId, {
        type: "new_message",
        message: newMessage
    });

    return res.status(201).json(new ApiResponse(201, newMessage, "Message sent successfully"));
});

export const markAsSeen = asyncHandler(async (req, res) => {
    const { conversationId } = req.params;
    const currentUserId = req.user._id;

    const conversation = await Conversation.findOne({
        _id: conversationId,
        participants: currentUserId
    });

    if (!conversation) {
        throw new ApiError(404, "Conversation not found or unauthorized");
    }

    await Message.updateMany(
        {
            conversation: conversationId,
            recipient: currentUserId,
            seen: false
        },
        {
            $set: { seen: true, seenAt: Date.now() }
        }
    );

    const senderId = conversation.participants.find(
        (p) => p.toString() !== currentUserId.toString()
    );

    sendToUser(senderId, {
        type: "messages_seen",
        conversationId,
        seenBy: currentUserId
    });
    
    // Also update current user's other tabs
    sendToUser(currentUserId, {
        type: "messages_seen_ack",
        conversationId
    });

    return res.status(200).json(new ApiResponse(200, null, "Messages marked as seen"));
});
