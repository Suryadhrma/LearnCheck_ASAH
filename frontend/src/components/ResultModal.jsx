// ResultModal.jsx
import React from 'react';

// Ikon Emoji untuk setiap kategori
const PahamIcon = () => <span role="img" aria-label="paham" className="text-green-500">✅</span>;
const HokiIcon = () => <span role="img" aria-label="hoki" className="text-yellow-500">🍀</span>;
const KurangIcon = () => <span role="img" aria-label="kurang" className="text-orange-500">⚠️</span>;
const SalahIcon = () => <span role="img" aria-label="salah" className="text-red-500">❌</span>;

const ResultModal = ({ isDark, scorePercentage, avgConfidence, buckets, toggleModal }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-500 bg-opacity-75">
      <div className={`bg-white dark:bg-gray-800 rounded-lg w-11/12 md:w-3/4 p-6 shadow-lg ${isDark ? 'text-gray-100' : 'text-gray-800'}`}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Hasil Belajar</h2>
          <button onClick={toggleModal} className="text-gray-600 dark:text-white font-bold text-xl">
            &times; {/* Tombol Close */}
          </button>
        </div>

        {/* Skor dan Keyakinan */}
        <div className="flex gap-2 mb-4">
          <div className="flex-1 text-center py-2 bg-blue-500 rounded-md">
            <span>Skor</span>
            <p>{`${scorePercentage.toFixed(0)}%`}</p>
          </div>
          <div className="flex-1 text-center py-2 bg-green-500 rounded-md">
            <span>Keyakinan</span>
            <p>{`${avgConfidence.toFixed(0)}%`}</p>
          </div>
        </div>

        {/* Kategori Paham, Hoki, Kurang, Salah */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          <div className="flex items-center justify-center py-2 bg-green-500 text-white rounded-md">
            <PahamIcon /> <span>Paham: {buckets.benarYakin.length}</span>
          </div>
          <div className="flex items-center justify-center py-2 bg-yellow-500 text-white rounded-md">
            <HokiIcon /> <span>Hoki: {buckets.benarRagu.length}</span>
          </div>
          <div className="flex items-center justify-center py-2 bg-orange-500 text-white rounded-md">
            <KurangIcon /> <span>Kurang: {buckets.partial.length}</span>
          </div>
          <div className="flex items-center justify-center py-2 bg-red-500 text-white rounded-md">
            <SalahIcon /> <span>Salah: {buckets.salah.length}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultModal;
