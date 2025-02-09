import { createBrowserRouter, RouterProvider } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import SignUpPage from "./pages/SignUpPage";
import ThemeLayout from "./layout/ThemeLayout";

function App() {
  const router = createBrowserRouter([
    {
      path: "/",
      element: <ThemeLayout />,
      children: [
        {
          path: "/",
          element: <LandingPage/>
        },
        {
          path: "/login",
          element: <LoginPage/>
        },
        {
          path: "/signup",
          element: <SignUpPage/>
        }
      ]
    },
    
  ]);

  return <RouterProvider router={router} />;
}

export default App;