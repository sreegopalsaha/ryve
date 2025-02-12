import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../atoms/Button";
import getFollowButtonName from "../../utils/getFollowButtonName";
import { userFollowUnfollow } from "../../services/ApiServices";
import {useCurrentUser} from "../../contexts/CurrentUserProvider";

function UserCard({ user }) {
  const navigate = useNavigate();
  const [followStatus, setFollowStatus] = useState(user.followStatus || "not-following");
  const [followToggleLoading, setFollowToggleLoading] = useState(false);
  const {currentUser} = useCurrentUser();
  const isOwnerAccount = currentUser._id === user._id;

  const handleNavigate = () => {
    navigate(`/${user.username}`);
  };

  const handleFollowToggle = async (e) => {
    e.stopPropagation();
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
      // console.error("Error while toggling follow status:", error);
    }finally{
      setFollowToggleLoading(false);
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
      {
        !isOwnerAccount && <Button loading={followToggleLoading}
        className="followButtonStyle"
        onClick={handleFollowToggle}
      >
        {getFollowButtonName(followStatus)}
      </Button>
      }
    </div>
  );
}

export default UserCard;