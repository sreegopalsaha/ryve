import express from "express";
import { createOrGetChatRoom, sendMessage, getChatMessages, getAllChatRooms } from "../controllers/message.controller.js";
import isLoggedIn from "../middlewares/isLoggedIn.middleware.js";

const router = express.Router();

// Specific routes first
router.route("/send").post(isLoggedIn, sendMessage); // To send a message
router.route("/all").get(isLoggedIn, getAllChatRooms); // To get all chat rooms for a user
router.route("/messages/:chatRoomId").get(isLoggedIn, getChatMessages); // To get chat history

// Parameterized routes last
router.route("/:userIdentifier").post(isLoggedIn, createOrGetChatRoom); // To create or get a chat room

export default router; 