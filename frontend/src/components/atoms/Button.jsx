import { LoaderCircle } from 'lucide-react';
import React from 'react';

const Button = ({
  children,
  onClick,
  type = 'button',
  className = '',
  disabled = false,
  loading = false,
  ...rest
}) => {
  const buttonClass = `
    ${disabled || loading ? 'bg-gray-400 cursor-not-allowed' : ''} 
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
         <LoaderCircle className={"text-blue-500 animate-spin"}/>
      ) : (
        children
      )}
    </button>
  );
};

export default Button;
