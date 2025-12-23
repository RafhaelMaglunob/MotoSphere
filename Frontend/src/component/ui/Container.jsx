import React from "react";

function Container({bgColor, children }) {
    return (
        <div
            className="flex w-full"
            style={{
                backgroundColor: bgColor || "transparent",
            }}
        >
            {children}
        </div>
    );
}

export default Container;
