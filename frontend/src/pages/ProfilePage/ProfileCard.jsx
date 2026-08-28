import React, { useEffect, useState } from "react";
import Card from "../../components/molecules/Card";
import { Calendar, MapPin, Menu } from "lucide-react";
import Button from "../../components/atoms/Button";
import { useCurrentUser } from "../../contexts/CurrentUserProvider";
import { useTheme } from "../../contexts/ThemeContext";
import { userFollowUnfollow, getFollowRequests } from "../../services/ApiServices";
import getFollowButtonName from "../../utils/getFollowButtonName";
import { useNavigate } from "react-router-dom";
import ProfileMenu from "./ProfileMenu";

function ProfileCard({ user }) {
  const { currentUser } = useCurrentUser();
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";
  const [followStatus, setFollowStatus] = useState(user.followStatus);
  const [followToggleLoading, setFollowToggleLoading] = useState(false);
  const [followButtonName, setFollowButtonName] = useState("");
  const [isOwner, setIsOwner] = useState(false);
  const [followersCount, setFollowersCount] = useState(user.followers);
  const navigate = useNavigate();
  const [canAccess, setCanAccess] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [pendingRequests, setPendingRequests] = useState(0);

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

  useEffect(() => {
    if (!isOwner || !isMenuOpen || !currentUser?.isPrivateAccount) return;
    const fetchRequests = async () => {
      try {
        const res = await getFollowRequests();
        setPendingRequests(res?.data?.data?.length || 0);
      } catch {
        // silently fail — badge just won't show
      }
    };
    fetchRequests();
  }, [isOwner, isMenuOpen, currentUser?.isPrivateAccount]);

  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMenuOpen]);

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

  return (
    <>
      <Card className="relative">
        {isOwner && (
          <button
            onClick={() => setIsMenuOpen(true)}
            aria-label="Open menu"
            className="md:hidden absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors theme-text"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

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
              onClick={() => navigate("/edit-profile")}
            >
              Edit
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button
                className="px-6 py-2 text-sm rounded-full border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                onClick={() => navigate(`/messages?user=${user._id}`)}
              >
                Message
              </Button>
              <Button
                loading={followToggleLoading}
                onClick={handleFollowUnfollow}
                className="followButtonStyle"
              >
                {followButtonName}
              </Button>
            </div>
          )}
        </div>
      </Card>

      <ProfileMenu
        isOpen={isOwner && isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        currentUser={currentUser}
        pendingRequests={pendingRequests}
        isDark={isDark}
        toggleTheme={toggleTheme}
      />
    </>
  );
}

export default ProfileCard;
