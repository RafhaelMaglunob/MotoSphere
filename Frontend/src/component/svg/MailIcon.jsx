// MailIcon.jsx
import React from "react";

function MailIcon({
  size = 16,
  borderColor = "#39A9FF",
  innerColor = "#22D3EE",
  borderOpacity = 1,
  innerOpacity = 1,
  className = "",
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Inside / flap */}
      <path
        d="M14.6667 4.66675L8.67268 8.48475C8.46927 8.60289 8.23824 8.66512 8.00301 8.66512C7.76779 8.66512 7.53675 8.60289 7.33334 8.48475L1.33334 4.66675"
        stroke={innerColor}
        strokeOpacity={innerOpacity}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Border / corners */}
      <path
        d="M13.3333 2.66675H2.66668C1.9303 2.66675 1.33334 3.2637 1.33334 4.00008V12.0001C1.33334 12.7365 1.9303 13.3334 2.66668 13.3334H13.3333C14.0697 13.3334 14.6667 12.7365 14.6667 12.0001V4.00008C14.6667 3.2637 14.0697 2.66675 13.3333 2.66675Z"
        stroke={borderColor}
        strokeOpacity={borderOpacity}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default MailIcon;
