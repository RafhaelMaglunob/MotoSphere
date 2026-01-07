import React, { useState, useEffect } from 'react'
import { useOutletContext } from 'react-router-dom'

function Settings() {
  const { email, username, setUsername, setEmail, isLight, setIsLight } = useOutletContext();
  const [name, setName] = useState(username || "")
  const [ userEmail, setUserEmail ] = useState(email || "")
  
  const [ notificationEnabled, setNotificationsEnabled] = useState(() => {
    const saved = localStorage.getItem("notificationEnabled")
    return saved ? JSON.parse(saved) : false;
  })

  const [ emailNotificationEnabled, setEmailNotificationsEnabled] = useState(() => {
    const saved = localStorage.getItem("emailNotificationEnabled");
    return saved ? JSON.parse(saved) : false;
  })

  useEffect(() => {
    localStorage.setItem("emailNotificationEnabled", JSON.stringify(emailNotificationEnabled))
    localStorage.setItem("notificationEnabled", JSON.stringify(notificationEnabled))
  }, [emailNotificationEnabled, notificationEnabled]);

  const handleAccountSave = () => {
    // Temporarily update parent state (UI-only, lost on refresh)
    if (setUsername) setUsername(name);
    if (setEmail) setEmail(userEmail);
  }

  return (
    <div className="md:p-5">

      {/* Account and App Configuration */}
      <div className={`${isLight ? "bg-white" : "bg-[#0F2A52]"} p-7 rounded-xl md:w-[70%]`}>
        <h1 className={`${isLight ? "text-black" : "text-[#9BB3D6]"} text-lg font-semibold mb-4`}>Account and App Configuration</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          
          {/* Username */}
          <div className="flex flex-col gap-2">
            <label className={`${isLight ? "text-black" : "text-[#9BB3D6]"} text-xs tracking-wider`}>User Name</label>
            <input 
              type="text" 
              value={name}
              onChange={((e) => setName(e.target.value))}
              className={`${isLight ? "bg-[#F1F1F1] text-black" : "bg-[#0A1A3A] text-white"} bg-[#0A1A3A] px-3 py-2 items-center rounded-xl w-full min-h-12`} 
            />
          </div>
          
          {/* Light Mode */}
          <div className="flex flex-col gap-2">
            <label className={`${isLight ? "text-black" : "text-[#9BB3D6]"} text-xs tracking-wider`}>Light Mode</label>
            <div className={`${isLight ? "bg-[#F1F1F1]" : "bg-[#0A1A3A]"} flex flex-row w-full justify-between px-3 py-2 items-center rounded-xl min-h-12`}>
              <h1 className={`${isLight ? "text-black" : "text-white"} text-sm text-semibold`}>{isLight ? "Darken" : "Brigthen"} your interface</h1>
              <div
                onClick={() => setIsLight(!isLight)}
                className={`min-w-14 h-7 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-300
                ${isLight ? "bg-gray-700" : "bg-[#007BFF]"}`}
              >
                <div
                  className={`bg-white w-5 h-5 rounded-full shadow-md transform duration-300
                  ${isLight ? "translate-x-0" : "translate-x-7"}`}
                ></div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Email */}
        <div className='flex flex-col mt-5 gap-2'>
          <label className={`${isLight ? "text-black" : "text-[#9BB3D6]"} text-xs tracking-wider`}>Email</label>
          <input 
              type="text" 
              value={userEmail}
              onChange={((e) => setUserEmail(e.target.value))}
              className={`${isLight ? "bg-[#F1F1F1] text-black" : "bg-[#0A1A3A] text-white"} bg-[#0A1A3A] px-3 py-2 items-center rounded-xl w-full min-h-12`}
            />
        </div>
        
        <div 
          className="flex justify-end mt-4"
          onClick={() => handleAccountSave()}
        >
          <div className="px-8 py-2 bg-[#2EA8FF] text-white font-semibold rounded-lg cursor-pointer">
            Save all changes
          </div>
        </div>
      </div>
                
      {/* Notification Settings */}
      <div className={`${isLight ? "bg-white" : "bg-[#0F2A52]"} p-7 mt-8 rounded-xl md:w-[70%]`}>
        <h1 className={`${isLight ? "text-black" : "text-white"} text-lg font-semibold mb-4`}>Notification Settings</h1>

        <div className="grid grid-cols-1 gap-5">

          {/* Email Notification */}
          <div className={`${isLight ? "bg-[#F1F1F1]" : 'bg-[#0A1A3A]'} flex flex-row w-full justify-between px-5 py-3 items-center rounded-xl min-h-12`}>
            <h1 className={`${isLight ? "text-black" : "text-white" } text-sm text-semibold`}>Email notifications for updates</h1>
            <div
              onClick={() => setEmailNotificationsEnabled(!emailNotificationEnabled)}
              className={`min-w-14 h-7 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-300
              ${emailNotificationEnabled ? "bg-gray-700" : "bg-[#007BFF]"}`}
            >
              <div
                className={`bg-white w-5 h-5 rounded-full shadow-md transform duration-300
                ${emailNotificationEnabled ? "translate-x-0" : "translate-x-7"}`}
              ></div>
            </div>
          </div>

          {/* Receive Notification */}
          <div className={`${isLight ? "bg-[#F1F1F1]" : "bg-[#0A1A3A]"} flex flex-row w-full justify-between px-5 py-3 items-center rounded-xl  min-h-12`}>
            <h1 className={`${isLight ? "text-black" : "text-white"} text-sm text-semibold`}>Receive Notifications</h1>
            <div
              onClick={() => setNotificationsEnabled(!notificationEnabled)}
              className={`min-w-14 h-7 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-300
              ${notificationEnabled ? "bg-gray-700" : "bg-[#007BFF]"}`}
            >
              <div
                className={`bg-white w-5 h-5 rounded-full shadow-md transform duration-300
                ${notificationEnabled ? "translate-x-0" : "translate-x-7"}`}
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Settings
