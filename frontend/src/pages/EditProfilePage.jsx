import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle2, Loader2, Camera } from "lucide-react";
import Screen from "../components/molecules/Screen";
import Input from "../components/atoms/Input";
import Button from "../components/atoms/Button";
import { PageHeader } from "../components/molecules/Page-Header";
import { useCurrentUser } from "../contexts/CurrentUserProvider";
import { updateAccountDetails, updateProfilePicture } from "../services/ApiServices";

// Inline textarea that mirrors the Input atom styling
function Textarea({ label, id, className = "", ...rest }) {
  return (
    <div className="w-full flex flex-col">
      {label && (
        <label
          htmlFor={id}
          className="mb-1 text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors duration-300"
        >
          {label}
        </label>
      )}
      <textarea
        id={id}
        rows={3}
        className={`w-full border rounded-xl px-4 py-3 text-sm outline-none resize-none transition-all duration-200 theme-input theme-text ${className}`}
        {...rest}
      />
    </div>
  );
}

// Per-field error message
function FieldError({ message }) {
  if (!message) return null;
  return <p className="mt-1 text-xs text-red-500 dark:text-red-400">{message}</p>;
}

// Client-side validation
function validate(fields) {
  const errors = {};

  if (!fields.fullname.trim()) {
    errors.fullname = "Full name is required.";
  } else if (fields.fullname.trim().length > 60) {
    errors.fullname = "Full name must be 60 characters or fewer.";
  }

  if (!fields.email.trim()) {
    errors.email = "Email is required.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email.trim())) {
    errors.email = "Please enter a valid email address.";
  }

  if (!fields.username.trim()) {
    errors.username = "Username is required.";
  } else if (/\s/.test(fields.username)) {
    errors.username = "Username cannot contain spaces.";
  } else if (fields.username.length > 30) {
    errors.username = "Username must be 30 characters or fewer.";
  } else if (!/^[a-zA-Z0-9_]+$/.test(fields.username)) {
    errors.username = "Username can only contain letters, numbers, and underscores.";
  }

  if (fields.bio && fields.bio.length > 200) {
    errors.bio = "Bio must be 200 characters or fewer.";
  }

  if (fields.location && fields.location.length > 80) {
    errors.location = "Location must be 80 characters or fewer.";
  }

  if (fields.mood && fields.mood.length > 60) {
    errors.mood = "Mood must be 60 characters or fewer.";
  }

  return errors;
}

