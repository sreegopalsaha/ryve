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
  const buttonClass = `px-4 py-2 font-semibold text-white rounded-lg transition duration-300 ease-in-out 
    ${disabled || loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600'} 
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
