import React from "react";
import { AiOutlineMenu } from "react-icons/ai";

function Topbar({ height = 40, bgColor = "#050816", onBurgerClick, children, isMdHidden = false, isLight }) {
    return (
        <div className={`${isMdHidden ? "md:hidden" : "flex"}`} >
            <div
                className="w-full flex items-center justify-between px-4 md:px-8 "
                style={{ height: `${height}px`, backgroundColor: bgColor }}
            >
                {/* Burger icon for mobile */}
                <AiOutlineMenu
                    onClick={onBurgerClick}
                    className={`${isLight ? "text-black" : "text-white"} text-2xl cursor-pointer md:hidden`}
                />

                {/* Center / right content */}
                <div className="flex-1 flex ml-3">
                    {children}
                </div>
            </div>
        </div>
    );
}

export default Topbar;
