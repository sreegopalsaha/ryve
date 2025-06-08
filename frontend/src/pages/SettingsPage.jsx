import React from "react";
import { useNavigate } from "react-router-dom";
import { LogOut, Bell, Lock, Shield, User, Moon, Sun } from "lucide-react";
import Screen from "../components/molecules/Screen";
import Card from "../components/molecules/Card";
import Button from "../components/atoms/Button";
import { useTheme } from "../contexts/ThemeContext";
import { useCurrentUser } from "../contexts/CurrentUserProvider";
import Cookies from "js-cookie";

function SettingsPage() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const { currentUser } = useCurrentUser();

  const handleLogout = () => {
    Cookies.remove("token");
    navigate("/login");
  };

  const settingsSections = [
    {
      title: "Account",
      items: [
        {
          icon: <User className="w-5 h-5" />,
          title: "Edit Profile",
          description: "Change your profile information",
          onClick: () => navigate("/edit-profile"),
        },
        {
          icon: <Lock className="w-5 h-5" />,
          title: "Privacy",
          description: "Manage your privacy settings",
          onClick: () => navigate("/edit-profile"),
        },
      ],
    },
    {
      title: "Preferences",
      items: [
        {
          icon: theme === "light" ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />,
          title: "Theme",
          description: "Change your theme preference",
          onClick: toggleTheme,
        },
        {
          icon: <Bell className="w-5 h-5" />,
          title: "Notifications",
          description: "Manage your notification settings",
          onClick: () => navigate("/notifications"),
        },
      ],
    },
    {
      title: "Security",
      items: [
        {
          icon: <Shield className="w-5 h-5" />,
          title: "Security Settings",
          description: "Manage your account security",
          onClick: () => navigate("/edit-profile"),
        },
      ],
    },
  ];

  return (
    <Screen middleScreen>
      <div className="max-w-2xl mx-auto w-full">
        <h1 className="text-2xl font-bold mb-6 theme-text">Settings</h1>

        {settingsSections.map((section, index) => (
          <Card key={index} className="mb-6">
            <div className="p-4">
              <h2 className="text-lg font-semibold mb-4 theme-text">{section.title}</h2>
              <div className="flex flex-col gap-2">
                {section.items.map((item, itemIndex) => (
                  <button
                    key={itemIndex}
                    onClick={item.onClick}
                    className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200 w-full text-left"
                  >
                    <div className="text-gray-500 dark:text-gray-400">{item.icon}</div>
                    <div className="flex-1">
                      <h3 className="font-medium theme-text">{item.title}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{item.description}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </Card>
        ))}

        <Button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 p-4 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/50 rounded-lg transition-colors duration-200"
        >
          <LogOut className="w-5 h-5" />
          <span>Logout</span>
        </Button>
      </div>
    </Screen>
  );
}

export default SettingsPage; 