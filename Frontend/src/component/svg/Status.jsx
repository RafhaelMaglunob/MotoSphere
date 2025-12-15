import React from "react";

export const StatusIcon = ({ strength = 4, ...props }) => {
    // strength: 0 = no signal, 4 = full signal
    const color = strength > 0 ? "currentColor" : "#334155"; // dynamic color
    return (
        <svg
            width="24"
            height="24"
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            {...props} // allow className for color/size
        >
            <g clipPath="url(#clip0_143_1762)">
                {strength >= 1 && (
                    <path
                        d="M8 13.3335H8.00667"
                        stroke={color}
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                )}
                {strength >= 2 && (
                    <path
                        d="M5.66675 10.9529C6.28984 10.3421 7.12757 10 8.00008 10C8.87259 10 9.71032 10.3421 10.3334 10.9529"
                        stroke={color}
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                )}
                {strength >= 3 && (
                    <path
                        d="M3.33325 8.57271C4.57944 7.35119 6.2549 6.66699 7.99992 6.66699C9.74494 6.66699 11.4204 7.35119 12.6666 8.57271"
                        stroke={color}
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                )}
                {strength >= 4 && (
                    <path
                        d="M1.33325 5.87994C3.16666 4.24009 5.54014 3.3335 7.99992 3.3335C10.4597 3.3335 12.8332 4.24009 14.6666 5.87994"
                        stroke={color}
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                )}
            </g>
            <defs>
                <clipPath id="clip0_143_1762">
                    <rect width="16" height="16" fill="white" />
                </clipPath>
            </defs>
        </svg>
    );
};
