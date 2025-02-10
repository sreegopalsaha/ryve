import React from 'react'

function Card({children, className=""}) {
  return (
    <div className={`flex flex-col w-full p-6 rounded-lg shadow-lg transition-all duration-300 hover:shadow-xl theme-card theme-text ${className}`}>
        {children}
    </div>

)
}
export default Card