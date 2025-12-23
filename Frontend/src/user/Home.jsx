import React from 'react'
import { NavLink } from 'react-router-dom'
export default function home() {
  return (
    <div>
      <div className="flex flex-col px-10 gap-4">
        <h1 className="text-white text-4xl md:text-5xl font-bold leading-[1.5]">Your Smart <br/> Helmet, Your <br/> Safety Sphere.  </h1>
        <span className="text-[#E2E8F0] text-lg md:text-sm font-light">Experience the future of riding with real-time GPS tracking, accident <br/> detection, and seamless connectivity.</span>
        <NavLink to="/user-login" className="bg-[#007BFF] px-8 py-3 w-fit text-xl text-white tracking-wider rounded">Login</NavLink>
      </div>   
    </div>
  )
}
