import React from 'react';

export const Shield = (props) => (
  <svg
    width="16"
    height="19"
    viewBox="0 0 16 19"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props} // allows className
  >
    <path
      d="M14.3333 10.167C14.3333 14.3337 11.4167 16.417 7.95 17.6254C7.76847 17.6869 7.57128 17.6839 7.39167 17.617C3.91667 16.417 1 14.3337 1 10.167V4.33371C1 4.11269 1.0878 3.90073 1.24408 3.74445C1.40036 3.58817 1.61232 3.50037 1.83333 3.50037C3.5 3.50037 5.58333 2.50037 7.03333 1.23371C7.20988 1.08287 7.43446 1 7.66667 1C7.89887 1 8.12345 1.08287 8.3 1.23371C9.75833 2.50871 11.8333 3.50037 13.5 3.50037C13.721 3.50037 13.933 3.58817 14.0893 3.74445C14.2455 3.90073 14.3333 4.11269 14.3333 4.33371V10.167Z"
      stroke="currentColor" // use currentColor for dynamic color
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
