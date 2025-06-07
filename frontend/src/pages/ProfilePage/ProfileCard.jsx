import React, { useEffect, useState } from "react";
import Card from "../../components/molecules/Card";
import { Calendar, MapPin } from "lucide-react";
import Button from "../../components/atoms/Button";
import { useCurrentUser } from "../../contexts/CurrentUserProvider";
import { userFollowUnfollow } from "../../services/ApiServices";
import getFollowButtonName from "../../utils/getFollowButtonName";
import { useNavigate } from "react-router-dom";

function ProfileCard({ user }) {
  const { currentUser } = useCurrentUser();
  const [followStatus, setFollowStatus] = useState(user.followStatus);
  const [followToggleLoading, setFollowToggleLoading] = useState(false);
  const [followButtonName, setFollowButtonName] = useState("");
  const [isOwner, setIsOwner] = useState(false);
  const [followersCount, setFollowersCount] = useState(user.followers);
  const navigate = useNavigate();
  const [canAccess, setCanAccess] = useState(false);

  useEffect(() => {
    if (!user) return;
    if (
      !user.isPrivateAccount ||
      (user.isPrivateAccount && followStatus === "accepted")
    ) {
      setCanAccess(true);
    } else {
      setCanAccess(false);
    }
  }, [followStatus, user]);

  useEffect(() => {
    if (!currentUser || !user?._id) return;
    setIsOwner(currentUser._id === user._id);
  }, [currentUser, user._id]);

  useEffect(() => {
    setFollowButtonName(getFollowButtonName(followStatus));
  }, [followStatus]);

  const handleFollowUnfollow = async () => {
    setFollowToggleLoading(true);
    const prevStatus = followStatus;
    const prevFollowersCount = followersCount;
    let newStatus = prevStatus;
    let newFollowersCount = prevFollowersCount;

    if (prevStatus === "accepted" || prevStatus === "pending") {
      if (prevStatus === "accepted") newFollowersCount--;
      newStatus = "not-following";
    } else if (prevStatus === "not-following" && user.isPrivateAccount) {
      newStatus = "pending";
    } else {
      newStatus = "accepted";
      newFollowersCount++;
    }

    setFollowStatus(newStatus);
    setFollowersCount(newFollowersCount);

    try {
      const res = await userFollowUnfollow(user._id);
      if (res.data?.data?.status) {
        setFollowStatus(res.data.data.status);
      } else {
        setFollowStatus(newStatus);
      }
    } catch (error) {
      console.error("Follow/Unfollow error:", error);
      setFollowStatus(prevStatus);
      setFollowersCount(prevFollowersCount);
    } finally {
      setFollowToggleLoading(false);
    }
  };

  const handleFollowingButtonClick = () => {
    if (!canAccess) return;
    navigate(`/${user.username}/following`);
  };

  const handleFollowersButtonClick = () => {
    if (!canAccess) return;
    navigate(`/${user.username}/followers`);
  };

  const handleEditClick = () => {
    navigate("/edit-profile");
  };

  return (
    <Card>
      <div className="flex flex-col items-center justify-center">
        <div className="w-24 h-24 flex items-center justify-center bg-slate-300 rounded-full border-4 border-white dark:border-black overflow-hidden">
          <img
            className="w-full h-full object-cover"
            src={user.profilePicture}
            alt={user.fullname}
          />
        </div>
        <h1 className="text-xl font-bold mt-2">{user.fullname}</h1>
        <p className="text-gray-500">@{user.username}</p>
        <p className="text-sm mt-2 text-center px-4">{user.bio}</p>

        {/* Profile Details */}
        <div className="flex gap-4 mt-3 text-sm text-gray-500">
          {user.location && (
            <div className="flex items-center gap-1">
              <MapPin size={16} />
              <span>{user.location}</span>
            </div>
          )}
          <div className="flex items-center gap-1">
            <Calendar size={16} />
            <span>
              Joined{" "}
              {new Date(user.createdAt).toLocaleDateString(undefined, {
                year: "numeric",
                month: "short",
              })}
            </span>
          </div>
        </div>
      </div>

      {/* Follow Stats & Button */}
      <div className="flex justify-between items-center mt-4">
        <div className="flex gap-4">
          <Button className="flex gap-2" onClick={handleFollowingButtonClick}>
            <strong>{user.following}</strong> Following
          </Button>
          <Button className="flex gap-2" onClick={handleFollowersButtonClick}>
            <strong>{followersCount}</strong> Followers
          </Button>
        </div>
        {isOwner ? (
          <Button
            className="px-10 py-2 text-sm rounded-full bg-blue-500 text-white hover:bg-blue-600"
            onClick={handleEditClick}
          >
            Edit
          </Button>
        ) : (
          <Button
            loading={followToggleLoading}
            onClick={handleFollowUnfollow}
            className="followButtonStyle"
          >
            {followButtonName}
          </Button>
        )}
      </div>
    </Card>
  );
}

export default ProfileCard;
