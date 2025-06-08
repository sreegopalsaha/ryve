import { ChatRoom } from "../models/chatRoom.model.js";
import { Message } from "../models/message.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import { isValidObjectId } from "mongoose";

const createOrGetChatRoom = asyncHandler(async (req, res, next) => {
    const currentUserId = req.user._id;
    const targetIdentifier = req.params.userIdentifier;

    if (!targetIdentifier) {
        throw new ApiError(400, "Target user identifier is required");
    }

    const targetUser = await User.findOne({
        $or: [
            { username: targetIdentifier.toLowerCase() },
            { _id: isValidObjectId(targetIdentifier) ? targetIdentifier : null }
        ]
    }).select('_id').lean();

    if (!targetUser) {
        throw new ApiError(404, "Target user not found");
    }

    if (currentUserId.toString() === targetUser._id.toString()) {
        throw new ApiError(400, "Cannot create a chat room with yourself");
    }

    let chatRoom = await ChatRoom.findOne({
        participants: { $all: [currentUserId, targetUser._id] }
    }).populate("participants", "username fullname profilePicture");

    if (!chatRoom) {
        chatRoom = await ChatRoom.create({
            participants: [currentUserId, targetUser._id]
        });

        if (!chatRoom) {
            throw new ApiError(500, "Failed to create chat room");
        }

        // Populate the participants after creating the chat room
        chatRoom = await chatRoom.populate("participants", "username fullname profilePicture");
    }

    return res.status(200).json(
        new ApiResponse(200, chatRoom, "Chat room created or fetched successfully")
    );
});

const sendMessage = asyncHandler(async (req, res, next) => {
    const { content, chatRoomId } = req.body;
    const senderId = req.user._id;

    if (!content || !chatRoomId) {
        throw new ApiError(400, "Content and chatRoomId are required");
    }

    if (!isValidObjectId(chatRoomId)) {
        throw new ApiError(400, "Invalid chatRoomId");
    }

    const chatRoom = await ChatRoom.findById(chatRoomId);

    if (!chatRoom) {
        throw new ApiError(404, "Chat room not found");
    }

    if (!chatRoom.participants.includes(senderId)) {
        throw new ApiError(403, "You are not a participant of this chat room");
    }

    const receiverId = chatRoom.participants.find(p => p.toString() !== senderId.toString());

    const message = await Message.create({
        sender: senderId,
        receiver: receiverId,
        content,
        chatRoom: chatRoomId
    });

    if (!message) {
        throw new ApiError(500, "Failed to send message");
    }

    chatRoom.lastMessage = message._id;
    await chatRoom.save({ validateBeforeSave: false });

    // Populate the message with sender and receiver details before emitting
    const populatedMessage = await Message.findById(message._id)
        .populate("sender", "username fullname profilePicture")
        .populate("receiver", "username fullname profilePicture");

    // Emit message via Socket.IO
    req.app.get('io').to(chatRoomId.toString()).emit('message', populatedMessage);

    return res.status(201).json(
        new ApiResponse(201, populatedMessage, "Message sent successfully")
    );
});

const getChatMessages = asyncHandler(async (req, res, next) => {
    const { chatRoomId } = req.params;
    const userId = req.user._id;

    if (!isValidObjectId(chatRoomId)) {
        throw new ApiError(400, "Invalid chatRoomId");
    }

    const chatRoom = await ChatRoom.findById(chatRoomId);

    if (!chatRoom) {
        throw new ApiError(404, "Chat room not found");
    }

    if (!chatRoom.participants.includes(userId)) {
        throw new ApiError(403, "You are not a participant of this chat room");
    }

    const messages = await Message.find({ chatRoom: chatRoomId })
        .populate("sender", "username fullname profilePicture")
        .populate("receiver", "username fullname profilePicture")
        .sort("createdAt");

    return res.status(200).json(
        new ApiResponse(200, messages, "Messages fetched successfully")
    );
});

const getAllChatRooms = asyncHandler(async (req, res, next) => {
    const userId = req.user._id;

    const chatRooms = await ChatRoom.find({
        participants: userId
    })
    .populate({
        path: "participants",
        match: { _id: { $ne: userId } }, // Populate the other participant
        select: "username fullname profilePicture"
    })
    .populate({
        path: "lastMessage",
        select: "content sender receiver createdAt"
    })
    .sort({ updatedAt: -1 }); // Sort by last message time

    // Filter out chat rooms where the other participant is not found
    const filteredChatRooms = chatRooms.filter(room => room.participants.length > 0);

    const formattedChatRooms = filteredChatRooms.map(room => ({
        _id: room._id,
        otherParticipant: room.participants[0],
        lastMessage: room.lastMessage,
        updatedAt: room.updatedAt,
        createdAt: room.createdAt
    }));

    return res.status(200).json(
        new ApiResponse(200, formattedChatRooms, "Chat rooms fetched successfully")
    );
});

export { createOrGetChatRoom, sendMessage, getChatMessages, getAllChatRooms }; 