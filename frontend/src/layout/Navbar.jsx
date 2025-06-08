import { Home, MessageCircle, Bell, User, Compass, Search, TrendingUpIcon, UserPlus, Settings, HelpCircleIcon, Star } from "lucide-react";
import { NavLink } from "react-router-dom";
import Screen from "../components/molecules/Screen";
import { useCurrentUser } from "../contexts/CurrentUserProvider";
import { useEffect, useState } from "react";
import { getNotifications, getFollowRequests } from "../services/ApiServices";

function Navbar() {
  const { currentUser } = useCurrentUser();
  const [unreadCount, setUnreadCount] = useState(0);
  const [pendingRequests, setPendingRequests] = useState(0);

  useEffect(() => {
    if (!currentUser) {
      setUnreadCount(0);
      setPendingRequests(0);
      return;
    }

    const fetchNotificationCount = async () => {
      try {
        const res = await getNotifications();
        const notifications = res?.data?.data || [];
        const unread = notifications.filter((notification) => !notification.read).length;
        setUnreadCount(unread);
      } catch (error) {
        console.error("Error fetching notifications count:", error);
      }
    };

    const fetchFollowRequestsCount = async () => {
      if (!currentUser?.isPrivateAccount) {
        setPendingRequests(0);
        return;
      }
      try {
        const res = await getFollowRequests();
        const requests = res?.data?.data || [];
        setPendingRequests(requests.length);
      } catch (error) {
        console.error("Error fetching follow requests count:", error);
      }
    };

    fetchNotificationCount();
    fetchFollowRequestsCount();

    const interval = setInterval(() => {
      fetchNotificationCount();
      fetchFollowRequestsCount();
    }, 30000);

    return () => clearInterval(interval);
  }, [currentUser]);

  const sidebarItems = [
    { name: "Home", slug: "/", icon: Home },
    { name: "Notifications", slug: "/notifications", icon: Bell, badge: unreadCount },
    { name: "Messages", slug: "/messages", icon: MessageCircle },
    { name: "Starred", slug: "/starred", icon: Star },
    { name: "Search", slug: "/search", icon: Search },
    { name: "Explore", slug: "/explore", icon: Compass },
    { name: "Trending", slug: "/trending", icon: TrendingUpIcon },
    ...(currentUser?.isPrivateAccount
      ? [
          {
            name: "Follow Requests",
            slug: "/follow-requests",
            icon: UserPlus,
            badge: pendingRequests,
          },
        ]
      : []),
    { name: "Profile", slug: `/${currentUser?.username}`, icon: User },
    { name: "Help", slug: "/Help", icon: HelpCircleIcon },
    { name: "Settings", slug: "/settings", icon: Settings },
  ];

  const mobileNavItems = [
    { name: "Home", slug: "/", icon: Home },
    { name: "Search", slug: "/search", icon: Search },
    { name: "Notifications", slug: "/notifications", icon: Bell, badge: unreadCount },
    ...(currentUser?.isPrivateAccount
      ? [
          {
            name: "Follow Requests",
            slug: "/follow-requests",
            icon: UserPlus,
            badge: pendingRequests,
          },
        ]
      : []),
    { name: "Messages", slug: "/messages", icon: MessageCircle },
    { name: "Profile", slug: `/${currentUser?.username}`, icon: User },
  ];

  return (
    <>
      {/* Sidebar for Desktop */}
      <Screen className="hidden md:flex w-[25%] flex-col gap-4 fixed top-0 left-0">
        <h1 className="text-3xl font-bold tracking-tight">Ryve</h1>
        <nav className="flex flex-col gap-3">
          {sidebarItems.map((item) => (
            <NavLink
              key={item.slug}
              to={item.slug}
              className={({ isActive }) =>
                `grid grid-cols-[auto,1fr] items-center gap-2 p-3 rounded-lg text-lg font-medium transition-all duration-300 relative
        ${
          isActive
            ? "bg-gray-200 dark:bg-gray-800"
            : "hover:bg-gray-200 dark:hover:bg-gray-800"
        }
         ${!currentUser ? "pointer-events-none opacity-50" : ""}
        `
              }
            >
              <div className="relative flex items-center justify-center">
                <item.icon className="w-6 h-6" />
                {item.badge > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[10px] rounded-full min-w-[18px] h-[18px] flex items-center justify-center font-bold px-1">
                    {item.badge > 99 ? "99+" : item.badge}
                  </span>
                )}
              </div>
              <div className="flex items-center justify-between">
                <span>{item.name}</span>
                {item.badge > 0 && (
                  <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full font-bold">
                    {item.badge > 99 ? "99+" : item.badge}
                  </span>
                )}
              </div>
            </NavLink>
          ))}
        </nav>
      </Screen>

      {/* Bottom Navbar for Mobile */}
      <div className="md:hidden z-50 fixed bottom-0 left-0 w-full bg-white p-2 flex justify-around theme-card">
        {mobileNavItems.map((item) => (
          <NavLink
            key={item.slug}
            to={item.slug}
            className={({ isActive }) => `p-2 flex flex-col items-center theme-text relative ${isActive ? "bg-gray-200 dark:bg-gray-800 rounded-full" : "hover:bg-gray-200 dark:hover:bg-gray-800 rounded-full"} 
            ${!currentUser ? "pointer-events-none opacity-50" : ""}
`}
          >
            <div className="relative flex items-center justify-center">
              <item.icon className="w-6 h-6" />
              {item.badge > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[10px] rounded-full min-w-[16px] h-[16px] flex items-center justify-center font-bold px-0.5">
                  {item.badge > 99 ? "99+" : item.badge}
                </span>
              )}
            </div>
          </NavLink>
        ))}
      </div>
    </>
  );
}

export default Navbar;