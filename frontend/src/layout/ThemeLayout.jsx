import React from "react";
import { Outlet } from "react-router-dom";
import ToggleThemeButton from "../components/molecules/ToggleThemeButton";

function ThemeLayout() {
  return (
    <div className="w-full h-full relative">
      <ToggleThemeButton className={`absolute top-4 right-4`} />
      <Outlet />
    </div>
  );
}

export default ThemeLayout;
