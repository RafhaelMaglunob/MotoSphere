import React from "react";

export const ProfileIcon = (props) => (
  <svg
    width="40"
    height="40"
    viewBox="0 0 40 40"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props} // allows passing className, color, etc.
  >
    <rect
      x="1.5"
      y="1.5"
      width="37"
      height="37"
      rx="18.5"
      stroke="currentColor"
      strokeWidth="3"
    />
    <path
      d="M31.3334 32.75V29.9167C31.3334 28.4138 30.7364 26.9724 29.6737 25.9097C28.611 24.847 27.1696 24.25 25.6667 24.25H14.3334C12.8305 24.25 11.3892 24.847 10.3265 25.9097C9.26377 26.9724 8.66675 28.4138 8.66675 29.9167V32.75M25.6667 12.9167C25.6667 16.0463 23.1297 18.5833 20.0001 18.5833C16.8705 18.5833 14.3334 16.0463 14.3334 12.9167C14.3334 9.78705 16.8705 7.25 20.0001 7.25C23.1297 7.25 25.6667 9.78705 25.6667 12.9167Z"
      stroke="currentColor"
      strokeWidth="4"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
