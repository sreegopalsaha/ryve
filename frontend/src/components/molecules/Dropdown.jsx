import { useEffect, useRef, useMemo, useCallback } from "react";
import { X } from "lucide-react";
import Button from "../atoms/Button";

const Dropdown = ({ items, isOpen, setIsOpen }) => {
  const dropdownRef = useRef(null);

  const filteredItems = useMemo(
    () => items.filter((item) => item.visible),
    [items]
  );

  const handleClickOutside = useCallback(
    (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    },
    [setIsOpen]
  );

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [handleClickOutside]);

  if (!isOpen) return null;

  return (
    <div
      ref={dropdownRef}
      className="absolute right-0 top-9 z-50 min-w-[8.5rem] rounded-xl border border-gray-200 dark:border-gray-700 shadow-xl theme-card overflow-hidden"
    >
      <div className="flex items-center justify-between p-2 border-b border-gray-100 dark:border-gray-800">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">Options</span>
        <button
          onClick={() => setIsOpen(false)}
          aria-label="Close menu"
          className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
      <ul className="p-1">
        {filteredItems.map((item, index) => (
          <li key={index}>
            <Button
              onClick={() => {
                item.onClick();
                setIsOpen(false);
              }}
              className={`w-full px-3 py-1.5 text-xs sm:text-sm text-left justify-start rounded-lg transition-colors ${
                item.label === "Delete"
                  ? "text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30"
                  : "hover:bg-gray-100 dark:hover:bg-gray-800"
              }`}
            >
              {item.icon && <span className="mr-2">{item.icon}</span>}
              {item.label}
            </Button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Dropdown;
