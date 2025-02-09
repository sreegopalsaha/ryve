import React from 'react'

function Card({children, className=""}) {
  return (
    <div className={`flex flex-col w-full max-w-md p-6 rounded-lg shadow-lg transition-all duration-300 hover:shadow-xl theme-card ${className}`}>
        {children}
    </div>

)
}
export default Card