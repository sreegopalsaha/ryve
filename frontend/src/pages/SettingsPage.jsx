import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  User,
  Moon,
  Sun,
  Bell,
  Lock,
  Shield,
  LogOut,
  ChevronRight,
  Loader2,
} from "lucide-react";
import Cookies from "js-cookie";
import Screen from "../components/molecules/Screen";
import Toggle from "../components/atoms/Toggle";
import { useTheme } from "../contexts/ThemeContext";
import { useCurrentUser } from "../contexts/CurrentUserProvider";
import { updateAccountDetails } from "../services/ApiServices";

function SettingsSection({ title, children }) {
  return (
    <div className="flex flex-col gap-1">
      <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 px-1 mb-1">
        {title}
      </h2>
      <div className="flex flex-col rounded-xl overflow-hidden border border-gray-200 dark:border-gray-800">
        {children}
      </div>
    </div>
  );
}

function SettingsRow({ icon: Icon, label, sublabel, onClick, rightElement }) {
  return (
    <div
      onClick={onClick}
      className="flex items-center gap-3 p-4 bg-primary-light-card dark:bg-primary-dark-card hover:bg-gray-100 dark:hover:bg-gray-800/60 cursor-pointer transition-colors w-full text-left border-b border-gray-100 dark:border-gray-800/60 last:border-b-0"
    >
      {Icon && (
        <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800 flex-shrink-0">
          <Icon className="w-4 h-4 theme-text" />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium theme-text">{label}</p>
        {sublabel && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{sublabel}</p>
        )}
      </div>
      {rightElement !== undefined ? (
        rightElement
      ) : (
        <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
      )}
    </div>
  );
}

function SettingsPage() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const { currentUser, updateCurrentUser } = useCurrentUser();

  const [privacyLoading, setPrivacyLoading] = useState(false);
  const [privacyError, setPrivacyError] = useState("");

  const isDark = theme === "dark";
  const isPrivate = currentUser?.isPrivateAccount ?? false;

  const handlePrivacyToggle = async () => {
    setPrivacyLoading(true);
    setPrivacyError("");
    const newPrivacyState = !isPrivate;
    try {
      await updateAccountDetails({ isPrivateAccount: newPrivacyState });
      updateCurrentUser({ isPrivateAccount: newPrivacyState });
    } catch (err) {
      setPrivacyError(
        err?.response?.data?.message || "Failed to update privacy setting."
      );
    } finally {
      setPrivacyLoading(false);
    }
  };

  const handleLogout = () => {
    Cookies.remove("token");
    navigate("/login");
  };

  return (
    <Screen middleScreen className="gap-6">
      <div className="pb-3 border-b border-gray-200 dark:border-gray-800">
        <h1 className="text-2xl font-bold tracking-tight theme-text">Settings</h1>
      </div>

      <SettingsSection title="Account">
        <SettingsRow
          icon={User}
          label="Edit Profile"
          sublabel="Update your name, username, bio, and photo"
          onClick={() => navigate("/edit-profile")}
        />
      </SettingsSection>

      <SettingsSection title="Preferences">
        <SettingsRow
          icon={isDark ? Moon : Sun}
          label={isDark ? "Dark Mode" : "Light Mode"}
          sublabel="Toggle between dark and light theme"
          onClick={toggleTheme}
          rightElement={
            <Toggle
              checked={isDark}
              onChange={toggleTheme}
              ariaLabel="Toggle theme"
            />
          }
        />
        <SettingsRow
          icon={Bell}
          label="Notifications"
          sublabel="View your notifications"
          onClick={() => navigate("/notifications")}
        />
      </SettingsSection>

      <SettingsSection title="Privacy">
        <div className="flex flex-col">
          <SettingsRow
            icon={Lock}
            label={isPrivate ? "Private Account" : "Public Account"}
            sublabel={
              isPrivate
                ? "Only approved followers can see your posts"
                : "Anyone can see your posts and follow you"
            }
            onClick={privacyLoading ? undefined : handlePrivacyToggle}
            rightElement={
              privacyLoading ? (
                <Loader2 className="w-5 h-5 animate-spin text-gray-400 flex-shrink-0" />
              ) : (
                <button
                  onClick={(e) => { e.stopPropagation(); handlePrivacyToggle(); }}
                  disabled={privacyLoading}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 focus:outline-none flex-shrink-0 ${
                    isPrivate ? "bg-indigo-500" : "bg-gray-300"
                  }`}
                  aria-label="Toggle private account"
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-300 ${
                      isPrivate ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              )
            }
          />
          {privacyError && (
            <p className="text-xs text-red-500 dark:text-red-400 px-4 pb-3">{privacyError}</p>
          )}
        </div>
      </SettingsSection>

      <SettingsSection title="Security">
        <SettingsRow
          icon={Shield}
          label="Security Settings"
          sublabel="Change password and manage account security"
          onClick={() => navigate("/edit-profile")}
        />
      </SettingsSection>

      <SettingsSection title="Session">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 p-4 bg-primary-light-card dark:bg-primary-dark-card hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors w-full text-left"
        >
          <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-red-100 dark:bg-red-950/40 flex-shrink-0">
            <LogOut className="w-4 h-4 text-red-500" />
          </div>
          <span className="text-sm font-medium text-red-500">Log Out</span>
        </button>
      </SettingsSection>
    </Screen>
  );
}

export default SettingsPage;
