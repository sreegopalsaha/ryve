import React, { useEffect, useState } from "react";
import { Heart, MoreVertical, Share, Star } from "lucide-react";
import Card from "../molecules/Card";
import Button from "../atoms/Button";
import { useCurrentUser } from "../../contexts/CurrentUserProvider";
import { deletePost, postLikeToggle, starPostToggle } from "../../services/ApiServices";
import { useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import Dropdown from "../molecules/Dropdown";
import GlobalError from "../errors/GlobalError";

function PostCard({ post, author, setPosts }) {
  const navigate = useNavigate();
  const { currentUser } = useCurrentUser();
  const [likedBy, setLikedBy] = useState(post.likedBy);
  const [starredBy, setStarredBy] = useState(post.starredBy || []);
  const [liked, setLiked] = useState(false);
  const [starred, setStarred] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!currentUser || !post) return;
    setLiked(likedBy.includes(currentUser._id));
    setStarred(starredBy.includes(currentUser._id));
  }, [currentUser, post, likedBy, starredBy]);

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
    } catch (error) {
      setLikedBy(prevLikedBy);
      setLiked(liked);
    }
  };

  const handleStarToggle = async () => {
    if (!currentUser) return;

    const prevStarredBy = [...starredBy];
    let newStarredBy;

    if (starred) {
      newStarredBy = prevStarredBy.filter((userId) => userId !== currentUser._id);
    } else {
      newStarredBy = [...prevStarredBy, currentUser._id];
    }

    setStarredBy(newStarredBy);
    setStarred(!starred);

    try {
      await starPostToggle(post._id);
    } catch (error) {
      setStarredBy(prevStarredBy);
      setStarred(starred);
    }
  };

  const handleDeleteClick = async () => {
    try {
      await deletePost(post._id);
      setPosts((prev) => prev.filter((prevPost) => prevPost._id !== post._id));
    } catch (error) {
      console.log("Error while deleting post");
    }
  };

  const handleShare = async () => {
    try {
      const postUrl = `${window.location.origin}/post/${post._id}`;
      if (navigator.share) {
        await navigator.share({
          title: `${author.fullname}'s post`,
          text: post.content,
          url: postUrl
        });
      } else {
        // Fallback for browsers that don't support navigator.share
        await navigator.clipboard.writeText(postUrl);
        alert('Post link copied to clipboard!');
      }
    } catch (error) {
      if (error.name !== 'AbortError') {
        setError(error);
      }
    }
  };

  const dropdownItems = [
    {
      label: "Delete",
      onClick: handleDeleteClick,
      visible: author?._id === currentUser?._id,
    },
    {
      label: "Edit",
      onClick: () => {
        navigate(`/post/${post._id}/edit`);
      },
      visible: author?._id === currentUser?._id,
    },
    {
      label: "Report",
      onClick: () => {
        console.log("Report button clicked");
      },
      visible: author?._id !== currentUser?._id,
    },
  ];

  if (error) {
    return <GlobalError error={error} />;
  }

  return (
    <Card className="w-full gap-4 max-w-[40rem]">
      {/* User Info */}
      <div className="cursor-pointer flex items-center justify-between gap-3 theme-text ">
        {/* left side */}
        <div
          onClick={() => navigate(`/${author.username}`)}
          className="flex cursor-pointer items-center gap-3 w-full"
        >
          <img
            src={author.profilePicture}
            alt={author.fullname}
            className="w-10 h-10 rounded-full "
          />
          <div>
            <p className="font-medium">{author.fullname}</p>
            <p className="text-sm text-gray-500">@{author.username}</p>
          </div>
        </div>

        {/* right side */}
        <div className="flex gap-2 w-full justify-end">
          {isDropdownOpen && (
            <Dropdown
              isOpen={isDropdownOpen}
              setIsOpen={setIsDropdownOpen}
              items={dropdownItems}
              postAutherId={post.author._id}
            />
          )}

          <p className="text-xs text-gray-400">
            {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
          </p>
          <Button
            onClick={() => {
              setIsDropdownOpen(true);
            }}
          >
            <MoreVertical size={20} />
          </Button>
        </div>
      </div>

      {/* Post Content */}
      <p className="theme-text whitespace-pre-wrap break-words overflow-hidden text-ellipsis">
        {post.content}
      </p>

      {/* Post Image */}
      {post.image && (
        <img
          src={post.image}
          alt="Post"
          className="rounded-lg w-full max-h-60 object-cover"
        />
      )}

      {/* Post Actions */}
      <div className="flex justify-between items-center text-gray-500">
        <Button
          className={`gap-1 ${liked ? "text-red-500" : "hover:text-red-500"}`}
          onClick={handleLikeToggle}
        >
          <Heart size={18} />
          <span>{likedBy.length}</span>
        </Button>

        <Button 
          className="gap-1 hover:text-blue-500"
          onClick={handleShare}
        >
          <Share size={18} />
        </Button>

        <Button 
          className={`gap-1 ${starred ? "text-yellow-500" : "hover:text-yellow-500"}`}
          onClick={handleStarToggle}
        >
          <Star size={18} />
          <span>{starredBy.length}</span>
        </Button>
      </div>
    </Card>
  );
}

export default PostCard;
