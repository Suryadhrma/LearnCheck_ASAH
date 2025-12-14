import React from 'react';
function LoadingSpinner({ isDark }) {
  return (
    <div
      className={`relative flex items-center justify-center h-screen w-full
      ${isDark ? 'bg-gray-900 text-gray-100' : 'bg-gradient-to-br from-white to-gray-50 text-gray-800'}`}
    >
      <div className="flex flex-col items-center">
        <div
          className={`w-16 h-16 border-4 rounded-full animate-spin
          ${isDark ? 'border-gray-700 border-t-blue-500' : 'border-gray-200 border-t-blue-600'}`}
        />
        <p
          className={`mt-4 text-sm md:text-base tracking-wide font-medium animate-pulse
          ${isDark ? 'text-gray-400' : 'text-gray-600'}`}
        >
          Loading...
        </p>
      </div>
    </div>
  );
}

export default LoadingSpinner;