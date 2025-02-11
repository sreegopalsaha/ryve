import React, { useState } from "react";
import { Heart, MessageCircle, Share, Star } from "lucide-react";
import Card from "../molecules/Card";
import Button from "../atoms/Button";

function PostCard({ post, author }) {
  const [likes, setLikes] = useState(post.likes);
  const [liked, setLiked] = useState(false);

  const handleLike = () => {
    setLiked(!liked);
    setLikes((prev) => (liked ? prev - 1 : prev + 1));
  };

  return (
    <Card className="w-full gap-4">
      {/* User Info */}
      <div className="flex items-center gap-3 theme-text">
        <img
          src={author.profilePicture}
          alt={author.name}
          className="w-10 h-10 rounded-full"
        />
        <div>
          <p className="font-medium">{author.name}</p>
          <p className="text-sm text-gray-500">{author.username}</p>
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
          className={`flex items-center gap-1 ${liked ? "text-red-500" : "hover:text-red-500"}`}
          onClick={handleLike}
        >
          <Heart size={18} />
          <span>{likes}</span>
        </Button>

        <Button className="flex items-center gap-1 hover:text-blue-500">
          <MessageCircle size={18} />
          <span>{post.comments}</span>
        </Button>

        <Button className="flex items-center gap-1 hover:text-blue-500">
        <Share size={18} />
        </Button>

        <Button className="flex items-center gap-1 hover:text-green-500">
          <Star size={18} />
        </Button>

      </div>
    </Card>
  );
}

export default PostCard;