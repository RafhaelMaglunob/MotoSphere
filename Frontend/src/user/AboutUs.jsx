import React from 'react'
import { NavLink } from 'react-router-dom'
import { motion as Motion } from 'framer-motion' 

export default function AboutUs() {
  return (
    <div>
      <div className="flex flex-col px-10 gap-4">
        
        {/* Heading animation */}
        <Motion.h1 
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-white text-4xl md:text-5xl font-bold leading-[1.5]"
        >
          We’re building <br/> safety features for <br/> motorcycle riders
        </Motion.h1>

        {/* Subtext animation */}
        <Motion.span 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 1 }}
          className="text-[#E2E8F0] text-lg md:text-sm font-light"
        >
          MotoSphere is an attachable smart helmet system designed to <br /> enhance motorcycle safety through innovative technology and <br/> real-time connectivity.
        </Motion.span>

        {/* Our mission button animation */}
        <Motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.5 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="w-fit"
        >
          <NavLink 
            to="/mission" 
            className="bg-[#007BFF] px-8 py-3 w-fit text-xl text-white tracking-wider rounded inline-block hover:bg-[#0056b3] transition-colors shadow-lg shadow-blue-500/20"
          >
            Our Mission
          </NavLink>
        </Motion.div>
        
      </div>   
    </div>
  )
}