function EditProfilePage() {
  const navigate = useNavigate();
  const { currentUser, fetchCurrentUser } = useCurrentUser();

  const [formData, setFormData] = useState({
    fullname: "",
    email: "",
    username: "",
    bio: "",
    location: "",
    mood: "",
  });

  const [selectedImage, setSelectedImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [imageError, setImageError] = useState("");
  const fileInputRef = useRef(null);

  const [fieldErrors, setFieldErrors] = useState({});
  const [submitLoading, setSubmitLoading] = useState(false);
  const [apiError, setApiError] = useState("");
  const [success, setSuccess] = useState(false);

  // Clean up object URL on unmount or when preview changes
  useEffect(() => {
    return () => {
      if (previewImage) {
        URL.revokeObjectURL(previewImage);
      }
    };
  }, [previewImage]);

  // Pre-fill form with current user data
  useEffect(() => {
    if (currentUser) {
      setFormData({
        fullname: currentUser.fullname || "",
        email: currentUser.email || "",
        username: currentUser.username || "",
        bio: currentUser.bio || "",
        location: currentUser.location || "",
        mood: currentUser.mood || "",
      });
    }
  }, [currentUser]);

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setImageError("Please select a valid image file.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setImageError("Image size must be less than 5MB.");
      return;
    }

    setImageError("");
    setApiError("");
    setSuccess(false);

    if (previewImage) {
      URL.revokeObjectURL(previewImage);
    }
    setSelectedImage(file);
    setPreviewImage(URL.createObjectURL(file));
  };

  const handleCancelImage = () => {
    if (previewImage) {
      URL.revokeObjectURL(previewImage);
    }
    setSelectedImage(null);
    setPreviewImage(null);
    setImageError("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear field-level error as user types
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: "" }));
    }
    setApiError("");
    setSuccess(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError("");
    setSuccess(false);

    const errors = validate(formData);
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setSubmitLoading(true);
    try {
      // If a new profile picture was selected, upload it first
      if (selectedImage) {
        const imageFormData = new FormData();
        imageFormData.append("profilePicture", selectedImage);
        await updateProfilePicture(imageFormData);
      }

      await updateAccountDetails({
        fullname: formData.fullname.trim(),
        email: formData.email.trim(),
        username: formData.username.trim(),
        bio: formData.bio.trim(),
        location: formData.location.trim(),
        mood: formData.mood.trim(),
      });

      // Refresh global user state so the rest of the app reflects changes immediately
      await fetchCurrentUser();

      if (previewImage) {
        URL.revokeObjectURL(previewImage);
        setPreviewImage(null);
      }
      setSelectedImage(null);

      setSuccess(true);
      setTimeout(() => navigate("/settings"), 1200);
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        "Something went wrong. Please try again.";
      setApiError(message);
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <Screen middleScreen className="gap-6">
      <PageHeader title="Edit Profile" backUrl="/settings" />

      {/* Profile picture & info */}
      <div className="flex items-center gap-4 p-3.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30">
        <div className="relative group flex-shrink-0">
          <img
            src={
              previewImage ||
              currentUser?.profilePicture ||
              "https://res.cloudinary.com/dmwlciwjk/image/upload/v1739380034/anonymous-user_tb3tgs.jpg"
            }
            alt={currentUser?.fullname || "Profile picture"}
            className="w-16 h-16 rounded-full object-cover ring-2 ring-gray-200 dark:ring-gray-700 transition-all"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={submitLoading}
            className="absolute inset-0 flex items-center justify-center bg-black/40 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity disabled:cursor-not-allowed cursor-pointer"
            title="Change photo"
          >
            <Camera className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 min-w-0">
          <p className="font-semibold theme-text truncate">
            {currentUser?.fullname || "User"}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
            @{currentUser?.username || "username"}
          </p>

          <div className="flex items-center gap-2 mt-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={submitLoading}
              className="text-xs font-medium px-2.5 py-1 rounded-md bg-primary-light-accent/10 hover:bg-primary-light-accent/20 text-primary-light-accent dark:bg-primary-dark-accent/20 dark:hover:bg-primary-dark-accent/30 dark:text-primary-dark-accent border border-primary-light-accent/30 dark:border-primary-dark-accent/40 transition-colors cursor-pointer disabled:opacity-50"
            >
              {previewImage ? "Choose different" : "Change Photo"}
            </button>
            {previewImage && (
              <button
                type="button"
                onClick={handleCancelImage}
                disabled={submitLoading}
                className="text-xs font-medium px-2.5 py-1 rounded-md text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30 transition-colors cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
            )}
          </div>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          className="hidden"
          disabled={submitLoading}
        />
      </div>

      {imageError && (
        <p className="text-xs text-red-500 -mt-3">{imageError}</p>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
        {/* Full Name */}
        <div>
          <Input
            type="text"
            name="fullname"
            label="Full Name"
            placeholder="Your full name"
            value={formData.fullname}
            onChange={handleChange}
            autoComplete="name"
            className="theme-input"
            disabled={submitLoading}
          />
          <FieldError message={fieldErrors.fullname} />
        </div>

        {/* Email */}
        <div>
          <Input
            type="email"
            name="email"
            label="Email"
            placeholder="Your email address"
            value={formData.email}
            onChange={handleChange}
            autoComplete="email"
            className="theme-input"
            disabled={submitLoading}
          />
          <FieldError message={fieldErrors.email} />
        </div>

        {/* Username */}
        <div>
          <Input
            type="text"
            name="username"
            label="Username"
            placeholder="Your username"
            value={formData.username}
            onChange={handleChange}
            autoComplete="username"
            className="theme-input"
            disabled={submitLoading}
          />
          <FieldError message={fieldErrors.username} />
        </div>

        {/* Bio */}
        <div>
          <Textarea
            id="bio"
            label="Bio"
            name="bio"
            placeholder="Tell people a little about yourself…"
            value={formData.bio}
            onChange={handleChange}
            disabled={submitLoading}
          />
          <div className="flex justify-between items-start mt-1">
            <FieldError message={fieldErrors.bio} />
            <span className="text-xs text-gray-400 ml-auto">
              {formData.bio.length}/200
            </span>
          </div>
        </div>

        {/* Location */}
        <div>
          <Input
            type="text"
            name="location"
            label="Location"
            placeholder="Where are you based?"
            value={formData.location}
            onChange={handleChange}
            className="theme-input"
            disabled={submitLoading}
          />
          <FieldError message={fieldErrors.location} />
        </div>

        {/* Mood */}
        <div>
          <Input
            type="text"
            name="mood"
            label="Mood"
            placeholder="How are you feeling today?"
            value={formData.mood}
            onChange={handleChange}
            className="theme-input"
            disabled={submitLoading}
          />
          <FieldError message={fieldErrors.mood} />
        </div>

        {apiError && (
          <p className="text-sm text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg px-4 py-3">
            {apiError}
          </p>
        )}

        {/* Success banner */}
        {success && (
          <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg px-4 py-3">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>Profile updated successfully! Redirecting…</span>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex gap-3 pt-1">
          <Button
            type="button"
            onClick={() => navigate("/settings")}
            disabled={submitLoading}
            className="flex-1 py-3 border border-gray-300 dark:border-gray-700 theme-text hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            loading={submitLoading}
            disabled={submitLoading || success}
            className="flex-1 py-3 theme-button"
          >
            {submitLoading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving…
              </span>
            ) : (
              "Save Changes"
            )}
          </Button>
        </div>
      </form>
    </Screen>
  );
}

export default EditProfilePage;
