import React, { useState, useEffect } from "react";
import Screen from "../components/molecules/Screen";
import Card from "../components/molecules/Card";
import Input from "../components/atoms/Input";
import Button from "../components/atoms/Button";
import { useCurrentUser } from "../contexts/CurrentUserProvider";
import { useNavigate } from "react-router-dom";
import { updateUserProfile, togglePrivateAccount } from "../services/ApiServices";
import GlobalError from "../components/errors/GlobalError";
import { Switch } from "@headlessui/react";
import { Camera, Lock, MapPin, User, FileText, Image } from "lucide-react";

function EditProfilePage() {
  const { currentUser, fetchCurrentUser } = useCurrentUser();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    fullname: "",
    username: "",
    bio: "",
    location: "",
    profilePicture: null,
  });
  const [previewImage, setPreviewImage] = useState(null);
  const [isPrivate, setIsPrivate] = useState(false);
  const [privacyLoading, setPrivacyLoading] = useState(false);

  useEffect(() => {
    if (currentUser) {
      setFormData({
        fullname: currentUser.fullname || "",
        username: currentUser.username || "",
        bio: currentUser.bio || "",
        location: currentUser.location || "",
        profilePicture: null,
      });
      setPreviewImage(currentUser.profilePicture);
      setIsPrivate(currentUser.isPrivateAccount);
    }
  }, [currentUser]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({ ...prev, profilePicture: file }));
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePrivacyToggle = async () => {
    setPrivacyLoading(true);
    try {
      const res = await togglePrivateAccount();
      setIsPrivate(res.data.data.isPrivateAccount);
      await fetchCurrentUser();
    } catch (error) {
      setError(error);
    } finally {
      setPrivacyLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const formDataToSend = new FormData();
      Object.keys(formData).forEach((key) => {
        if (formData[key] !== null) {
          formDataToSend.append(key, formData[key]);
        }
      });

      // Add file size validation
      if (formData.profilePicture) {
        const maxSize = 5 * 1024 * 1024; // 5MB
        if (formData.profilePicture.size > maxSize) {
          throw new Error("Profile picture size should be less than 5MB");
        }
      }

      const response = await updateUserProfile(formDataToSend);
      
      if (!response.data?.data) {
        throw new Error("Failed to update profile");
      }

      await fetchCurrentUser();
      navigate(`/${currentUser.username}`);
    } catch (error) {
      setError(error.response?.data?.message || error.message || "Failed to update profile");
      // Reset the form if there was an error
      if (currentUser) {
        setFormData({
          fullname: currentUser.fullname || "",
          username: currentUser.username || "",
          bio: currentUser.bio || "",
          location: currentUser.location || "",
          profilePicture: null,
        });
        setPreviewImage(currentUser.profilePicture);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen middleScreen>
      <Card className="max-w-2xl w-full">
        <h1 className="text-2xl font-bold mb-6">Edit Profile</h1>
        
        {error && <GlobalError error={error} />}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Profile Picture */}
          <div className="flex flex-col items-center gap-4">
            <div className="w-24 h-24 flex items-center justify-center bg-slate-300 rounded-full border-4 border-white dark:border-black overflow-hidden relative group">
              <img
                src={previewImage || "/default-avatar.png"}
                alt="Profile preview"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-200 flex items-center justify-center rounded-full">
                <Camera className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
              </div>
            </div>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
              id="profile-picture"
            />
            <label
              htmlFor="profile-picture"
              className="cursor-pointer flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors duration-200"
            >
              <Image size={16} />
              Change Profile Picture
            </label>
          </div>

          {/* Form Fields */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <User size={16} className="text-gray-500" />
              <Input
                label="Full Name"
                name="fullname"
                value={formData.fullname}
                onChange={handleInputChange}
                required
                className="flex-1"
              />
            </div>
            
            <div className="flex items-center gap-3">
              <span className="text-gray-500 text-sm">@</span>
              <Input
                label="Username"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                required
                className="flex-1"
              />
            </div>
            
            <div className="flex items-start gap-3">
              <FileText size={16} className="text-gray-500 mt-2" />
              <Input
                label="Bio"
                name="bio"
                value={formData.bio}
                onChange={handleInputChange}
                multiline
                rows={3}
                className="flex-1"
              />
            </div>
            
            <div className="flex items-center gap-3">
              <MapPin size={16} className="text-gray-500" />
              <Input
                label="Location"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                className="flex-1"
              />
            </div>
          </div>

          {/* Privacy Toggle */}
          <div className="flex items-center justify-between py-4 border-t border-b border-gray-200 dark:border-gray-800">
  <div className="flex items-center gap-3 flex-1 min-w-0 pr-4">
    <Lock size={16} className="text-gray-500 flex-shrink-0" />
    <div className="min-w-0">
      <h3 className="font-medium">Private Account</h3>
      <p className="text-sm text-gray-500">
        When your account is private, only approved followers can see your posts
      </p>
    </div>
  </div>
  <Switch
    checked={isPrivate}
    onChange={handlePrivacyToggle}
    disabled={privacyLoading}
    className={`${
      isPrivate ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-600'
    } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex-shrink-0`}
  >
    <span
      className={`${
        isPrivate ? 'translate-x-6' : 'translate-x-1'
      } inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ease-in-out`}
    />
  </Switch>
</div>
          {/* Buttons */}
          <div className="flex justify-end gap-4 mt-6">
            <Button
              type="button"
              onClick={() => navigate(`/${currentUser.username}`)}
              className="px-6 py-2 bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 rounded-full"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              loading={loading}
              className="px-6 py-2 bg-blue-500 text-white hover:bg-blue-600 rounded-full"
            >
              Save Changes
            </Button>
          </div>
        </form>
      </Card>
    </Screen>
  );
}

export default EditProfilePage;