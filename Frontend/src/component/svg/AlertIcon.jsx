import React from "react";

export const AlertIcon = (props) => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props} // allow className for color/size
  >
    <path
      d="M21.73 18L13.73 4C13.56 3.69 13.3 3.44 12.99 3.26C12.69 3.08 12.34 2.99 11.99 2.99C11.64 2.99 11.29 3.08 10.98 3.26C10.68 3.44 10.42 3.69 10.25 4L2.25 18C2.07 18.31 1.98 18.65 1.98 19C1.98 19.35 2.07 19.7 2.25 20C2.43 20.31 2.69 20.56 2.99 20.74C3.3 20.91 3.65 21 4 21H20C20.35 21 20.7 20.91 21 20.73C21.3 20.56 21.56 20.3 21.73 20C21.91 19.7 22 19.35 22 19C22 18.65 21.91 18.3 21.73 18Z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M12 9V13"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M12 17H12.01"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
