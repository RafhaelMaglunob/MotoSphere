import React, { useState, useRef, useEffect } from 'react';
import { authAPI } from '../services/api';

function ProfilePictureUpload({ currentPicture, onUploadSuccess, isLight }) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(currentPicture || null);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  // Update preview when currentPicture prop changes
  useEffect(() => {
    if (currentPicture) {
      setPreview(currentPicture);
    }
  }, [currentPicture]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size must be less than 5MB');
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result);
      setError('');
    };
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    const file = fileInputRef.current?.files[0];
    if (!file) {
      setError('Please select an image file');
      return;
    }

    setUploading(true);
    setError('');

    try {
      const response = await authAPI.uploadProfilePicture(file);
      console.log('Upload response:', response);
      if (response.success) {
        console.log('Upload successful, profilePicture URL:', response.profilePicture);
        setPreview(response.profilePicture);
        if (onUploadSuccess) {
          onUploadSuccess(response.profilePicture);
        }
      } else {
        console.error('Upload failed:', response.message);
        setError(response.message || 'Failed to upload profile picture');
      }
    } catch (err) {
      console.error('Upload error:', err);
      setError(err.message || 'Failed to upload profile picture. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-4">
        {/* Profile Picture Preview */}
        <div className="relative">
          <img
            src={preview || 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect width="100" height="100" fill="%23e5e7eb"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%239ca3af" font-size="12"%3ENo Image%3C/text%3E%3C/svg%3E'}
            alt="Profile"
            className="w-24 h-24 rounded-full object-cover border-2 border-[#2EA8FF]"
            onError={(e) => {
              // Fallback to a simple data URI if image fails to load
              e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect width="100" height="100" fill="%23e5e7eb"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%239ca3af" font-size="12"%3ENo Image%3C/text%3E%3C/svg%3E';
            }}
          />
          {preview && preview !== currentPicture && (
            <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-1">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          )}
        </div>

        {/* Upload Button */}
        <div className="flex flex-col gap-2">
          <label className={`${isLight ? "text-black" : "text-white"} text-sm font-semibold`}>
            Profile Picture
          </label>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
            id="profile-picture-upload"
          />
          <label
            htmlFor="profile-picture-upload"
            className="px-4 py-2 bg-[#2EA8FF] hover:bg-[#2EA8FF]/80 text-white text-sm font-semibold rounded-lg cursor-pointer transition-colors text-center"
          >
            Choose Image
          </label>
          <button
            onClick={handleUpload}
            disabled={uploading || !fileInputRef.current?.files[0] || preview === currentPicture}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-lg transition-colors"
          >
            {uploading ? 'Uploading...' : 'Upload'}
          </button>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-lg">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      <p className={`${isLight ? "text-gray-600" : "text-[#9BB3D6]"} text-xs`}>
        Recommended: Square image, max 5MB. Formats: JPG, PNG, GIF
      </p>
    </div>
  );
}

export default ProfilePictureUpload;
