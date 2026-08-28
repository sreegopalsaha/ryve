import React from "react";
import { X, Star, Settings, UserPlus, LogOut, Moon, Sun } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import Toggle from "../../components/atoms/Toggle";

function ProfileMenu({
  isOpen,
  onClose,
  currentUser,
  pendingRequests,
  isDark,
  toggleTheme,
}) {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleMenuNavigate = (path) => {
    onClose();
    navigate(path);
  };

  const handleLogout = () => {
    onClose();
    Cookies.remove("token");
    navigate("/login");
  };

  return (
    <div className="md:hidden fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div className="absolute right-0 top-0 h-full w-72 flex flex-col theme-card border-l border-gray-200 dark:border-gray-800 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-gray-800">
          <span className="text-base font-semibold theme-text">Menu</span>
          <button
            onClick={onClose}
            aria-label="Close menu"
            className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors theme-text"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User profile item */}
        <div
          className="flex items-center gap-3 px-5 py-4 border-b border-gray-200 dark:border-gray-800 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          onClick={() => handleMenuNavigate(`/${currentUser?.username}`)}
        >
          <img
            src={
              currentUser?.profilePicture ||
              "https://res.cloudinary.com/dmwlciwjk/image/upload/v1739380034/anonymous-user_tb3tgs.jpg"
            }
            alt={currentUser?.fullname}
            className="w-10 h-10 rounded-full object-cover flex-shrink-0"
          />
          <div className="min-w-0">
            <p className="text-sm font-semibold theme-text truncate">
              {currentUser?.fullname}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
              @{currentUser?.username}
            </p>
          </div>
        </div>

        {/* Navigation Options */}
        <nav className="flex flex-col py-2 flex-1">
          <button
            onClick={() => handleMenuNavigate("/starred")}
            className="flex items-center gap-3 px-5 py-3.5 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors theme-text text-sm font-medium w-full text-left"
          >
            <Star className="w-5 h-5 flex-shrink-0" />
            <span>Starred Posts</span>
          </button>

          {currentUser?.isPrivateAccount && (
            <button
              onClick={() => handleMenuNavigate("/follow-requests")}
              className="flex items-center gap-3 px-5 py-3.5 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors theme-text text-sm font-medium w-full text-left"
            >
              <div className="relative flex-shrink-0">
                <UserPlus className="w-5 h-5" />
                {pendingRequests > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[9px] rounded-full min-w-[15px] h-[15px] flex items-center justify-center font-bold px-0.5">
                    {pendingRequests > 99 ? "99+" : pendingRequests}
                  </span>
                )}
              </div>
              <span>Follow Requests</span>
              {pendingRequests > 0 && (
                <span className="ml-auto bg-red-500 text-white text-xs px-2 py-0.5 rounded-full font-bold flex-shrink-0">
                  {pendingRequests > 99 ? "99+" : pendingRequests}
                </span>
              )}
            </button>
          )}

          <button
            onClick={() => handleMenuNavigate("/settings")}
            className="flex items-center gap-3 px-5 py-3.5 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors theme-text text-sm font-medium w-full text-left"
          >
            <Settings className="w-5 h-5 flex-shrink-0" />
            <span>Settings</span>
          </button>
        </nav>

        {/* Footer actions / theme toggle & logout */}
        <div className="border-t border-gray-200 dark:border-gray-800 py-2">
          <button
            onClick={toggleTheme}
            className="flex items-center gap-3 px-5 py-3.5 w-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors theme-text text-sm font-medium"
          >
            {isDark ? (
              <Moon className="w-5 h-5 flex-shrink-0" />
            ) : (
              <Sun className="w-5 h-5 flex-shrink-0" />
            )}
            <span>{isDark ? "Dark Mode" : "Light Mode"}</span>
            <div className="ml-auto flex-shrink-0 pointer-events-none">
              <Toggle checked={isDark} ariaLabel="Toggle theme" />
            </div>
          </button>

          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-5 py-3.5 w-full hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors text-red-500 text-sm font-medium"
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            <span>Log Out</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProfileMenu;
