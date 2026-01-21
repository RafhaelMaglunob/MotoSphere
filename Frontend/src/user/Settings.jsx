import React, { useState, useEffect } from 'react'
import { useOutletContext, useNavigate } from 'react-router-dom'
import { authAPI } from '../services/api'
import ProfilePictureUpload from '../component/ProfilePictureUpload'
import TwoFactorSetup from '../component/TwoFactorSetup'

function Settings() {
  const { email, username, setUsername, setEmail, isLight, setIsLight } = useOutletContext();
  const navigate = useNavigate();
  const [name, setName] = useState(username || "")
  const [ userEmail, setUserEmail ] = useState(email || "")
  const [deviceId, setDeviceId] = useState("")
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [profilePicture, setProfilePicture] = useState("");
  const [emailVerified, setEmailVerified] = useState(false);
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);

  // Load user data from localStorage
  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("user") || "{}");
    if (userData.deviceId || userData.deviceID) {
      setDeviceId(userData.deviceId || userData.deviceID || "");
    }
    if (userData.profilePicture) {
      setProfilePicture(userData.profilePicture);
    }
    if (userData.emailVerified !== undefined) {
      setEmailVerified(userData.emailVerified);
    }
    if (userData.phoneVerified !== undefined) {
      setPhoneVerified(userData.phoneVerified);
    }
    if (userData.twoFactorEnabled !== undefined) {
      setTwoFactorEnabled(userData.twoFactorEnabled);
    }
  }, []);
  
  const [ notificationEnabled, setNotificationsEnabled] = useState(() => {
    const saved = localStorage.getItem("notificationEnabled")
    return saved ? JSON.parse(saved) : false;
  })

  const [ emailNotificationEnabled, setEmailNotificationsEnabled] = useState(() => {
    const saved = localStorage.getItem("emailNotificationEnabled");
    return saved ? JSON.parse(saved) : false;
  })

  // Update local state when username/email changes from parent
  useEffect(() => {
    setName(username || "");
    setUserEmail(email || "");
  }, [username, email]);

  useEffect(() => {
    localStorage.setItem("emailNotificationEnabled", JSON.stringify(emailNotificationEnabled))
    localStorage.setItem("notificationEnabled", JSON.stringify(notificationEnabled))
  }, [emailNotificationEnabled, notificationEnabled]);

  const handleAccountSave = async () => {
    setError("");
    setSuccess("");

    // Validation
    if (!name || name.trim().length === 0) {
      setError("Username is required");
      return;
    }

    if (!userEmail || userEmail.trim().length === 0) {
      setError("Email is required");
      return;
    }

    // Check if anything changed
    if (name === username && userEmail === email) {
      setSuccess("No changes to save");
      return;
    }

    setLoading(true);

    try {
      const updateData = {
        username: name.trim(),
        email: userEmail.trim()
      };
      
      // Only include deviceId if it's provided
      if (deviceId && deviceId.trim()) {
        updateData.deviceId = deviceId.trim();
      }

      const response = await authAPI.updateProfile(updateData);

      if (response.success) {
        // Update parent state
        if (setUsername) setUsername(response.user.username);
        if (setEmail) setEmail(response.user.email);

        // Update localStorage with new user data
        const userData = JSON.parse(localStorage.getItem("user") || "{}");
        userData.username = response.user.username;
        userData.email = response.user.email;
        if (response.user.deviceId) {
          userData.deviceId = response.user.deviceId;
          userData.deviceID = response.user.deviceId; // Keep both for compatibility
        }
        localStorage.setItem("user", JSON.stringify(userData));

        setSuccess("Profile updated successfully!");
        
        // Clear success message after 3 seconds
        setTimeout(() => setSuccess(""), 3000);
      } else {
        setError(response.message || "Failed to update profile");
      }
    } catch (err) {
      setError(err.message || "Failed to update profile. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="md:p-5">

      {/* Account and App Configuration */}
      <div className={`${isLight ? "bg-white" : "bg-[#0F2A52]"} p-7 rounded-xl md:w-[70%]`}>
        <h1 className={`${isLight ? "text-black" : "text-[#9BB3D6]"} text-lg font-semibold mb-4`}>Account and App Configuration</h1>

        {error && (
          <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-green-500/20 border border-green-500/50 rounded-lg">
            <p className="text-green-400 text-sm">{success}</p>
          </div>
        )}

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
        
        {/* Profile Picture */}
        <div className='flex flex-col mt-5 gap-2'>
          <ProfilePictureUpload 
            currentPicture={profilePicture}
            onUploadSuccess={(url) => {
              setProfilePicture(url);
              const userData = JSON.parse(localStorage.getItem("user") || "{}");
              userData.profilePicture = url;
              localStorage.setItem("user", JSON.stringify(userData));
            }}
            isLight={isLight}
          />
        </div>

        {/* Email */}
        <div className='flex flex-col mt-5 gap-2'>
          <div className="flex items-center justify-between">
            <label className={`${isLight ? "text-black" : "text-[#9BB3D6]"} text-xs tracking-wider`}>Email</label>
            {emailVerified ? (
              <span className="text-xs text-green-500 flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Verified
              </span>
            ) : (
              <button
                onClick={() => navigate('/verify-email')}
                className="text-xs text-[#2EA8FF] hover:underline"
              >
                Verify Email
              </button>
            )}
          </div>
          <input 
              type="text" 
              value={userEmail}
              onChange={((e) => setUserEmail(e.target.value))}
              className={`${isLight ? "bg-[#F1F1F1] text-black" : "bg-[#0A1A3A] text-white"} bg-[#0A1A3A] px-3 py-2 items-center rounded-xl w-full min-h-12`}
            />
        </div>

        {/* Phone Verification */}
        <div className='flex flex-col mt-5 gap-2'>
          <div className="flex items-center justify-between">
            <label className={`${isLight ? "text-black" : "text-[#9BB3D6]"} text-xs tracking-wider`}>Phone Verification</label>
            {phoneVerified ? (
              <span className="text-xs text-green-500 flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Verified
              </span>
            ) : (
              <button
                onClick={() => navigate('/verify-phone')}
                className="text-xs text-[#2EA8FF] hover:underline"
              >
                Verify Phone
              </button>
            )}
          </div>
        </div>

        {/* Device ID */}
        <div className='flex flex-col mt-5 gap-2'>
          <label className={`${isLight ? "text-black" : "text-[#9BB3D6]"} text-xs tracking-wider`}>Device ID</label>
          <input 
              type="text" 
              value={deviceId}
              onChange={((e) => setDeviceId(e.target.value))}
              placeholder="Enter your device ID"
              className={`${isLight ? "bg-[#F1F1F1] text-black" : "bg-[#0A1A3A] text-white"} bg-[#0A1A3A] px-3 py-2 items-center rounded-xl w-full min-h-12`}
            />
        </div>
        
        <div 
          className="flex justify-end mt-4"
        >
          <button
            onClick={handleAccountSave}
            disabled={loading}
            className="px-8 py-2 bg-[#2EA8FF] hover:bg-[#2EA8FF]/80 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-lg cursor-pointer transition-colors"
          >
            {loading ? "Saving..." : "Save all changes"}
          </button>
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

      {/* Security Settings */}
      <div className={`${isLight ? "bg-white" : "bg-[#0F2A52]"} p-7 mt-8 rounded-xl md:w-[70%]`}>
        <h1 className={`${isLight ? "text-black" : "text-white"} text-lg font-semibold mb-4`}>Security Settings</h1>
        
        <div className="mb-6">
          <TwoFactorSetup
            isLight={isLight}
            isEnabled={twoFactorEnabled}
            onToggle={(enabled, backupCodes) => {
              setTwoFactorEnabled(enabled);
              const userData = JSON.parse(localStorage.getItem("user") || "{}");
              userData.twoFactorEnabled = enabled;
              if (backupCodes && backupCodes.length > 0) {
                userData.twoFactorBackupCodes = backupCodes;
              }
              localStorage.setItem("user", JSON.stringify(userData));
            }}
          />
        </div>
      </div>
    </div>
  )
}

export default Settings
