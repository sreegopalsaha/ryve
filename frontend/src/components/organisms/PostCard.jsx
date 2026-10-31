import React, { useEffect, useState } from "react";
import { Heart, MessageCircle, MoreVertical, Share, Star, MapPin } from "lucide-react";
import Card from "../molecules/Card";
import Button from "../atoms/Button";
import { useCurrentUser } from "../../contexts/CurrentUserProvider";
import { usePost } from "../../contexts/PostProvider";
import { deletePost, postLikeToggle, starPostToggle } from "../../services/ApiServices";
import { useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import Dropdown from "../molecules/Dropdown";
import { DEFAULT_AVATAR } from "../../utils/constants";

function PostCard({ post, author, setPosts }) {
  const navigate = useNavigate();
  const { currentUser } = useCurrentUser();
  const postContext = usePost();
  const toggleStarPost = postContext?.toggleStarPost;

  const [likedBy, setLikedBy] = useState(post.likedBy || []);
  const [liked, setLiked] = useState(false);
  const [starredBy, setStarredBy] = useState(post.starredBy || []);
  const [starred, setStarred] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    if (!currentUser || !post) return;
    setLiked(likedBy.includes(currentUser._id));
    setStarred(starredBy.includes(currentUser._id));
  }, [currentUser, post, likedBy, starredBy]);

  useEffect(() => {
    if (post?.starredBy) {
      setStarredBy(post.starredBy);
      if (currentUser) {
        setStarred(post.starredBy.includes(currentUser._id));
      }
    }
  }, [post?.starredBy, currentUser]);

  const handleLikeToggle = async () => {
    if (!currentUser) return;

    const prevLikedBy = [...likedBy];
    let newLikedBy;

    if (liked) {
      newLikedBy = prevLikedBy.filter((userId) => userId !== currentUser._id);
    } else {
      newLikedBy = [...prevLikedBy, currentUser._id];
    }

    setLikedBy(newLikedBy);
    setLiked(!liked);

    try {
      await postLikeToggle(post._id);
    } catch {
      setLikedBy(prevLikedBy);
      setLiked(liked);
    }
  };

  const handleStarToggle = async () => {
    if (!currentUser || !post) return;

    const prevStarredBy = [...starredBy];
    const isCurrentlyStarred = starred;
    const newStarredBy = isCurrentlyStarred
      ? prevStarredBy.filter((userId) => userId !== currentUser._id)
      : [...prevStarredBy, currentUser._id];

    setStarredBy(newStarredBy);
    setStarred(!isCurrentlyStarred);

    if (toggleStarPost) {
      try {
        await toggleStarPost({ ...post, starredBy: prevStarredBy });
      } catch {
        setStarredBy(prevStarredBy);
        setStarred(isCurrentlyStarred);
      }
    } else {
      try {
        await starPostToggle(post._id);
      } catch {
        setStarredBy(prevStarredBy);
        setStarred(isCurrentlyStarred);
      }
    }
  };

  const handleShare = async () => {
    const postUrl = `${window.location.origin}/post/${post._id}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Ryve",
          text: post.content || "Check out this post on Ryve",
          url: postUrl,
        });
      } catch (error) {
        if (error.name !== "AbortError") {
          console.error("Error sharing post:", error);
        }
      }
    } else {
      try {
        await navigator.clipboard.writeText(postUrl);
      } catch (error) {
        console.error("Error copying link to clipboard:", error);
      }
    }
  };

  const handleDeleteClick = async () => {
    try {
      await deletePost(post._id);
      if (setPosts) {
        setPosts((prev) => (prev ? prev.filter((prevPost) => prevPost._id !== post._id) : []));
      }
    } catch (error) {
      console.log("Error while deleting post", error);
    }
  };

  const postAuthor = post.authorDetails || post.author || author;
  const isPostOwner = Boolean(
    currentUser?._id &&
      (postAuthor?._id === currentUser._id || post.author === currentUser._id)
  );

  const dropdownItems = [
    {
      label: "Copy Link",
      onClick: () => {
        const postUrl = `${window.location.origin}/post/${post._id}`;
        navigator.clipboard?.writeText(postUrl);
      },
      visible: true,
    },
    {
      label: "Delete",
      onClick: handleDeleteClick,
      visible: isPostOwner,
    },
    {
      label: "Report",
      onClick: () => {
        alert("Post reported. Thank you for keeping Ryve safe.");
      },
      visible: !isPostOwner,
    },
  ];

  return (
    <Card className="w-full gap-3 sm:gap-4 max-w-2xl mx-auto">
      {/* User Info Header */}
      <div className="flex items-center justify-between gap-2 theme-text">
        {/* Left: Author */}
        <div
          onClick={() => postAuthor?.username && navigate(`/${postAuthor.username}`)}
          className="flex cursor-pointer items-center gap-3 min-w-0 flex-1"
        >
          <img
            src={postAuthor?.profilePicture || DEFAULT_AVATAR}
            alt={postAuthor?.fullname || "User"}
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = DEFAULT_AVATAR;
            }}
            className="w-10 h-10 rounded-full object-cover flex-shrink-0"
          />
          <div className="min-w-0 flex-1">
            <p className="font-medium truncate leading-tight hover:underline">
              {postAuthor?.fullname || "User"}
            </p>
            <div className="flex items-center gap-1.5 flex-wrap">
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 truncate">
                @{postAuthor?.username || "unknown"}
              </p>
              {post.location && (
                <span className="inline-flex items-center gap-0.5 text-xs text-gray-400 dark:text-gray-500">
                  <span>•</span>
                  <MapPin className="w-3 h-3 inline flex-shrink-0" />
                  <span className="truncate max-w-[120px] sm:max-w-[180px]">{post.location}</span>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right: Timestamp & Dropdown Menu */}
        <div className="relative flex items-center gap-2 flex-shrink-0">
          <p className="text-xs text-gray-400 whitespace-nowrap">
            {post.createdAt ? formatDistanceToNow(new Date(post.createdAt), { addSuffix: true }) : ""}
          </p>
          <Button
            onClick={() => setIsDropdownOpen((prev) => !prev)}
            className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 transition-colors"
            aria-label="Post actions"
          >
            <MoreVertical size={18} />
          </Button>

          {isDropdownOpen && (
            <Dropdown
              isOpen={isDropdownOpen}
              setIsOpen={setIsDropdownOpen}
              items={dropdownItems}
            />
          )}
        </div>
      </div>

      {/* Post Content */}
      <p
        className="theme-text whitespace-pre-wrap break-words text-sm sm:text-base leading-relaxed cursor-pointer"
        onClick={() => navigate(`/post/${post._id}`)}
      >
        {post.content}
      </p>

      {/* Post Image */}
      {post.image && (
        <div
          className="rounded-xl overflow-hidden cursor-pointer border border-gray-100 dark:border-gray-800"
          onClick={() => navigate(`/post/${post._id}`)}
        >
          <img
            src={post.image}
            alt="Post content"
            className="w-full max-h-[30rem] object-cover"
          />
        </div>
      )}

      {/* Post Actions */}
      <div className="flex justify-between items-center text-gray-500 pt-1 border-t border-gray-100 dark:border-gray-800/60">
        <Button
          className={`gap-1.5 text-xs sm:text-sm p-1.5 rounded-lg transition-colors ${
            liked ? "text-red-500 font-semibold" : "hover:text-red-500"
          }`}
          onClick={handleLikeToggle}
        >
          <Heart size={18} className={liked ? "fill-red-500" : ""} />
          <span>{likedBy.length}</span>
        </Button>

        <Button
          className="gap-1.5 text-xs sm:text-sm p-1.5 rounded-lg hover:text-blue-500 transition-colors"
          onClick={() => navigate(`/post/${post._id}`)}
        >
          <MessageCircle size={18} />
          <span>{post.comments?.length || 0}</span>
        </Button>

        <Button
          className="gap-1.5 text-xs sm:text-sm p-1.5 rounded-lg hover:text-blue-500 transition-colors"
          onClick={handleShare}
          aria-label="Share post"
        >
          <Share size={18} />
        </Button>

        <Button
          className={`gap-1.5 text-xs sm:text-sm p-1.5 rounded-lg transition-colors ${
            starred ? "text-yellow-500 font-semibold" : "hover:text-yellow-500"
          }`}
          onClick={handleStarToggle}
          aria-label="Star post"
        >
          <Star size={18} className={starred ? "fill-yellow-500" : ""} />
          <span>{starredBy.length}</span>
        </Button>
      </div>
    </Card>
  );
}

export default PostCard;
