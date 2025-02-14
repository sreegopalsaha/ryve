import { useEffect, useRef, useMemo, useCallback } from "react";
import { X } from "lucide-react";

const Dropdown = ({ items, isOpen, setIsOpen }) => {
  const dropdownRef = useRef(null);

  const filteredItems = useMemo(() => items.filter((item) => item.visible), [items]);

  const handleClickOutside = useCallback((event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setIsOpen(false);
    }
  }, [setIsOpen]);

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [handleClickOutside]);

  if (!isOpen) return null;

  return (
    <div
      ref={dropdownRef}
      className="absolute z-40 min-w-[8rem] max-w-[10rem] rounded-lg border bg-white shadow-lg theme-card"
    >
      <div className="flex items-center justify-between p-2 border-b">
        <span className="text-sm font-medium">Options</span>
        <button onClick={() => setIsOpen(false)} aria-label="Close menu">
          <X className="h-4 w-4" />
        </button>
      </div>
      <ul className="p-1">
        {filteredItems.map((item, index) => (
          <li key={index}>
            <button
              onClick={() => {
                item.onClick();
                setIsOpen(false);
              }}
              className="w-full px-2 py-1.5 text-sm hover:bg-gray-200 dark:hover:bg-gray-800 rounded-lg"
            >
              {item.icon && <span className="mr-2">{item.icon}</span>}
              {item.label}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Dropdown;
