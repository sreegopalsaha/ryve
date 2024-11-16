import express from "express";
import isLoggedIn from "../middlewares/isLoggedIn.js";
import { userRegister, userLoging, userProfile, userFollow } from "../controllers/userControllers.js";
const router = express.Router();

router.get("/", (req, res)=>{
    res.send("i am working");
});

router.post("/", isLoggedIn, userProfile);
router.post("/register", isLoggedIn, userRegister);
router.post("/login", isLoggedIn, userLoging);
router.post("/follow/", isLoggedIn, userFollow);


export default router;