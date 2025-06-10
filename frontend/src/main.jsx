import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import ThemeProvider from "./contexts/ThemeContext.jsx";
import { CurrentUserProvider } from "./contexts/CurrentUserProvider.jsx";
import { PostProvider } from "./contexts/PostProvider.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ThemeProvider>
      <CurrentUserProvider>
        <PostProvider>
          <App />
        </PostProvider>
      </CurrentUserProvider>
    </ThemeProvider>
  </StrictMode>
);
