import { User } from "../models/user.model.js";
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import {uploadOnCloudinay} from "../utils/uploadOnCloudinary.js";

const generateAccessAndRefreshTokens = async(userId) =>{
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false })

        return {accessToken, refreshToken}


    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating referesh and access token")
    }
}

const userRegister = asyncHandler(async (req, res, next) => {
    const { fullname, username, password, email } = req.body;
    if (!fullname || !username || !password || !email) throw new ApiError(400, "All field are required!");
    const profilePicturePath = req.file?.path;
    if(!profilePicturePath) throw new ApiError(400, "profile picture is required!");

    const newUsername = username.split(" ").join("_");

    const isUserNameTaken = await User.findOne({ newUsername });
    if (isUserNameTaken) throw new ApiError(401, "Username is taken");
    const user = await User.findOne({ email });
    if (user) throw new ApiError(400, "Email is already registed");

    const profilePicture = await uploadOnCloudinay(profilePicturePath);

    const newUser = await User.create({ fullname, username: newUsername, password, email, profilePicture});
    if (!newUser) throw new ApiError(500, "Error while creating user");

    return res
    .status(201)
    .json(
        new ApiResponse(201, { 
            ...newUser.toObject(), 
            password: undefined,
            refreshToken: undefined
        }, "User created successfully")
    );
});

const userLoging = asyncHandler((req, res, next) => {

});

const userFollow = asyncHandler((req, res, next) => {

});

const userProfile = asyncHandler((req, res, next) => {

});

export { userFollow, userLoging, userRegister, userProfile };