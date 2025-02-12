import express from "express";
import isLoggedIn from "../middlewares/isLoggedIn.middleware.js";
import { getFeedPosts, getUserPosts, postLikeToggle, createPost, deletePost, updatePost, getPost, getPostComments } from "../controllers/post.controller.js";
import {upload} from "../middlewares/multer.middleware.js";
const router = express.Router();

router.post("/createPost", upload.single("image"), isLoggedIn, createPost);

router.get("/deletePost/:postId", isLoggedIn, deletePost);

router.post("/updatePost", isLoggedIn, updatePost);

router.get("/getfeedPosts", isLoggedIn, getFeedPosts);

router.get("/getUserPosts/:userIdentifier", isLoggedIn, getUserPosts);

router.get("/get/:postId", isLoggedIn, getPost);

router.get("/postLikeToggle/:postId", isLoggedIn, postLikeToggle);

router.get("/getPostComments/:postId", isLoggedIn, getPostComments);

export default router;