import React, { useState, useEffect } from "react";
import { X, ImageIcon, MapPin, MapPinOff, Sparkles, Loader2 } from "lucide-react";
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
  const [locationError, setLocationError] = useState("");
  const [isLocating, setIsLocating] = useState(false);
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
    setLocationError("");

    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser");
      return;
    }

    setIsLocating(true);
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
            data?.address?.suburb ||
            data?.address?.state ||
            data?.address?.region ||
            data?.address?.province ||
            data?.address?.country ||
            "Unknown Location";
          setLocation(locationName);
          setLocationError("");
        } catch (error) {
          console.error("Error fetching location:", error);
          setLocationError("Unable to fetch location details");
        } finally {
          setIsLocating(false);
        }
      },
      (error) => {
        console.error("Geolocation error:", error);
        setIsLocating(false);
        if (error.code === 1) {
          setLocationError("Location access denied");
        } else if (error.code === 2) {
          setLocationError("Location unavailable");
        } else if (error.code === 3) {
          setLocationError("Location request timed out");
        } else {
          setLocationError("Location access denied");
        }
      },
      { timeout: 10000, enableHighAccuracy: false }
    );
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
      setLocationError("");
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

            {(isLocating || location || locationError) && (
              <div className="mt-2.5 flex items-center flex-wrap gap-2">
                {isLocating && (
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-700/60">
                    <Loader2 className="w-3.5 h-3.5 animate-spin flex-shrink-0" />
                    <span>Detecting location...</span>
                  </div>
                )}

                {!isLocating && location && (
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-primary-light-accent/10 dark:bg-primary-dark-accent/15 text-primary-light-accent dark:text-primary-dark-accent border border-primary-light-accent/25 dark:border-primary-dark-accent/30 max-w-full">
                    <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                    <span className="truncate max-w-[200px] sm:max-w-xs">{location}</span>
                    <button
                      type="button"
                      onClick={() => setLocation("")}
                      className="p-0.5 rounded-full hover:bg-primary-light-accent/20 dark:hover:bg-primary-dark-accent/30 text-primary-light-accent dark:text-primary-dark-accent transition-colors"
                      title="Remove location"
                      aria-label="Remove location"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}

                {!isLocating && locationError && (
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/25 max-w-full">
                    <MapPinOff className="w-3.5 h-3.5 flex-shrink-0" />
                    <span className="truncate">{locationError}</span>
                    <button
                      type="button"
                      onClick={() => setLocationError("")}
                      className="p-0.5 rounded-full hover:bg-red-500/20 text-red-600 dark:text-red-400 transition-colors"
                      title="Dismiss error"
                      aria-label="Dismiss error"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}
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
                  disabled={isLocating}
                  className={`p-2 rounded-full transition-colors ${
                    location
                      ? "text-primary-light-accent dark:text-primary-dark-accent bg-primary-light-accent/15 dark:bg-primary-dark-accent/25"
                      : "text-primary-light-accent dark:text-primary-dark-accent hover:bg-primary-light-accent/10 dark:hover:bg-primary-dark-accent/20"
                  } ${isLocating ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}`}
                  title={isLocating ? "Detecting location..." : location ? "Update location" : "Add location"}
                >
                  {isLocating ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <MapPin className="w-5 h-5" />
                  )}
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
