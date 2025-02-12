import React, { useEffect, useState } from "react";
import { Heart, MessageCircle, Share, Star } from "lucide-react";
import Card from "../molecules/Card";
import Button from "../atoms/Button";
import { useCurrentUser } from "../../contexts/CurrentUserProvider";
import { postLikeToggle } from "../../services/ApiServices";
import {  useNavigate } from "react-router-dom";

function PostCard({ post, author }) {
  const navigate = useNavigate();
  const { currentUser } = useCurrentUser();
  const [likedBy, setLikedBy] = useState(post.likedBy);
  const [liked, setLiked] = useState(false);

  useEffect(() => {
    if (!currentUser || !post) return;
    setLiked(likedBy.includes(currentUser._id));
  }, [currentUser, post]);

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

  return (
    <Card className="w-full gap-4">
      {/* User Info */}
      <div onClick={() => author?._id && navigate(`/${author.username}`)} className="cursor-pointer flex items-center gap-3 theme-text">
        <img
          src={author.profilePicture}
          alt={author.fullname}
          className="w-10 h-10 rounded-full"
        />
        <div>
          <p className="font-medium">{author.fullname}</p>
          <p className="text-sm text-gray-500">@{author.username}</p>
        </div>
      </div>

      {/* Post Content */}
      <p className="theme-text">{post.content}</p>

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

        <Button className="gap-1 hover:text-blue-500">
          <MessageCircle size={18} />
          <span>{post.comments?.length || 0}</span>
        </Button>

        <Button className="gap-1 hover:text-blue-500">
          <Share size={18} />
        </Button>

        <Button className="gap-1 hover:text-green-500">
          <Star size={18} />
        </Button>
      </div>
    </Card>
  );
}

export default PostCard;