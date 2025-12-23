import React from 'react'
import { NavLink } from 'react-router-dom'
export default function AboutUs() {
  return (
    <div>
      <div className="flex flex-col px-10 gap-4">
        <h1 className="text-white text-4xl md:text-5xl font-bold leading-[1.5]">We’re building <br/> safety features for <br/> motorcycle riders  </h1>
        <span className="text-[#E2E8F0] text-lg md:text-sm font-light">MotoSphere is an attachable smart helmet system designed to <br /> enhance motorcycle safety through innovative technology and <br/> real-time connectivity.</span>
        <NavLink to="/mission" className="bg-[#007BFF] px-8 py-3 w-fit text-xl text-white tracking-wider rounded">Our Mission</NavLink>
      </div>   
    </div>
  )
}
