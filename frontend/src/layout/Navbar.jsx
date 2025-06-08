import { Home, MessageCircle, Bell, User, Search, TrendingUpIcon, UserPlus, Settings, Star } from "lucide-react";
import { NavLink } from "react-router-dom";
import Screen from "../components/molecules/Screen";
import { useCurrentUser } from "../contexts/CurrentUserProvider";
import { useEffect, useState } from 'react';
import { getNotifications, getFollowRequests } from '../services/ApiServices';

function Navbar() {
  const {currentUser} = useCurrentUser();
  const [unreadCount, setUnreadCount] = useState(0);
  const [pendingRequests, setPendingRequests] = useState(0);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await getNotifications();
        const unread = response.data.data.filter(n => !n.read).length;
        setUnreadCount(unread);
      } catch (error) {
        console.error('Error fetching notifications:', error);
      }
    };

    const fetchFollowRequests = async () => {
      try {
        const response = await getFollowRequests();
        setPendingRequests(response.data.data.length);
      } catch (error) {
        console.error('Error fetching follow requests:', error);
      }
    };

    if (currentUser) {
      fetchNotifications();
      if (currentUser.isPrivateAccount) {
        fetchFollowRequests();
      }
      // Set up polling for new notifications and requests
      const interval = setInterval(() => {
        fetchNotifications();
        if (currentUser.isPrivateAccount) {
          fetchFollowRequests();
        }
      }, 30000); // Poll every 30 seconds
      return () => clearInterval(interval);
    }
  }, [currentUser]);

    const sidebarItems = [
      { name: "Home", slug: "/", icon: Home },
      { name: "Notifications", slug: "/notifications", icon: Bell, badge: unreadCount },
      { name: "Messages", slug: "/messages", icon: MessageCircle },
      { name: "Search", slug: "/search", icon: Search },
      { name: "Trending", slug: "/trending", icon: TrendingUpIcon },
      { name: "Starred", slug: "/starred", icon: Star },
      ...(currentUser?.isPrivateAccount ? [
        { name: "Follow Requests", slug: "/follow-requests", icon: UserPlus, badge: pendingRequests }
      ] : []),
      { name: "Profile", slug: `/${currentUser?.username}`, icon: User },
      { name: "Settings", slug: "/settings", icon: Settings },
  ];

    const mobileNavItems = [
        { name: "Home", slug: "/", icon: Home },
        { name: "Search", slug: "/search", icon: Search },
        { name: "Notifications", slug: "/notifications", icon: Bell, badge: unreadCount },
        { name: "Messages", slug: "/messages", icon: MessageCircle },
        { name: "Starred", slug: "/starred", icon: Star },
        ...(currentUser?.isPrivateAccount ? [
          { name: "Follow Requests", slug: "/follow-requests", icon: UserPlus, badge: pendingRequests }
        ] : []),
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
                  `grid grid-cols-[auto,1fr] gap-2 p-3 rounded-lg text-lg font-medium transition-all duration-300 
          ${
            isActive
              ? "bg-gray-200 dark:bg-gray-800"
              : "hover:bg-gray-200 dark:hover:bg-gray-800"
          }
           ${!currentUser ? "pointer-events-none opacity-50" : ""}
          `
                }
              >
                <div className="relative">
                  <item.icon className="w-6 h-6" />
                  {item.badge > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                      {item.badge}
                    </span>
                  )}
                </div>
                <span>{item.name}</span>
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
              className={({isActive})=> `p-2 flex flex-col items-center theme-text ${isActive ? "bg-gray-200 dark:bg-gray-800 rounded-full" : "hover:bg-gray-200 dark:hover:bg-gray-800 rounded-full"} 
              ${!currentUser ? "pointer-events-none opacity-50" : ""}
`}
            >
              <div className="relative">
                <item.icon className="w-6 h-6" />
                {item.badge > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                    {item.badge}
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