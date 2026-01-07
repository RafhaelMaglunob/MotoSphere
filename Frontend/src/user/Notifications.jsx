import React, { useState } from 'react'
import { useOutletContext } from 'react-router-dom';

import DeleteIcon from '../component/svg/DeleteIcon';
import { ClockIcon } from '../component/svg/ClockIcon'
import { AlertIcon } from '../component/svg/AlertIcon';
import { InfoCircle } from '../component/svg/InfoCircleIcon';
import { CheckMark } from '../component/svg/CheckMarkIcon';

function formatTime(minutesAgo) {
  if (minutesAgo < 1) return "Just now";
  if (minutesAgo < 60) return `${minutesAgo} min${minutesAgo !== 1 ? "s" : ""} ago`;

  const hours = Math.floor(minutesAgo / 60);
  if (hours < 24) return `${hours} hour${hours !== 1 ? "s" : ""} ago`;

  const days = Math.floor(hours / 24);
  return `${days} day${days !== 1 ? "s" : ""} ago`;
}

function Notifications() {
  const { notifications, isLight } = useOutletContext();
  const [isActive, setActive] = useState("all");
  const [isHover, setHover] = useState("false");
  // State to track if notifications are temporarily cleared (will reset on refresh)
  const [isCleared, setIsCleared] = useState(false);
  const buttons = [
    { name: "All", type: "all" },
    { name: "Summary", type: "summary" },
    { name: "Alerts", type: "alerts" },
    { name: "Updates", type: "updates" }
  ]

  const handleClearNotification = () => {
    // Temporarily clear all notifications (will be back on refresh)
    setIsCleared(true);
  }

  return (
    <div className="md:p-3">
      <div className="flex flex-row w-full justify-between items-center">
        <div>
          <h1 className={`${isLight ? "text-black" : "text-white"} text-2xl md:text-3xl font-semibold tracking-wide`}>Notifications</h1>
          <span className={`${isLight ? "text-black" : "text-[#9BB3D6]"} text-xs md:text-sm`}>Stay updated with your helmet's activity.</span>
        </div>

        {/* Button for Clearing All Notifications */}
        <button
          onClick={(handleClearNotification)}
          onMouseEnter={() => setHover(true)}
          onMouseLeave={() => setHover(false)}
          className='flex flex-row gap-3 text-[#9BB3D6] text-sm cursor-pointer hover:text-[#dcdddfff]'>
          <DeleteIcon color={`${isHover ? "#dcdddfff" : "#9BB3D6"}`} size={16} />
          <span className="md:block hidden">Clear All</span>
        </button>
      </div>


      {/* Filter for Notifications (All, updates, summary, and alerts) */}
      <div className="text-[#9BB3D6] text-sm flex flex-row mt-10 grid grid-cols-[repeat(auto-fit,minmax(100px,1fr))] md:flex flex-row">
        {buttons.map((btn, index) => (
          <button
            key={index}
            onClick={() => setActive(btn.type)}
            className={`
              border-b-3 border-b-[#22D3EE] px-7 pb-4 min-w-27 cursor-pointer font-bold
              ${isActive === btn.type
                  ? "text-[#22D3EE]"
                  : isLight
                    ? "text-black"
                    : "text-[#9BB3D6]"
                }
              ${isActive !== btn.type ? "border-b-transparent" : ""}
            `}
          >
            {btn.name}
          </button>
        ))}
      </div>


      {/* Notifications */}
      <div className="grid grid-cols-1 gap-3 mt-9">
        {isCleared ? (
          // Show empty state when cleared
          <div className={`${isLight ? "bg-white" : "bg-[#0F2A52]"} px-6 py-8 rounded-2xl text-center`}>
            <p className={`${isLight ? "text-black/60" : "text-[#9BB3D6]"} text-sm`}>
              All notifications cleared. Refresh the page to see them again.
            </p>
          </div>
        ) : (
          [...notifications]
            .filter(notif => isActive === "all" ? true : notif.type === isActive)
            .sort((a, b) => a.time - b.time)
            .map((notif, index) =>
          (
            <div key={index} className={`${isLight ? "bg-white hover:bg-black/10" : "bg-[#0F2A52] hover:bg-gray-900/20" } grid grid-cols-1 gap-5 md:gap-0 md:flex sm:flex-row w-full md:justify-between px-6 py-4 rounded-2xl cursor-pointer`}>
              <div className="flex flex-row gap-5">
                <div
                  className={` 
                      p-4 rounded-xl h-fit w-fit
                      ${notif.type === "alerts" ? "bg-[#EF4444]/10"
                      :
                      notif.type === "summary" ? "bg-[#22C55E]/10"
                        :
                        notif.type === "updates" ? "bg-[#06B6D4]/10"
                          :
                          "bg-gray-800/60"
                    }`
                  }
                >
                  <AlertIcon className={`${notif.type === "alerts" ? "block" : "hidden"} text-[#F87171]`} />
                  <CheckMark className={`${notif.type === "summary" ? "block" : "hidden"} text-[#4ADE80]`} />
                  <InfoCircle className={`${notif.type === "updates" ? "block" : "hidden"} text-[#22D3EE]`} />
                </div>
                <div className="flex flex-col gap-2 w-full ">
                  <h1 className={`${isLight ? "text-black" : "text-white"} text-md md:text-lg font-semibold`}>{notif.name}</h1>
                  <span className={`${isLight ? "text-black" : "text-[#9BB3D6]"} text-xs`}>{notif.description}</span>
                </div>
              </div>
              <div className="flex flex-row gap-2 justify-end">
                <ClockIcon className={isLight ? "text-black" : "text-[#9BB3D6]"} />
                <span className={`${isLight ? "text-black" : "text-[#9BB3D6]"} text-xs`}>{formatTime(notif.time)}</span>
              </div>
            </div>
          )
          )
        )}
      </div>
    </div>
  )
}

export default Notifications
