import React from 'react'
import { NavLink } from 'react-router-dom'
import { motion } from 'framer-motion' 

export default function WhyMotoSphere() {
  return (
    <div>
      <div className="flex flex-col px-10 gap-4 md:mt-30">
        
        {/* heading animation */}
        <motion.h1 
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-white text-5xl font-bold alegreya leading-[1.2]"
        >
          Why<br/>MotoSphere?
        </motion.h1>

        {/* subtext animation */}
        <motion.span 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 1 }}
          className="text-[#E2E8F0] text-lg md:text-sm font-light"
        >
          “MotoSphere provides automatic accident detection, instant <br />emergency alerts, and reliable incident recording—helping riders <br />get help faster when it matters most.”
        </motion.span>

        {/* learn more animation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.5 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="w-fit"
        >
          <NavLink 
            to="/learn-more" 
            className="bg-[#007BFF] px-8 py-3 w-fit text-xl text-white tracking-wider rounded inline-block hover:bg-[#0056b3] transition-colors"
          >
            Learn More
          </NavLink>
        </motion.div>
        
      </div>   
    </div>
  )
}