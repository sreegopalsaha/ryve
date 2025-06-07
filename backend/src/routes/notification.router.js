import { Router } from "express";
import isLoggedIn from "../middlewares/isLoggedIn.middleware.js";
import {
    getNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead
} from "../controllers/notification.controller.js";

const router = Router();

router.get("/", isLoggedIn, getNotifications);
router.patch("/:notificationId/read", isLoggedIn, markNotificationAsRead);
router.patch("/read-all", isLoggedIn, markAllNotificationsAsRead);

export default router; 