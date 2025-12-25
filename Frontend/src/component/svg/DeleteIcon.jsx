// TrashIcon.jsx
import React from "react";

export default function DeleteIcon({ size = 16, color = "#9BB3D6", className = "" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <g clipPath="url(#clip0)">
        <path
          d="M2 4H14"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M12.6667 4V13.3333C12.6667 14 12 14.6667 11.3333 14.6667H4.66666C3.99999 14.6667 3.33333 14 3.33333 13.3333V4"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M5.33333 4.00016V2.66683C5.33333 2.00016 5.99999 1.3335 6.66666 1.3335H9.33333C10 1.3335 10.6667 2.00016 10.6667 2.66683V4.00016"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M6.66667 7.3335V11.3335"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M9.33333 7.3335V11.3335"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
      <defs>
        <clipPath id="clip0">
          <rect width="16" height="16" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
}
