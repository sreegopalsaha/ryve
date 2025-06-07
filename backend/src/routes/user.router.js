import express from "express";
import isLoggedIn from "../middlewares/isLoggedIn.middleware.js";
import { 
    userRegister, 
    userLogin, 
    getCurrentUser, 
    getUserProfile, 
    updateAccountDetails, 
    changeCurrentPassword, 
    userFollowUnfollow, 
    getUserFollowers, 
    getUserFollowing, 
    updateUserProfile, 
    togglePrivateAccount,
    getFollowRequests,
    handleFollowRequest 
} from "../controllers/user.controller.js";
import {upload} from "../middlewares/multer.middleware.js";
import { searchUsers } from "../controllers/post.controller.js";

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

router.get("/searchUsers/:searchQuery", isLoggedIn, searchUsers);

router.put("/updateProfile", isLoggedIn, upload.single("profilePicture"), updateUserProfile);

router.put("/togglePrivateAccount", isLoggedIn, togglePrivateAccount);

// Add follow requests routes
router.get("/follow-requests", isLoggedIn, getFollowRequests);
router.post("/handle-follow-request", isLoggedIn, express.json(), handleFollowRequest);

export default router;