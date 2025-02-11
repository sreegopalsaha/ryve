import { Home, MessageCircle, Bell, User, Compass, Search, TrendingUpIcon, UserPlus, Settings, HelpCircleIcon } from "lucide-react";
import { NavLink } from "react-router-dom";
import Screen from "../components/molecules/Screen";

function Navbar() {
    const sidebarItems = [
      { name: "Home", slug: "/", icon: Home },
      { name: "Notifications", slug: "/notifications", icon: Bell },
      { name: "Messages", slug: "/messages", icon: MessageCircle },
      { name: "Search", slug: "/search", icon: Search },
      { name: "Explore", slug: "/explore", icon: Compass },
      { name: "Trending", slug: "/trending", icon: TrendingUpIcon },
      { name: "Follow Requests", slug: "/follow-requests", icon: UserPlus },
      { name: "Profile", slug: "/profile", icon: User },
      { name: "Help", slug: "/Help", icon: HelpCircleIcon },
      { name: "Settings", slug: "/settings", icon: Settings },

  ];

    const mobileNavItems = [
        { name: "Home", slug: "/", icon: Home },
        { name: "Search", slug: "/search", icon: Search },
        { name: "Notifications", slug: "/notifications", icon: Bell },
        { name: "Messages", slug: "/messages", icon: MessageCircle },
        { name: "Profile", slug: "/profile", icon: User },
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
          }`
                }
              >
                <item.icon className="w-6 h-6" />
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
              className="p-2 flex flex-col items-center theme-text"
            >
              <item.icon className="w-6 h-6" />
            </NavLink>
          ))}
        </div>
      </>
    );
}

export default Navbar;
