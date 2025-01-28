import express from "express";
import isLoggedIn from "../middlewares/isLoggedIn.middleware.js";
import { getUserPosts } from "../controllers/post.controller.js";
import {upload} from "../middlewares/multer.middleware.js";
const router = express.Router();

router.get("/getfeedPosts", isLoggedIn, getFeedPosts);
router.get("/getUserPosts/:targetUserId", isLoggedIn, getUserPosts);

export default router;