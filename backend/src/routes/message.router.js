import express from "express";
import isLoggedIn from "../middlewares/isLoggedIn.middleware.js";
import {
    getOrCreateConversation,
    getConversations,
    getMessages,
    sendMessage,
    markAsSeen
} from "../controllers/message.controller.js";

const router = express.Router();

router.use(isLoggedIn);

router.get("/conversations", getConversations);
router.get("/conversation/:targetUserId", getOrCreateConversation);
router.get("/history/:conversationId", getMessages);
router.post("/send", sendMessage);
router.patch("/seen/:conversationId", markAsSeen);

export default router;
