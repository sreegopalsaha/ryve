import { Post } from "../models/post.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js"
import asyncHandler from "../utils/asyncHandler.js"
import { uploadOnCloudinay } from "../utils/uploadOnCloudinary.js";
import { checkFollowStatus } from "../utils/checkFollowStatus.js"
import mongoose from "mongoose";
import { User } from "../models/user.model.js";
import { Follow } from "../models/follow.model.js";
import getAiResponse from "../utils/getAiResponse.js";
import { json } from "express";

const createPost = asyncHandler(async (req, res, next) => {
    const author = req.user?._id;
    const { content } = req.body;
    const imagePath = req.file?.path;
    let image;

    if (!content && !imagePath) throw new ApiError(400, "Cannot create an empty post");

    if (imagePath) image = await uploadOnCloudinay(imagePath);

    const post = new Post({ content, image, author });
    await post.save();

    res.status(201).json(new ApiResponse(201, post, "Post created successfully"));
});

const enhanceContent = asyncHandler(async (req, res, next) => {
    if (!req.body.content) throw new ApiError(400, "content is required")
    const response = await getAiResponse(
        `Revise this text to enhance clarity and readability while STRICTLY preserving the original meaning. 
            Follow these rules:
            1. Maintain original facts and intent
            2. Use simple, conversational English
            3. Avoid markdown formatting
            4. Keep paragraphs under 4 sentences
            5. Output as single plain text paragraph
          
            Text to revise:`,
        req.body.content
    );
    if (!response) throw new ApiError(500, "Error while getting AI response");
    return res.status(200).json(new ApiResponse(200, response, "Enhanced with AI"));
});

const deletePost = asyncHandler(async (req, res, next) => {
    const user = req.user;
    const postId = req.params.postId;

    const post = await Post.findById(postId);
    if (!post) throw new ApiError(404, "Post not found");
    const isOwner = post.author.toString() === user._id.toString();

    if (!isOwner) throw new ApiError(401, "Unauthorized");
    await post.deleteOne();
    res.status(200).json(new ApiResponse(200, {}, "Post deleted successfully"));
});

const getFeedPosts = asyncHandler(async (req, res, next) => {
    const currentUser = req.user;

    const followRecords = await Follow.find({
        follower: currentUser._id,
        status: "accepted"
    });

    const followeeIds = followRecords.map(record => record.following);

    const userIds = [...followeeIds, currentUser._id];

    const posts = await Post.find({ author: { $in: userIds } })
        .sort({ createdAt: -1 })
        .populate({
            path: 'author',
            select: 'fullname username profilePicture'
        });

    const formattedPosts = posts.map(post => ({
        content: post.content,
        image: post.image,
        likedBy: post.likedBy,
        createdAt: post.createdAt,
        _id: post._id,
        author: {
            _id: post.author._id,
            fullname: post.author.fullname,
            username: post.author.username,
            profilePicture: post.author.profilePicture
        }
    }));

    res.status(200).json(new ApiResponse(200, formattedPosts, "Feed posts fetched successfully"));
});

const getUserPosts = asyncHandler(async (req, res, next) => {
    const { userIdentifier } = req.params;
    const currentUser = req.user;
    if (!userIdentifier) throw new ApiError(400, "userIdentifier is required");

    const query = mongoose.isValidObjectId(userIdentifier)
        ? { _id: new mongoose.Types.ObjectId(userIdentifier) }
        : { username: userIdentifier };

    const targetUser = await User.findOne(query);

    if (!targetUser) throw new ApiError(404, "User not found");

    const followStatus = checkFollowStatus(currentUser._id, targetUser._id);
    const canAccess = !targetUser.isPrivateAccount || followStatus === "accepted";
    if (!canAccess) throw new ApiError(403, "Private Account");

    const posts = await Post.find({ author: targetUser._id })
        .sort({ createdAt: -1 });

    res.status(200).json(new ApiResponse(200, posts, "Posts fetched successfully"));
});

const getPost = asyncHandler(async (req, res, next) => {
    const { postId } = req.params;
    if (!postId) throw new ApiError(400, "Post ID is required");
    const currentUserId = req.user._id;
    const postPipeline = [
        { $match: { _id: new mongoose.Types.ObjectId(postId) } },
        {
            $lookup: {
                from: "users",
                localField: "author",
                foreignField: "_id",
                as: "authorDetails"
            }
        },
        { $unwind: "$authorDetails" },
        {
            $project: {
                _id: 1,
                content: 1,
                image: 1,
                createdAt: 1,
                likedBy: 1,
                "authorDetails._id": 1,
                "authorDetails.fullname": 1,
                "authorDetails.username": 1,
                "authorDetails.profilePicture": 1,
                "authorDetails.isPrivateAccount": 1
            }
        }
    ];

    let post = await Post.aggregate(postPipeline);
    if (!post.length) throw new ApiError(404, "Post not found");

    post = post[0];

    const isOwner = post.authorDetails._id.toString() === currentUserId.toString();
    if (isOwner) return res.status(200).json(new ApiResponse(200, post, "Post fetched successfully"));

    if (post.authorDetails.isPrivateAccount) {
        const followStatus = await checkFollowStatus(currentUserId, post.authorDetails._id);
        const canAccess = followStatus === "accepted";

        if (!canAccess) throw new ApiError(403, "Access denied");
    }

    res.status(200).json(new ApiResponse(200, post, "Post fetched successfully"));
});

const postLikeToggle = asyncHandler(async (req, res, next) => {
    const currentUser = req.user;
    const { postId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(postId)) {
        throw new ApiError(400, "Invalid Post ID");
    }

    const post = await Post.findById(postId).populate("author", "isPrivateAccount");
    if (!post) throw new ApiError(404, "Post not found");
    if (!post.author) return res.status(404).json({ error: "Author not found" });

    const isOwner = post.author.toString() === currentUser._id.toString();
    if (!isOwner && post.author.isPrivateAccount) {
        const followStatus = await checkFollowStatus(currentUser._id, post.author);
        if (followStatus !== "accepted") throw new ApiError(403, "This is a private post");
    }

    const hasLiked = post.likedBy.some(
        (id) => id.toString() === currentUser._id.toString()
    );

    let message;

    if (hasLiked) {
        await Post.findByIdAndUpdate(postId, {
            $pull: { likedBy: currentUser._id },
        });
        message = "Successfully unliked";
    } else {
        await Post.findByIdAndUpdate(postId, {
            $addToSet: { likedBy: currentUser._id },
        });
        message = "Successfully liked";
    }

    res.status(200).json(new ApiResponse(200, message));
});

const getPostComments = asyncHandler((req, res, next) => {

});

const updatePost = asyncHandler((req, res, next) => {

});

const searchUsers = asyncHandler(async (req, res, next) => {
    const { searchQuery } = req.params;
    if (!searchQuery) throw new ApiError(400, "Search term is required");

    const users = await User.find({
        $or: [
            { fullname: { $regex: searchQuery, $options: "i" } },
            { username: { $regex: searchQuery, $options: "i" } },
            { location: { $regex: searchQuery, $options: "i" } },
        ],
    }).select("username fullname profilePicture");

    if (!users) throw new ApiError(500, "Internal Server issue");

    res.status(200).json(new ApiResponse(200, users, "Search results"));

});

export { getFeedPosts, enhanceContent, getUserPosts, postLikeToggle, createPost, deletePost, updatePost, getPost, getPostComments, searchUsers };