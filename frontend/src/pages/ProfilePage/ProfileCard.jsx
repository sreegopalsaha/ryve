import React, { useEffect, useState } from "react";
import Card from "../../components/molecules/Card";
import { Calendar, MapPin, Menu } from "lucide-react";
import Button from "../../components/atoms/Button";
import { useCurrentUser } from "../../contexts/CurrentUserProvider";
import { useTheme } from "../../contexts/ThemeContext";
import {
  userFollowUnfollow,
  getFollowRequests,
} from "../../services/ApiServices";
import getFollowButtonName from "../../utils/getFollowButtonName";
import { useNavigate } from "react-router-dom";
import ProfileMenu from "./ProfileMenu";
import { DEFAULT_AVATAR } from "../../utils/constants";

function ProfileCard({ user }) {
  const { currentUser } = useCurrentUser();
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";
  const [followStatus, setFollowStatus] = useState(user?.followStatus || "not-following");
  const [followToggleLoading, setFollowToggleLoading] = useState(false);
  const [followButtonName, setFollowButtonName] = useState("");
  const [isOwner, setIsOwner] = useState(false);
  const [followersCount, setFollowersCount] = useState(user?.followers || 0);
  const navigate = useNavigate();
  const [canAccess, setCanAccess] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [pendingRequests, setPendingRequests] = useState(0);

  // Synchronize state when user prop changes (e.g. navigating to different profiles)
  useEffect(() => {
    if (user) {
      setFollowStatus(user.followStatus || "not-following");
      setFollowersCount(user.followers || 0);
    }
  }, [user]);

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
  }, [currentUser, user?._id]);

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
    if (!user?._id) return;
    setFollowToggleLoading(true);
    const prevStatus = followStatus;
    const prevFollowersCount = followersCount;
    let newStatus = prevStatus;
    let newFollowersCount = prevFollowersCount;

    if (prevStatus === "accepted" || prevStatus === "pending") {
      if (prevStatus === "accepted") newFollowersCount = Math.max(0, newFollowersCount - 1);
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
    if (!canAccess || !user?.username) return;
    navigate(`/${user.username}/following`);
  };

  const handleFollowersButtonClick = () => {
    if (!canAccess || !user?.username) return;
    navigate(`/${user.username}/followers`);
  };

  if (!user) return null;

  return (
    <>
      <Card className="relative p-4 sm:p-6 max-w-2xl mx-auto w-full">
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
          <div className="w-24 h-24 flex items-center justify-center bg-slate-200 dark:bg-slate-700 rounded-full border-4 border-white dark:border-black overflow-hidden shadow-sm">
            <img
              className="w-full h-full object-cover"
              src={user.profilePicture || DEFAULT_AVATAR}
              alt={user.fullname || "User avatar"}
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = DEFAULT_AVATAR;
              }}
            />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold mt-2 text-center">{user.fullname}</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">@{user.username}</p>
          {user.bio && (
            <p className="text-sm mt-2 text-center px-4 text-gray-600 dark:text-gray-300 max-w-md">
              {user.bio}
            </p>
          )}

          <div className="flex flex-wrap justify-center gap-4 mt-3 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
            {user.location && (
              <div className="flex items-center gap-1">
                <MapPin size={15} />
                <span>{user.location}</span>
              </div>
            )}
            <div className="flex items-center gap-1">
              <Calendar size={15} />
              <span>
                Joined{" "}
                {user.createdAt
                  ? new Date(user.createdAt).toLocaleDateString(undefined, {
                      year: "numeric",
                      month: "short",
                    })
                  : "Recently"}
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3.5 mt-5 pt-3 border-t border-gray-100 dark:border-gray-800/60">
          <div className="flex items-center justify-center sm:justify-start gap-4">
            <Button className="flex gap-1.5 hover:underline text-sm" onClick={handleFollowingButtonClick}>
              <strong>{user.following || 0}</strong> <span className="text-gray-500 dark:text-gray-400">Following</span>
            </Button>
            <Button className="flex gap-1.5 hover:underline text-sm" onClick={handleFollowersButtonClick}>
              <strong>{followersCount}</strong> <span className="text-gray-500 dark:text-gray-400">Followers</span>
            </Button>
          </div>
          {isOwner ? (
            <Button
              className="w-full sm:w-auto sm:px-8 py-2 text-sm font-semibold btn-primary"
              onClick={() => navigate("/edit-profile")}
            >
              Edit Profile
            </Button>
          ) : (
            <div className="flex items-center gap-2.5 w-full sm:w-auto">
              <Button
                className="flex-1 sm:flex-initial sm:px-6 py-2 text-sm font-semibold rounded-full border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                onClick={() => navigate(`/messages?user=${user._id}`)}
              >
                Message
              </Button>
              <Button
                loading={followToggleLoading}
                onClick={handleFollowUnfollow}
                className="flex-1 sm:flex-initial sm:px-6 py-2 text-sm font-semibold rounded-full bg-primary-light-accent dark:bg-primary-dark-accent hover:bg-primary-light-accent/90 dark:hover:bg-primary-dark-accent/90 text-white transition-all duration-300"
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
