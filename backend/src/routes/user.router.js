import express from "express";
import isLoggedIn from "../middlewares/isLoggedIn.middleware.js";
import { userRegister, userLogin, getCurrentUser, getUserProfile, updateAccountDetails, changeCurrentPassword, userFollowUnfollow, getUserFollowers, getUserFollowing } from "../controllers/user.controller.js";
import {upload} from "../middlewares/multer.middleware.js";
const router = express.Router();

router.post("/register", upload.single("profilePicture"), userRegister);
router.post("/login", userLogin);

router.get("/getCurrentUser", isLoggedIn, getCurrentUser);

router.get("/getUserProfile/:userIdentifier", isLoggedIn, getUserProfile);
router.put("/updateAccountDetails", isLoggedIn, updateAccountDetails);
router.put("/changeCurrentPassword", isLoggedIn, changeCurrentPassword);

router.post("/followUnfollow/:targetUserId", isLoggedIn, userFollowUnfollow);

router.get("/getFollowers/:userIdentifier", isLoggedIn, getUserFollowers);
router.get("/getFollowing/:userIdentifier", isLoggedIn, getUserFollowing);

// export default router;