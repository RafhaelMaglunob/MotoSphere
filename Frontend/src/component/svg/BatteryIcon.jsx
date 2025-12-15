import React from "react";

export const BatteryIcon = (props) => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props} // allows passing className for color/size
  >
    <g clipPath="url(#clip0_143_1773)">
      <path
        d="M14.6667 9.33317V6.6665"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M10.6666 4H2.66659C1.93021 4 1.33325 4.59695 1.33325 5.33333V10.6667C1.33325 11.403 1.93021 12 2.66659 12H10.6666C11.403 12 11.9999 11.403 11.9999 10.6667V5.33333C11.9999 4.59695 11.403 4 10.6666 4Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </g>
    <defs>
      <clipPath id="clip0_143_1773">
        <rect width="16" height="16" fill="white" />
      </clipPath>
    </defs>
  </svg>
);
