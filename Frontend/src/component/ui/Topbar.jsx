import React from "react";
import { AiOutlineMenu } from "react-icons/ai";

function Topbar({ height = 40, bgColor = "#050816", onBurgerClick, children }) {
    return (
        <div
            className="w-full flex items-center justify-between px-4 md:px-8 md:hidden"
            style={{ height: `${height}px`, backgroundColor: bgColor }}
        >
            {/* Burger icon for mobile */}
            <AiOutlineMenu
                onClick={onBurgerClick}
                className="md:hidden text-white text-2xl cursor-pointer"
            />

            {/* Center / right content */}
            <div className="flex-1 flex justify-center md:justify-end">
                {children}
            </div>
        </div>
    );
}

export default Topbar;
