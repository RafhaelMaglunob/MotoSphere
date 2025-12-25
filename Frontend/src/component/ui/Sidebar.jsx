import React from "react";
import { NavLink } from "react-router-dom";
import { AiOutlineClose } from "react-icons/ai";

function Sidebar({ 
  padding = 10, 
  buttons = [], 
  bgColor = "#050816", 
  showSidebar, 
  setShowSidebar, 
  children, 
  footer,
  isMdHidden = false
}) {
  return (
    <>
      {/* Overlay for mobile */}
      {showSidebar && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setShowSidebar(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
          fixed top-0 left-0 h-screen z-40 transform transition-transform duration-300
          ${showSidebar ? "translate-x-0" : "-translate-x-full"} 
          md:translate-x-0 md:sticky md:top-0 md:h-screen
          ${isMdHidden ? "md:hidden" : ""}
        `}
        style={{ padding: padding, backgroundColor: bgColor }}
      >
        <div className="flex flex-col h-full">
          {/* Close button for mobile */}
          <AiOutlineClose
            className="block md:hidden text-white text-lg cursor-pointer mb-4"
            onClick={() => setShowSidebar(false)}
          />

          {/* Scrollable content */}
          <div className="flex-1 overflow-y-auto">
            {children}

            {buttons.map((btn, index) => (
              <NavLink
                key={index}
                to={btn.path}
                className={({ isActive }) =>
                  `block p-4 rounded-xl flex gap-4 mb-1 ${
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

          {/* Footer pinned at bottom */}
          {footer}
        </div>
      </div>
    </>
  );
}

export default Sidebar;
