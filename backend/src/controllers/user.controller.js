import { User } from "../models/user.model.js";
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import { uploadOnCloudinay } from "../utils/uploadOnCloudinary.js";

const generateAccessAndRefreshTokens = async (userId) => {
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false })

        return { accessToken, refreshToken }


    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating referesh and access token")
    }
}

const userRegister = asyncHandler(async (req, res, next) => {
    const { fullname, username, password, email } = req.body;
    if (!fullname || !username || !password || !email) throw new ApiError(400, "All field are required!");
    const profilePicturePath = req.file?.path;
    if (!profilePicturePath) throw new ApiError(400, "profile picture is required!");

    const newUsername = username.split(" ").join("_");

    const isUserNameTaken = await User.findOne({ newUsername });
    if (isUserNameTaken) throw new ApiError(401, "Username is taken");
    const user = await User.findOne({ email });
    if (user) throw new ApiError(400, "Email is already registed");

    const profilePicture = await uploadOnCloudinay(profilePicturePath);

    const newUser = await User.create({ fullname, username: newUsername, password, email, profilePicture });
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

const userLoging = asyncHandler(async (req, res, next) => {
    const { emailOrUsername, password } = req.body;

    if (!emailOrUsername || !password) throw new ApiError(400, "Email and password are required!");

    const user = await User.findOne({ $or: [{ email: emailOrUsername }, { username: emailOrUsername }] });

    if (!user) throw new ApiError(401, "Invalid email or password");

    const isPasswordValid = await user.isCorrectPassword(password);
    if (!isPasswordValid) throw new ApiError(401, "Invalid email or password");

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                200,
                {
                    user: loggedInUser, accessToken, refreshToken
                },
                "User logged In Successfully"
            )
        )

})

const getCurrentUser = asyncHandler(async (req, res, next) => {
    const userId = req.user?._id;
    const user = await findById(userId);
    if (!user) throw new ApiError(400, "User not found");

    return res.status(200).json(new ApiResponse(
        200,
        user,
        "User fetched successfully"
    ));
});

const getUserProfile = asyncHandler(async (req, res, next) => {
    // first find out if the same account
    // if same then just send the account info
    // if not same fetch target user info
    // if target user is not private then send profile
    // if current user is following the target user then send the profile
    // check if follow request is already found then show pending, if not then show follow button
    // if not all the check does not match then send error that unauthorized

    const currentUserId = req.user?._id;
    const currentUserUserName = req.user?.username;
    const targetUserIdOrUsername = req.params.userId;
    if (!targetUserIdOrUsername) throw new ApiError(400, "Username is required");



    const isSameAccount = currentUserId.toString() === targetUserIdOrUsername.toString() || currentUserUserName === targetUserIdOrUsername;

    if (isSameAccount) {
        const profile = await User.aggregate([
            {
                $match: {
                    $or: [{ _id: targetUserIdOrUsername }, { username: targetUserIdOrUsername?.toLowerCase() }]
                }
            },
            {
                $lookup: {
                    from: "follow",
                    localField: "_id",
                    foreignField: "following",
                    as: "followers"
                }
            },
            {
                $lookup: {
                    from: "follow",
                    localField: "_id",
                    foreignField: "follower",
                    as: "following"
                }
            },
            {
                $addFields: {
                    followersCound: {
                        $size: "$followers"
                    },
                    followingCound: {
                        $size: "$following"
                    },
                    isFollowing: {
                        $cond: {
                            if: { $in: [req.user?._id, "$followers.followers"] },
                            then: true,
                            else: false
                        }
                    }
                }
            },
            {
                $project: {
                    fullName: 1,
                    username: 1,
                    subscribersCount: 1,
                    channelsSubscribedToCount: 1,
                    isSubscribed: 1,
                    avatar: 1,
                    coverImage: 1,
                    email: 1

                }
            }
        ])

        if (!profile) throw new ApiError(400, "User not found");

        res.status(200).json(new ApiResponse(200, profile, "User profile fetched successfully"));
    }

    const currentUser = await findById(currentUserId);
    const targetUser = await find({ $or: [{ _id: targetUserIdOrUsername }, { username: targetUserIdOrUsername }] });

    if (!currentUser) throw new ApiError(400, "Unauthorized access");
    if (!targetUser) throw new ApiError(400, "Requested user not found");

    const isFollowing = await Follow.findOne({ follower: currentUserId, following: targetUserIdOrUsername });
    if (targetUser.isPrivateAcoount && !isFollowing) throw new ApiError(400, "This account is private");

    return res.status(200).json(new ApiResponse(
        200,
        targetUser,
        "User fetched successfully"
    ));
});

const updateAccountDetails = asyncHandler(async (req, res, next) => {
    const { fullname, email, username } = req.body;

    if (!fullname || !email || !username) throw new ApiError(400, "All fields are required")

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                fullname,
                email,
                username
            }
        },
        { new: true }

    ).select("-password");

    return res.status(200).json(new ApiResponse(200, user, "Account details updated successfully"));
});

const changeCurrentPassword = asyncHandler(async (req, res) => {
    const { oldPassword, newPassword } = req.body

    const user = await User.findById(req.user?._id);
    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);

    if (!isPasswordCorrect) throw new ApiError(400, "Invalid old password");

    user.password = newPassword
    await user.save({ validateBeforeSave: false });

    return res.status(200).json(new ApiResponse(200, {}, "Password changed successfully"));
});

export { userRegister, userLoging, getCurrentUser, getUserProfile, updateAccountDetails, changeCurrentPassword };