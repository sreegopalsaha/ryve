import React, { useId } from "react";

function Input({
  type = "text",
  className = "",
  placeholder = "",
  value,
  onChange,
  label,
  ...rest
}) {
  const id = useId();
  return (
    <div className="w-full flex flex-col">
      {label && (
        <label
          htmlFor={id}
          className="mb-1 text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors duration-300"
        >
          {label}
        </label>
      )}
      <input
        id={id}
        type={type}
        className={`w-full border rounded-xl px-4 py-3 text-sm outline-none transition-all duration-200 theme-input theme-text border-primary-light-border dark:border-primary-dark-border focus:ring-2 focus:ring-primary-light-accent dark:focus:ring-primary-dark-accent ${className}`}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        {...rest}
      />
    </div>
  );
}

export default Input;
