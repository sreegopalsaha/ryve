import { User } from "../models/user.model.js";
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import { uploadOnCloudinay } from "../utils/uploadOnCloudinary.js";
import { Follow } from "../models/follow.model.js";
import mongoose, { isValidObjectId } from "mongoose";
import { checkFollowStatus } from "../utils/checkFollowStatus.js";

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
    // if (!profilePicturePath) throw new ApiError(400, "profile picture is required!");

    const newUsername = username.split(" ").join("_");

    const isUserNameTaken = await User.findOne({ username: newUsername });
    if (isUserNameTaken) throw new ApiError(401, "Username is taken");
    const user = await User.findOne({ email });
    if (user) throw new ApiError(400, "Email is already registed");

    let profilePicture;
    if (profilePicturePath) {
        profilePicture = await uploadOnCloudinay(profilePicturePath);
    }
    
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

const userLogin = asyncHandler(async (req, res, next) => {
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
    const currentUserId = req.user._id;
    const targetIdentifier = req.params.targetUserIdOrUsername;

    const targetUser = await User.findOne({
        $or: [
            { username: targetIdentifier.toLowerCase() },
            { _id: isValidObjectId(targetIdentifier) ? targetIdentifier : null }
        ]
    }).select('_id').lean();

    if (!targetUser) throw new ApiError(404, "User not found");

    const isSameAccount = new mongoose.Types.ObjectId(currentUserId).equals(targetUser._id);

    const pipeline = [
        { $match: { _id: targetUser._id } },

        {
            $lookup: {
                from: "follows",
                let: { userId: "$_id" },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $and: [
                                    { $eq: ["$following", "$$userId"] },
                                    { $eq: ["$status", "accepted"] }
                                ]
                            }
                        }
                    }
                ],
                as: "followers"
            }
        },

        {
            $lookup: {
                from: "follows",
                let: { userId: "$_id" },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $and: [
                                    { $eq: ["$follower", "$$userId"] },
                                    { $eq: ["$status", "accepted"] }
                                ]
                            }
                        }
                    }
                ],
                as: "followings"
            }
        },

        ...(!isSameAccount ? [{
            $lookup: {
                from: "follows",
                let: { targetId: "$_id" },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $and: [
                                    { $eq: ["$follower", new mongoose.Types.ObjectId(currentUserId)] },
                                    { $eq: ["$following", "$$targetId"] }
                                ]
                            }
                        }
                    },
                    { $project: { status: 1 } }
                ],
                as: "followStatus"
            }
        }] : []),

        {
            $project: {
                username: 1,
                fullname: 1,
                profilePicture: 1,
                bio: 1,
                location: 1,
                isPrivateAccount: 1,
                createdAt: 1,
                totalFollowers: { $size: "$followers" },
                totalFollowings: { $size: "$followings" },
                followStatus: {
                    $cond: {
                        if: isSameAccount,
                        then: "$$REMOVE",
                        else: {
                            $ifNull: [
                                { $arrayElemAt: ["$followStatus.status", 0] },
                                null
                            ]
                        }
                    }
                }
            }
        }
    ];

    const [profile] = await User.aggregate(pipeline);

    if (!profile) throw new ApiError(404, "User not found");

    res.status(200).json(new ApiResponse(200, profile, "Profile fetched"));
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

const changeCurrentPassword = asyncHandler(async (req, res, next) => {
    const { oldPassword, newPassword } = req.body

    const user = await User.findById(req.user?._id);
    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);

    if (!isPasswordCorrect) throw new ApiError(400, "Invalid old password");

    user.password = newPassword
    await user.save({ validateBeforeSave: false });

    return res.status(200).json(new ApiResponse(200, {}, "Password changed successfully"));
});

const userFollowUnfollow = asyncHandler(async (req, res, next) => {
    const currentUserId = req.user?._id;
    const targetUserId = req.params.targetUserId;
    if (!targetUserId) throw new ApiError(400, "Target user id is required");

    // here isFollowing can be a follow request or a accepted follow

    const isFollowing = await Follow.findOne({ follower: currentUserId, following: targetUserId });
    if (isFollowing) {
        await Follow.findOneAndDelete({ follower: currentUserId, following: targetUserId });
        return res.status(200).json(new ApiResponse(200, { status: "unfollowed" }, "User unfollowed successfully"));
    }

    const targetUser = await User.findById(targetUserId);
    if (!targetUser) throw new ApiError(400, "User not found");

    const isPrivateAcoount = targetUser.isPrivateAccount;

    if (isPrivateAcoount) {
        await Follow.create({ follower: currentUserId, following: targetUserId, status: "pending" });
        return res.status(200).json(new ApiResponse(200, { status: "pending" }, "Follow request sent successfully"));
    }

    await Follow.create({ follower: currentUserId, following: targetUserId, status: "accepted" });
    return res.status(200).json(new ApiResponse(200, { status: "accepted" }, "User followed successfully"));
});

