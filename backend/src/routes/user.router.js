import express from "express";
import isLoggedIn from "../middlewares/isLoggedIn.middleware.js";
import { 
    userRegister, 
    userLogin, 
    getMe, 
    getUserProfile, 
    updateAccountDetails, 
    updateProfilePicture, 
    changeCurrentPassword, 
    userFollowUnfollow, 
    getUserFollowers, 
    getUserFollowing,
    getFollowRequests,
    handleFollowRequest,
    getSuggestedUsers,
    searchUsers,
    checkUsernameAvailability
} from "../controllers/user.controller.js";
import {upload} from "../middlewares/multer.middleware.js";
const router = express.Router();

// Public routes (no auth required)
router.get("/checkUsername/:username", checkUsernameAvailability);
router.post("/register", upload.single("profilePicture"), userRegister);
router.post("/login", userLogin);


router.get("/me", isLoggedIn, getMe);

router.get("/getUserProfile/:userIdentifier", isLoggedIn, getUserProfile);
router.put("/updateAccountDetails", isLoggedIn, updateAccountDetails);
router.put("/updateProfilePicture", isLoggedIn, upload.single("profilePicture"), updateProfilePicture);
router.put("/changeCurrentPassword", isLoggedIn, changeCurrentPassword);

router.post("/followUnfollow/:targetUserId", isLoggedIn, userFollowUnfollow);

router.get("/getFollowers/:userIdentifier", isLoggedIn, getUserFollowers);
router.get("/getFollowing/:userIdentifier", isLoggedIn, getUserFollowing);

router.get("/follow-requests", isLoggedIn, getFollowRequests);
router.post("/handle-follow-request", isLoggedIn, handleFollowRequest);

router.get("/searchUsers/:searchQuery", isLoggedIn, searchUsers);
router.get("/suggestedUsers", isLoggedIn, getSuggestedUsers);

export default router;