import express from "express";
import isLoggedIn from "../middlewares/isLoggedIn.middleware.js";
import { userRegister, userLoging, getCurrentUser, getUserProfile, updateAccountDetails, changeCurrentPassword, userFollowUnfollow } from "../controllers/user.controller.js";
import {upload} from "../middlewares/multer.middleware.js";
const router = express.Router();

router.post("/register", upload.single("profilePicture"), userRegister);
router.post("/login", userLoging);

router.get("getCurrentUser", isLoggedIn, getCurrentUser);

router.get("/getUserProfile/:targetUserIdOrUsername", isLoggedIn, getUserProfile);
router.put("/updateAccountDetails", isLoggedIn, updateAccountDetails);
router.put("/changeCurrentPassword", isLoggedIn, changeCurrentPassword);

router.post("/followUnfollow/:targetUserId", isLoggedIn, userFollowUnfollow);

export default router;