const getUserFollowers = asyncHandler(async (req, res, next) => {
    const currentUser = req.user;
    const targetUserId = req.params.targetUserId;

    if (!currentUser) throw new ApiError(401, "Unauthorized access");
    if (!targetUserId) throw new ApiError(400, "Target user id is required");

    const targetUser = await User.findById(targetUserId);
    if (!targetUser) throw new ApiError(404, "User not found");

    let followStatus = null;
    const isOwner = currentUser._id.toString() === targetUser._id.toString();

    if (!isOwner) {
        followStatus = await checkFollowStatus(currentUser._id, targetUserId);
    }

    const canAccess = isOwner || !targetUser.isPrivateAccount || followStatus === "accepted";
    if (!canAccess) throw new ApiError(403, "Access to followers list denied");

    const pipeline = [
        { $match: { _id: targetUser._id } },
        {
            $lookup: {
                from: "follows",
                let: { userId: "$_id" },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $and: [
                                    { $eq: ["$following", "$$userId"] },
                                    { $eq: ["$status", "accepted"] }
                                ]
                            }
                        }
                    },
                    {
                        $lookup: {
                            from: "users",
                            localField: "follower",
                            foreignField: "_id",
                            as: "followerDetails"
                        }
                    },
                    { $unwind: { path: "$followerDetails", preserveNullAndEmptyArrays: true } },
                    {
                        $project: {
                            _id: "$followerDetails._id",
                            username: "$followerDetails.username",
                            fullname: "$followerDetails.fullname",
                            profilePicture: "$followerDetails.profilePicture"
                        }
                    }
                ],
                as: "followers"
            }
        },
        { $project: { followers: 1, _id: 0 } }
    ];

    const [result] = await User.aggregate(pipeline);
    const followers = result?.followers || [];

    return res.status(200).json(new ApiResponse(200, followers, "Followers fetched successfully"));
});

const getUserFollowings = asyncHandler(async (req, res, next) => {
    const currentUser = req.user;
    const targetUserId = req.params.targetUserId;

    if (!currentUser) throw new ApiError(401, "Unauthorized access");
    if (!targetUserId) throw new ApiError(400, "Target user id is required");

    const targetUser = await User.findById(targetUserId);
    if (!targetUser) throw new ApiError(404, "User not found");

    let followStatus = null;
    const isOwner = currentUser._id.toString() === targetUser._id.toString();

    if (!isOwner) {
        followStatus = await checkFollowStatus(currentUser._id, targetUserId);
    }

    const canAccess = isOwner || !targetUser.isPrivateAccount || followStatus === "accepted";
    if (!canAccess) throw new ApiError(403, "Access to followings list denied");

    const pipeline = [
        { $match: { _id: targetUser._id } },
        {
            $lookup: {
                from: "follows",
                let: { userId: "$_id" },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $and: [
                                    { $eq: ["$follower", "$$userId"] }, // Find users this user follows
                                    { $eq: ["$status", "accepted"] }
                                ]
                            }
                        }
                    },
                    {
                        $lookup: {
                            from: "users",
                            localField: "following",
                            foreignField: "_id",
                            as: "followingDetails"
                        }
                    },
                    { $unwind: { path: "$followingDetails", preserveNullAndEmptyArrays: true } },
                    {
                        $project: {
                            _id: "$followingDetails._id",
                            username: "$followingDetails.username",
                            fullname: "$followingDetails.fullname",
                            profilePicture: "$followingDetails.profilePicture"
                        }
                    }
                ],
                as: "followings"
            }
        },
        { $project: { followings: 1, _id: 0 } }
    ];

    const [result] = await User.aggregate(pipeline);
    const followings = result?.followings || [];

    return res.status(200).json(new ApiResponse(200, followings, "Followings fetched successfully"));
});


export { userRegister, userLogin, getCurrentUser, getUserProfile, updateAccountDetails, changeCurrentPassword, userFollowUnfollow, getUserFollowers, getUserFollowings };