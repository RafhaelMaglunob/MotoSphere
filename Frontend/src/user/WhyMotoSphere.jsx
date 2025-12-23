import React from 'react'
import { NavLink } from 'react-router-dom'
export default function WhyMotoSphere() {
  return (
    <div>
      <div className="flex flex-col px-10 gap-4 md:mt-30">
        <h1 className="text-white text-5xl font-bold alegreya leading-[1.2]">Why<br/>MotoSphere?</h1>
        <span className="text-[#E2E8F0] text-lg md:text-sm font-light">“MotoSphere provides automatic accident detection, instant <br />emergency alerts, and reliable incident recording—helping riders <br />get help faster when it matters most.”</span>
        <NavLink to="/learn-more" className="bg-[#007BFF] px-8 py-3 w-fit text-xl text-white tracking-wider rounded">Learn More</NavLink>
      </div>   
    </div>
  )
}
