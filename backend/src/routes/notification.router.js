import express from "express";
import isLoggedIn from "../middlewares/isLoggedIn.middleware.js";
import {
    getNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
} from "../controllers/notification.controller.js";

const router = express.Router();

router.get("/", isLoggedIn, getNotifications);
router.patch("/read-all", isLoggedIn, markAllNotificationsAsRead);
router.patch("/:notificationId/read", isLoggedIn, markNotificationAsRead);

export default router;
