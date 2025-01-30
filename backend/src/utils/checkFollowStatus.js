import { Follow } from "../models/follow.model.js";
import { ApiError } from "./ApiError.js";

export const checkFollowStatus = async (currentUserId, targetUserId) => {
    if (!currentUserId || !targetUserId) throw new ApiError(400, "Both currentUserId and targetUserId are required");

    const follow = await Follow.findOne({ follower: currentUserId, following: targetUserId });

    return follow ? follow.status : "not-following" ;
};