import React, { useEffect, useState } from "react";
import { Heart, MessageCircle, MoreVertical, Share, Star } from "lucide-react";
import Card from "../molecules/Card";
import Button from "../atoms/Button";
import { useCurrentUser } from "../../contexts/CurrentUserProvider";
import { usePost } from "../../contexts/PostProvider";
import { deletePost, postLikeToggle, starPostToggle } from "../../services/ApiServices";
import { useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import Dropdown from "../molecules/Dropdown";

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
    } catch (error) {
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
      } catch (error) {
        setStarredBy(prevStarredBy);
        setStarred(isCurrentlyStarred);
      }
    } else {
      try {
        await starPostToggle(post._id);
      } catch (error) {
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
        setPosts((prev) => prev.filter((prevPost) => prevPost._id !== post._id));
      }
    } catch (error) {
      console.log("Error while deleting post");
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

  const postAuthorId = post.author?._id || post.author || author?._id;

  return (
    <Card className="w-full gap-4 max-w-[40rem]">
      {/* User Info */}

      <div className="cursor-pointer flex items-center justify-between gap-3 theme-text ">
        {/* left side */}
        <div
          onClick={() => author?.username && navigate(`/${author.username}`)}
          className="flex cursor-pointer items-center gap-3 w-full"
        >
          <img
            src={author?.profilePicture || "https://res.cloudinary.com/dmwlciwjk/image/upload/v1739380034/anonymous-user_tb3tgs.jpg"}
            alt={author?.fullname || "User"}
            className="w-10 h-10 rounded-full "
          />
          <div>
            <p className="font-medium">{author?.fullname}</p>
            <p className="text-sm text-gray-500">@{author?.username}</p>
          </div>
        </div>

        {/* right side */}
        <div className="flex gap-2 w-full justify-end">
          {isDropdownOpen && (
            <Dropdown
              isOpen={isDropdownOpen}
              setIsOpen={setIsDropdownOpen}
              items={dropdownItems}
              postAutherId={postAuthorId}
            />
          )}

          <p className="text-xs text-gray-400">
            {post.createdAt ? formatDistanceToNow(new Date(post.createdAt), { addSuffix: true }) : ""}
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
          <Heart size={18} className={liked ? "fill-red-500" : ""} />
          <span>{likedBy.length}</span>
        </Button>

        <Button className="gap-1 hover:text-blue-500">
          <MessageCircle size={18} />
          <span>{post.comments?.length || 0}</span>
        </Button>

        <Button className="gap-1 hover:text-blue-500" onClick={handleShare}>
          <Share size={18} />
        </Button>

        <Button
          className={`gap-1 ${starred ? "text-yellow-500" : "hover:text-yellow-500"}`}
          onClick={handleStarToggle}
        >
          <Star size={18} className={starred ? "fill-yellow-500" : ""} />
          <span>{starredBy.length}</span>
        </Button>
      </div>
    </Card>
  );
}

export default PostCard;
