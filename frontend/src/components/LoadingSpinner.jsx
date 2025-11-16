import React from 'react';

function LoadingSpinner() {
  return (
    // Latar belakang gradien yang halus
    <div className="flex flex-col justify-center items-center h-screen w-full bg-gradient-to-br from-white to-gray-50 animate-fade-in">
      {/* Spinner yang lebih halus */}
      <div 
        className="w-16 h-16 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin"
      >
      </div>
      <p className="mt-6 text-xl font-medium text-gray-700 tracking-wide">
        Menganalisis Materi & Membuat Soal Kuis...
      </p>
      <p className="mt-2 text-base text-gray-500">
        AI sedang bekerja. Mohon tunggu sebentar.
      </p>
    </div>
  );
}

export default LoadingSpinner;