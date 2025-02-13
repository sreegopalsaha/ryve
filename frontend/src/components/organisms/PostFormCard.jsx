import React, { useState, useEffect } from "react";
import { X, ImageIcon, MapPin, Sparkles } from "lucide-react";
import { createPost, enhanceContent, getLocation } from "../../services/ApiServices";
import { useCurrentUser } from "../../contexts/CurrentUserProvider";
import Card from "../molecules/Card";
import Button from "../atoms/Button";
import { useNavigate } from "react-router-dom";

const PostFormCard = ({ setPosts }) => {
  const [content, setContent] = useState("");
  const [image, setImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [posting, setPosting] = useState(false);
  const [postingError, setPostingError] = useState(null);
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
              data.address.city ||
              data.address.town ||
              data.address.village ||
              data.address.state ||
              data.address.region ||
              data.address.province ||
              data.address.country ||
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
    if (!content) return;
    setIsEnhancing(true);
    try {
      const res = await enhanceContent({content});
      const newContent = res.data?.data;
      setContent(newContent);
    } catch (error) {
      console.log("Error enhancing content:");
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
    if (!content && !image) return;
    setPosting(true);

    const formData = new FormData();
    if (content) formData.append("content", content);
    if (image) formData.append("image", image);
    if (location) formData.append("location", location);

    try {
      const res = await createPost(formData);
      let newPost = res.data?.data;
      newPost.author = currentUser;
      setPosts((prev) => [newPost, ...prev]);
      setContent("");
      setImage(null);
      setPreviewImage(null);
      setLocation("");
    } catch (error) {
      setPostingError(error);
      console.log("Error while posting", error);
    } finally {
      setPosting(false);
    }
  };

  return (
    <Card className="max-w-[40rem]">
      <div className="flex space-x-4">
        <img
          src={currentUser?.profilePicture}
          alt={`${currentUser?.fullname}'s profile`}
          className={`w-10 h-10 rounded-full ${!currentUser ? "hidden" : ""}`}
          onClick={()=>{navigate(`/${currentUser?.username}`)}}
        />

        <div className="flex-1">
          <form onSubmit={handlePost}>
            <textarea
              className="w-full h-[2rem] outline-none border-none focus:ring-0 resize-y scrollbar-hidden bg-transparent"
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
                  className="absolute top-2 right-2 p-1 bg-black/50 rounded-full text-white hover:bg-black/70"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
            )}

            {location && (
              <div className="mt-2 text-sm text-blue-500 flex items-center gap-2">
                📍 {location}
                <button
                  onClick={() => setLocation("")}
                  className="theme-text hover:text-red-700 text-xs font-bold"
                >
                  ✕
                </button>
              </div>
            )}
            <div className="mt-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <label
                  htmlFor="image-upload"
                  className="p-2 text-blue-500 rounded-full hover:bg-blue-50 dark:hover:bg-blue-900/50 cursor-pointer"
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
                  className="p-2 text-blue-500 rounded-full hover:bg-blue-50 dark:hover:bg-blue-900/50"
                >
                  <MapPin className="w-5 h-5" />
                </Button>

                <Button
                  type="button"
                  onClick={handleEnhance}
                  className={`p-2 rounded-full hover:bg-blue-50 dark:hover:bg-blue-900/50 ${
                    isEnhancing || !content
                      ? "text-blue-300 cursor-not-allowed"
                      : "text-blue-500 cursor-pointer"
                  }`}
                >
                  <Sparkles
                    className={`w-5 h-5 ${isEnhancing ? "animate-spin" : ""}`}
                  />
                </Button>
              </div>

              <div className="flex items-center space-x-4">
                {content.length > 0 && (
                  <div className={`text-sm 'text-gray-500'}`}>
                    {content.length}
                  </div>
                )}
                <Button
                  type="submit"
                  loading={posting}
                  className={`px-4 py-1.5 rounded-full font-semibold text-white bg-blue-500`}
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
