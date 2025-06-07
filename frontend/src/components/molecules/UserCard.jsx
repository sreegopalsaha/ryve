import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../atoms/Button";
import getFollowButtonName from "../../utils/getFollowButtonName";
import { userFollowUnfollow } from "../../services/ApiServices";
import {useCurrentUser} from "../../contexts/CurrentUserProvider";

function UserCard({ user, onFollowRequest }) {
  const navigate = useNavigate();
  const [followStatus, setFollowStatus] = useState(user.followStatus || "not-following");
  const [followToggleLoading, setFollowToggleLoading] = useState(false);
  const [acceptLoading, setAcceptLoading] = useState(false);
  const [rejectLoading, setRejectLoading] = useState(false);
  const {currentUser} = useCurrentUser();
  const isOwnerAccount = currentUser._id === user._id;

  const handleNavigate = () => {
    navigate(`/${user.username}`);
  };

  const handleFollowToggle = async (e) => {
    e.stopPropagation();
    
    // If this is a follow request, use the request handler
    if (user.requestId) {
      onFollowRequest?.(user.requestId, 'accept');
      return;
    }

    const prevFollowStatus = user.followStatus;
    let newFollowStatus = prevFollowStatus;
    if (followStatus === "accepted" || followStatus === "pending") {
      newFollowStatus = "not-following";
    } else if (user.isPrivateAccount) {
      newFollowStatus = "pending";
    } else {
      newFollowStatus = "accepted";
    }
    setFollowStatus(newFollowStatus);
    try {
      setFollowToggleLoading(true);
      const res = await userFollowUnfollow(user._id);
      setFollowStatus(res?.data?.data?.status || newFollowStatus);
    } catch (error) {
      setFollowStatus(prevFollowStatus);
    } finally {
      setFollowToggleLoading(false);
    }
  };

  const handleRequest = async (action) => {
    if (!user.requestId) return;
    
    if (action === 'accept') {
      setAcceptLoading(true);
    } else {
      setRejectLoading(true);
    }
    
    try {
      await onFollowRequest?.(user.requestId, action);
    } catch (error) {
      console.error('Error handling follow request:', error);
    } finally {
      setAcceptLoading(false);
      setRejectLoading(false);
    }
  };

  return (
    <div
      className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
      onClick={handleNavigate}
    >
      <div className="flex items-center gap-3">
        <img
          src={user.profilePicture || "/default-avatar.png"}
          alt={user.fullname}
          className="w-12 h-12 rounded-full object-cover"
        />
        <div>
          <p className="font-medium theme-text">{user.fullname}</p>
          <p className="text-sm text-gray-500">@{user.username}</p>
        </div>
      </div>
      {!isOwnerAccount && (
        <div className="flex gap-2">
          {user.requestId ? (
            <>
              <Button
                loading={acceptLoading}
                className="px-4 py-1 text-sm rounded-full bg-blue-500 text-white hover:bg-blue-600"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRequest('accept');
                }}
              >
                Accept
              </Button>
              <Button
                loading={rejectLoading}
                className="px-4 py-1 text-sm rounded-full bg-gray-200 text-gray-700 hover:bg-gray-300"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRequest('reject');
                }}
              >
                Reject
              </Button>
            </>
          ) : (
            <Button
              loading={followToggleLoading}
              className="followButtonStyle"
              onClick={handleFollowToggle}
            >
              {getFollowButtonName(followStatus)}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

export default UserCard;