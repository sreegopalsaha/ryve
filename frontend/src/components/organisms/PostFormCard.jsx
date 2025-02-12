import React, { useState, useEffect } from "react";
import Card from "../molecules/Card";
import Button from "../atoms/Button";
import { UploadCloud } from "lucide-react";
import { createPost } from "../../services/ApiServices";
import { useCurrentUser } from "../../contexts/CurrentUserProvider";

const PostFormCard = ({ setPosts }) => {
  const [content, setContent] = useState("");
  const [image, setImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [posting, setPosting] = useState(false);
  const [postingError, setPostingError] = useState(null);
  const { currentUser } = useCurrentUser();

  const handleContentChange = (e) => {
    setContent(e.target.value);
  };

  const handleImageChange = (e) => {
    if (previewImage) {
      URL.revokeObjectURL(previewImage);
    }

    const file = e.target.files[0];
    if (file) {
      setImage(file);
      const preview = URL.createObjectURL(file);
      setPreviewImage(preview);
    }
  };

  useEffect(() => {
    return () => {
      if (previewImage) {
        URL.revokeObjectURL(previewImage);
      }
    };
  }, [previewImage]);

  const handlePost = async (e) => {
    e.preventDefault();
    if (!content && !image) return;
    setPosting(true);

    const formData = new FormData();

    if (content) {
      formData.append("content", content);
    }
    if (image) {
      formData.append("image", image);
    }

    try {
      const res = await createPost(formData);
      let newPost = res.data?.data;
      newPost.author = currentUser;
      setPosts((prev) => [newPost, ...prev]);
    } catch (error) {
      setPostingError(error);
      console.log("Error while posting", error);
    } finally {
      setPosting(false);
    }

    setContent("");
    setImage(null);
    setPreviewImage(null);
  };

  return (
    <Card>
      {currentUser && (
        <div className="flex items-center mb-4">
          {currentUser.profilePicture && (
            <img
              src={currentUser.profilePicture}
              alt={`${currentUser.fullname}'s profile`}
              className="w-10 h-10 rounded-full mr-2"
            />
          )}
          <h2 className="text-lg font-medium">
            Hey, {currentUser.fullname}!
          </h2>
        </div>
      )}

      <form onSubmit={handlePost}>
        <textarea
          className="w-full h-32 p-2 theme-input resize-none"
          placeholder="What's on your mind?"
          value={content}
          onChange={handleContentChange}
        />

        <div className="mt-4 theme-text">
          <input
            id="image-upload"
            type="file"
            name="image"
            accept="image/*"
            onChange={handleImageChange}
            className="hidden"
          />
          <label
            htmlFor="image-upload"
            className="cursor-pointer inline-flex items-center px-4 py-2 bg-blue-800 text-white rounded"
          >
            <UploadCloud className="h-6 w-6" />
            <span className="ml-2">
              {previewImage ? "Change Image" : "Upload Image"}
            </span>
          </label>
        </div>

        {previewImage && (
          <div className="mt-4">
            <img
              src={previewImage}
              alt="preview"
              className="w-20 h-20 object-cover rounded"
            />
          </div>
        )}

        <Button
          loading={posting}
          type="submit"
          className="mt-4 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded"
        >
          Post
        </Button>
      </form>
    </Card>
  );
};

export default PostFormCard;
