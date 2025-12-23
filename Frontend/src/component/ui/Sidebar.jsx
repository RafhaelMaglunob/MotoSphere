import React from "react";
import { NavLink } from "react-router-dom";
import { AiOutlineClose } from "react-icons/ai";

import Logout from '../img/Logout.png'

function Sidebar({ padding = 10, buttons = [], bgColor = "#050816", showSidebar, setShowSidebar, children, footer, isMdHidden = false }) {
  return (
    <>
      {/* Overlay for mobile */}
      {showSidebar && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setShowSidebar(false)}
        />
      )}

      <div
        className={`
          fixed top-0 left-0 min-h-screen z-40 transform transition-transform duration-300
          ${showSidebar ? "translate-x-0" : "-translate-x-full"} 
          ${isMdHidden ? "hidden" : "md:translate-x-0 md:relative md:block"}
        `}
        
        style={{ padding: padding, backgroundColor: bgColor }}
      >
        {/* Close button on mobile */}
        
        <div
          className="flex flex-col justify-between h-screen"
        >
          <AiOutlineClose
            className="block md:hidden text-white text-lg cursor-pointer"
            onClick={() => setShowSidebar(false)}
          />
          <div className="flex flex-col overflow-hidden">
            {/* Top content */}
            <div>
              {children}

              {buttons.map((btn, index) => (
                <NavLink
                  key={index}
                  to={btn.path}
                  className={({ isActive }) =>
                    `block p-4 rounded-xl flex gap-4  ${
                      isActive 
                        ? "bg-[#06B6D4]/20 text-[#22D3EE]" 
                        : "text-[#9BB3D6] hover:bg-[#06B6D4]/10 hover:text-[#22D3EE]"
                    }`
                  }
                  onClick={() => setShowSidebar(false)}
                >
                  {btn.icon && <btn.icon />}
                  {btn.name}
                </NavLink>
              ))}
            </div>
          </div>
          
          {/* Footer / logout */}
          <div className="flex flex-col mt-auto px-5">
            <div className="text-[#F87171] text-sm flex gap-3 pb-6 cursor-pointer">
              <img src={Logout} alt="Logout" />
              <h1>Log Out</h1>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Sidebar;
