import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../atoms/Button";
import getFollowButtonName from "../../utils/getFollowButtonName";
import { userFollowUnfollow } from "../../services/ApiServices";
import { useCurrentUser } from "../../contexts/CurrentUserProvider";
import { DEFAULT_AVATAR } from "../../utils/constants";

function UserCard({ user }) {
  const navigate = useNavigate();
  const [followStatus, setFollowStatus] = useState(user?.followStatus || "not-following");
  const [followToggleLoading, setFollowToggleLoading] = useState(false);
  const { currentUser } = useCurrentUser();
  const isOwnerAccount = Boolean(currentUser?._id && user?._id && currentUser._id === user._id);

  useEffect(() => {
    if (user?.followStatus) {
      setFollowStatus(user.followStatus);
    }
  }, [user?.followStatus]);

  if (!user) return null;

  const handleNavigate = () => {
    if (user?.username) {
      navigate(`/${user.username}`);
    }
  };

  const handleFollowToggle = async (e) => {
    e.stopPropagation();
    if (!user?._id) return;
    const prevFollowStatus = followStatus;
    let newFollowStatus;
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
    } catch {
      setFollowStatus(prevFollowStatus);
    } finally {
      setFollowToggleLoading(false);
    }
  };

  return (
    <div
      className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800/70 transition-colors cursor-pointer gap-2"
      onClick={handleNavigate}
    >
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <img
          src={user?.profilePicture || DEFAULT_AVATAR}
          alt={user?.fullname || "User"}
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = DEFAULT_AVATAR;
          }}
          className="w-11 h-11 sm:w-12 sm:h-12 rounded-full object-cover flex-shrink-0"
        />
        <div className="min-w-0 flex-1">
          <p className="font-medium theme-text truncate">{user?.fullname || "User"}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 truncate">@{user?.username || "unknown"}</p>
        </div>
      </div>
      {!isOwnerAccount && (
        <Button
          loading={followToggleLoading}
          className="followButtonStyle flex-shrink-0 text-xs sm:text-sm px-3.5 py-1.5"
          onClick={handleFollowToggle}
        >
          {getFollowButtonName(followStatus)}
        </Button>
      )}
    </div>
  );
}

export default UserCard;
