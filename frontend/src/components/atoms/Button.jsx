import { LoaderCircle } from "lucide-react";
import React from "react";

const Button = ({
  children,
  onClick,
  type = "button",
  className = "",
  disabled = false,
  loading = false,
  ...rest
}) => {
  const buttonClass = `
    flex items-center justify-center rounded-lg transition-transform duration-200
    ${(disabled || loading) ? "opacity-50 cursor-not-allowed" : ""} 
    ${className}`;

  return (
    <button
      onClick={onClick}
      type={type}
      className={buttonClass}
      disabled={disabled || loading}
      {...rest}
    >
      {loading ? (
        <LoaderCircle className={"text-blue-800 animate-spin"} />
      ) : (
        children
      )}
    </button>
  );
};

export default Button;
