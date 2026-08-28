import React from "react";

function Toggle({ checked, onChange, disabled = false, ariaLabel = "Toggle" }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={(e) => {
        e.stopPropagation();
        if (!disabled && onChange) {
          onChange(!checked);
        }
      }}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 focus:outline-none flex-shrink-0 ${
        disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
      } ${checked ? "bg-primary-light-accent dark:bg-primary-dark-accent" : "bg-gray-300 dark:bg-gray-700"}`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-300 ${
          checked ? "translate-x-6" : "translate-x-1"
        }`}
      />
    </button>
  );
}

export default Toggle;
