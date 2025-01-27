import express from "express";
import isLoggedIn from "../middlewares/isLoggedIn.middleware.js";
import { userRegister, userLoging } from "../controllers/user.controller.js";
import {upload} from "../middlewares/multer.middleware.js";
const router = express.Router();

router.get("/", (req, res)=>{
    res.send("i am working");
});

router.post("/register", upload.single("profilePic"), userRegister);
router.post("/login", isLoggedIn, userLoging);

// router.get("getCurrentUser", isLoggedIn, getCurrentUser);
// router.get("/getUser/:targetUserId", isLoggedIn, getUser);

// router.post("/followUnfollow/:targetUserId", isLoggedIn, userFollowUnfollow);

export default router;