import { Post } from "../models/post.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js"
import asyncHandler from "../utils/asyncHandler.js"
import { uploadOnCloudinay } from "../utils/uploadOnCloudinary.js";
import { checkFollowStatus } from "../utils/checkFollowStatus.js"
import mongoose from "mongoose";

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

const deletePost = asyncHandler(async (req, res, next) => {
    const user = req.user;
    const postId = req.params.postId;

    const post = await Post.findById(postId);
    console.log(post);
    if (!post) throw new ApiError(404, "Post not found");
    const isOwner = post.author.toString() === user._id.toString();

    if (!isOwner) throw new ApiError(401, "Unauthorized");
    await post.deleteOne();
    res.status(200).json(new ApiResponse(200, {}, "Post deleted successfully"));
});

const getFeedPosts = asyncHandler((req, res, next) => {

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

const postLikeUnlike = asyncHandler(async (req, res, next) => {
    const currentUser = req.user;
    const { postId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(postId)) {
        throw new ApiError(400, "Invalid Post ID");
    }

    const post = await Post.findById(postId);
    if (!post) {
        throw new ApiError(404, "Post not found");
    }

    const isOwner = post.author.toString() === currentUser._id.toString();
    if (!isOwner) {
        const followStatus = await checkFollowStatus(currentUser._id, post.author);
        if (followStatus !== "accepted") {
            throw new ApiError(
                403,
                "This is a private post"
            );
        }
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

export { getFeedPosts, postLikeUnlike, createPost, deletePost, updatePost, getPost, getPostComments };