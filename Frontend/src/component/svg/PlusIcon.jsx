// PlusIcon.jsx
import React from "react";

function PlusIcon({
  size = 32,
  color = "#94A3B8",
  className = "",
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Horizontal line */}
      <path
        d="M6.66666 16H25.3333"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Vertical line */}
      <path
        d="M16 6.6665V25.3332"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default PlusIcon;
