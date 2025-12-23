import React from "react";
import { Link } from "react-router-dom";
import { AiOutlineClose } from "react-icons/ai";

function Sidebar({ width = 200, buttons = [], bgColor = "#050816", showSidebar, setShowSidebar, children, footer, isMdHidden = false }) {
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
        style={{ width: `${width}px`, backgroundColor: bgColor }}
      >
        {/* Close button on mobile */}
        <AiOutlineClose
          className="block md:hidden text-white text-xl cursor-pointer m-4"
          onClick={() => setShowSidebar(false)}
        />

        <div className="flex flex-col h-full overflow-hidden justify-between">
          {/* Top */}
          <div>
            {children}

            {buttons.map((btn, index) => (
              <Link
                key={index}
                to={btn.path}
                className="block p-4 text-[#9BB3D6] hover:bg-[#06B6D4]/10 hover:text-[#22D3EE] rounded-xl flex gap-4"
                onClick={() => setShowSidebar(false)} // auto-close on mobile
              >
                { btn.icon &&    
                  <btn.icon />
                }
                {btn.name}
              </Link>
            ))}

            {footer}
          </div>
        </div>
      </div>
    </>
  );
}

export default Sidebar;
