import React from 'react'

function Card({children, className=""}) {
  return (
    <div className={`flex flex-col w-full p-6 rounded-xl theme-card ${className}`}>
        {children}
    </div>

)
}
export default Card