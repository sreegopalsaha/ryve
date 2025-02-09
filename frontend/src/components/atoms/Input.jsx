import React, { useId } from 'react';

function Input({ type = "text", className = "", placeholder = "", value, onChange, label, ...rest }) {
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
                className={`border rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 ${className}`} 
                placeholder={placeholder} 
                value={value} 
                onChange={onChange} 
                {...rest} 
            />
        </div>
    );
}

export default Input;