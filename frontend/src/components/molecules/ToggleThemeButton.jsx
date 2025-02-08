import { useTheme } from "../../contexts/ThemeContext";
import Button from "../atoms/Button";
import { Sun, Moon } from "lucide-react";

const ToggleThemeButton = ({ className, ...rest }) => {
  const { toggleTheme, theme } = useTheme();

  return (
    <Button
      className={`p-4 rounded-lg bg-white/80 dark:bg-black/80 dark:text-white backdrop-blur-sm border border-black/10 dark:border-white/10 shadow-sm hover:shadow-md transition-all duration-300 ease-in-outhover:scale-105 active:scale-95 ${className}`}
      onClick={toggleTheme}
      {...rest}
    >
      <div className="relative w-5 h-5">
        <div
          className={`absolute top-0 left-0 transform transition-all duration-300 ease-in-out ${ theme === "light" ? "rotate-0 opacity-100" : "-rotate-90 opacity-0" }`}
        >
          <Moon className="w-5 h-5" />
        </div>
        <div
          className={`absolute top-0 left-0 transform transition-all duration-300 ease-in-out ${theme === "light"? "rotate-90 opacity-0": "rotate-0 opacity-100" }`}
        >
          <Sun className="w-5 h-5" />
        </div>
      </div>
    </Button>
  );
};

export default ToggleThemeButton;
