import { createBrowserRouter, RouterProvider } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import SignUpPage from "./pages/SignUpPage";
import ThemeLayout from "./layout/ThemeLayout";
import FeedPage from "./pages/FeedPage/FeedPage";
import NotificationsPage from "./pages/NotificationsPage";
import MessagesPage from "./pages/MessagesPage";
import Applayout from "./layout/Applayout";
import PrivateRoute from "./PrivateRoute";
import UserProfilePage from "./pages/ProfilePage/ProfilePage";
import FollowingFollowersPage from "./pages/FollowingFollowersPage";
import SearchPage from "./pages/SearchPage";

function App() {
  const router = createBrowserRouter([
    {
      path: "/",
      element: <Applayout />,
      children: [
        {
          index: true,
          element: <PrivateRoute element={<FeedPage/>}/>
        },
        {
          path: "notifications",
          element: <PrivateRoute element={<NotificationsPage/>}/>
        },
        {
          path: "messages",
          element: <PrivateRoute element={<MessagesPage/>}/>

        },
        {
          path: ":userIdentifier",
          element: <PrivateRoute element={<UserProfilePage />} />,
        },
        {
          path: ":userIdentifier/following",
          element: <PrivateRoute element={<FollowingFollowersPage />} />,
        },
        {
          path: ":userIdentifier/followers",
          element: <PrivateRoute element={<FollowingFollowersPage />} />,
        },
        {
          path: "search",
          element:  <PrivateRoute element={<SearchPage />}/>
        },
      ],
    },
    {
      path: "/",
      element: <ThemeLayout />,
      children: [
        {
          path: "welcome",
          element: <LandingPage/>
        },
        {
          path: "login",
          element: <LoginPage />,
        },
        {
          path: "signup",
          element: <SignUpPage />,
        },
      ],
    },
  ]);

  return <RouterProvider router={router} />;
}

export default App;
