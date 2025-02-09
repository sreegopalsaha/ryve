import { createBrowserRouter, RouterProvider } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import SignUpPage from "./pages/SignUpPage";
import ThemeLayout from "./layout/ThemeLayout";
import FeedPage from "./pages/FeedPage";
import NotificationsPage from "./pages/NotificationsPage";
import MessagesPage from "./pages/MessagesPage";
import Applayout from "./layout/Applayout";
import PrivateRoute from "./PrivateRoute";

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
