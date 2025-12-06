import React from 'react';

function LoadingSpinner({ isDark }) {
  return (
    <div className={`flex flex-col justify-center items-center h-screen w-full animate-fade-in
      ${isDark ? 'bg-gray-900' : 'bg-gradient-to-br from-white to-gray-50'}`}>
      <div className={`w-16 h-16 border-4 rounded-full animate-spin 
        ${isDark ? 'border-gray-700 border-t-blue-500' : 'border-gray-200 border-t-blue-600'}`}>
      </div>
      <p className={`mt-6 text-xl font-medium tracking-wide ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
        Menganalisis Materi & Membuat Soal Kuis...
      </p>
      <p className={`mt-2 text-base ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
        AI sedang bekerja. Mohon tunggu sebentar.
      </p>
    </div>
  );
}

export default LoadingSpinner;