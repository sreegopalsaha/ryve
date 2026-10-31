import React, { useState, useEffect } from "react";
import { X, ImageIcon, MapPin, Sparkles } from "lucide-react";
import { createPost, enhanceContent, getLocation } from "../../services/ApiServices";
import { useCurrentUser } from "../../contexts/CurrentUserProvider";
import Card from "../molecules/Card";
import Button from "../atoms/Button";
import { useNavigate } from "react-router-dom";
import { DEFAULT_AVATAR } from "../../utils/constants";

const PostFormCard = ({ setPosts }) => {
  const [content, setContent] = useState("");
  const [image, setImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [posting, setPosting] = useState(false);
  const [location, setLocation] = useState("");
  const [isEnhancing, setIsEnhancing] = useState(false);
  const { currentUser } = useCurrentUser();

  const navigate = useNavigate();

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

  const removeImage = () => {
    if (previewImage) {
      URL.revokeObjectURL(previewImage);
    }
    setImage(null);
    setPreviewImage(null);
  };

  const handleLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;
            const res = await getLocation(latitude, longitude);
            const data = res.data;
            const locationName =
              data?.address?.city ||
              data?.address?.town ||
              data?.address?.village ||
              data?.address?.state ||
              data?.address?.region ||
              data?.address?.province ||
              data?.address?.country ||
              "Unknown Location";
            setLocation(locationName);
          } catch (error) {
            console.error("Error fetching location:", error);
            setLocation("Location error");
          }
        },
        (error) => {
          console.error("Geolocation error:", error);
          setLocation("Location access denied");
        }
      );
    }
  };

  const handleEnhance = async () => {
    if (!content.trim()) return;
    setIsEnhancing(true);
    try {
      const res = await enhanceContent({ content });
      const newContent = res.data?.data;
      if (newContent) {
        setContent(newContent);
      }
    } catch (error) {
      console.log("Error enhancing content:", error);
    } finally {
      setIsEnhancing(false);
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
    if (!content.trim() && !image) return;
    setPosting(true);

    const formData = new FormData();
    if (content.trim()) formData.append("content", content.trim());
    if (image) formData.append("image", image);
    if (location) formData.append("location", location);

    try {
      const res = await createPost(formData);
      let newPost = res.data?.data;
      if (newPost) {
        newPost.author = currentUser;
        if (setPosts) {
          setPosts((prev) => [newPost, ...(prev || [])]);
        }
      }
      setContent("");
      setImage(null);
      setPreviewImage(null);
      setLocation("");
    } catch (error) {
      console.log("Error while posting:", error);
    } finally {
      setPosting(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto p-4 sm:p-5">
      <div className="flex gap-3 sm:gap-4">
        <img
          src={currentUser?.profilePicture || DEFAULT_AVATAR}
          alt={currentUser?.fullname ? `${currentUser.fullname}'s avatar` : "Profile"}
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = DEFAULT_AVATAR;
          }}
          className={`w-10 h-10 rounded-full object-cover flex-shrink-0 cursor-pointer ${
            !currentUser ? "hidden" : ""
          }`}
          onClick={() => {
            if (currentUser?.username) navigate(`/${currentUser.username}`);
          }}
        />

        <div className="flex-1 min-w-0">
          <form onSubmit={handlePost}>
            <textarea
              className="w-full min-h-[4rem] outline-none border-none focus:ring-0 resize-y scrollbar-hidden bg-transparent theme-text text-sm sm:text-base placeholder-gray-400"
              placeholder="What's new?"
              value={content}
              onChange={handleContentChange}
            />

            {previewImage && (
              <div className="relative mt-2 rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-800">
                <img
                  src={previewImage}
                  alt="Preview"
                  className="max-h-80 w-full object-cover"
                />
                <Button
                  type="button"
                  onClick={removeImage}
                  className="absolute top-2 right-2 p-1.5 bg-black/60 rounded-full text-white hover:bg-black/80 transition-colors"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            )}

            {location && (
              <div className="mt-2 text-xs sm:text-sm text-primary-light-accent dark:text-primary-dark-accent flex items-center gap-1.5">
                <span>📍 {location}</span>
                <button
                  type="button"
                  onClick={() => setLocation("")}
                  className="theme-text hover:text-red-500 text-xs font-bold px-1"
                >
                  ✕
                </button>
              </div>
            )}

            <div className="mt-3 pt-2 border-t border-gray-100 dark:border-gray-800/60 flex items-center justify-between gap-2">
              <div className="flex items-center gap-1 sm:gap-2">
                <label
                  htmlFor="image-upload"
                  className="p-2 text-primary-light-accent dark:text-primary-dark-accent rounded-full hover:bg-primary-light-accent/10 dark:hover:bg-primary-dark-accent/20 cursor-pointer transition-colors"
                  title="Attach image"
                >
                  <ImageIcon className="w-5 h-5" />
                </label>
                <input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />

                <Button
                  type="button"
                  onClick={handleLocation}
                  className="p-2 text-primary-light-accent dark:text-primary-dark-accent rounded-full hover:bg-primary-light-accent/10 dark:hover:bg-primary-dark-accent/20 transition-colors"
                  title="Add location"
                >
                  <MapPin className="w-5 h-5" />
                </Button>

                <Button
                  type="button"
                  onClick={handleEnhance}
                  disabled={isEnhancing || !content.trim()}
                  className={`p-2 rounded-full transition-colors ${
                    isEnhancing || !content.trim()
                      ? "opacity-40 cursor-not-allowed text-gray-400"
                      : "text-primary-light-accent dark:text-primary-dark-accent hover:bg-primary-light-accent/10 dark:hover:bg-primary-dark-accent/20 cursor-pointer"
                  }`}
                  title="Enhance with AI"
                >
                  <Sparkles
                    className={`w-5 h-5 ${isEnhancing ? "animate-spin" : ""}`}
                  />
                </Button>
              </div>

              <div className="flex items-center gap-3">
                {content.length > 0 && (
                  <span className="text-xs text-gray-400">
                    {content.length}
                  </span>
                )}
                <Button
                  type="submit"
                  loading={posting}
                  disabled={posting || (!content.trim() && !image)}
                  className="px-4 sm:px-5 py-1.5 text-xs sm:text-sm font-semibold btn-primary"
                >
                  Post
                </Button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </Card>
  );
};

export default PostFormCard;
