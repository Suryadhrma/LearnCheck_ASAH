import React, { useState } from 'react';

// --- Ikon (Tidak berubah) ---
const CheckIcon = () => (
  <svg className="w-6 h-6 mr-3 text-green-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const XIcon = () => (
  <svg className="w-6 h-6 mr-3 text-red-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);
// -----------------------------

// Komponen tombol keyakinan (Dipoles)
const ConfidenceButton = ({ text, level, onClick, stagedConfidence }) => (
  <button
    onClick={() => onClick(level)}
    className={`flex-1 text-sm font-medium py-3 px-3 rounded-lg border-2 transition-all duration-200
                ${stagedConfidence === level
                  ? 'bg-blue-600 text-white border-blue-600 shadow-lg' // Terpilih
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-blue-500' // Normal
                }`}
  >
    {text}
  </button>
);


function Question({ question, userAnswer, onAnswerSubmit }) {
  
  const [stagedAnswer, setStagedAnswer] = useState(null);
  const [stagedConfidence, setStagedConfidence] = useState(null);
  
  const isAnswered = userAnswer !== null;
  const isUserCorrect = userAnswer === question.answer;

  const handleSelectAnswer = (option) => {
    setStagedAnswer(option);
    setStagedConfidence(null); 
  };

  const handleSelectConfidence = (confidenceLevel) => {
    setStagedConfidence(confidenceLevel);
    onAnswerSubmit(question.id, stagedAnswer, confidenceLevel);
  };


  return (
    // === DESAIN KARTU TERPADU (BARU) ===
    // 'overflow-hidden' penting untuk menyatukan border-radius
    <div className={`bg-white rounded-2xl shadow-2xl transition-all duration-500 border-4
                   ${isAnswered ? (isUserCorrect ? 'border-green-300' : 'border-red-300') : 'border-white'}
                   overflow-hidden`}
    >
      {/* Bagian Pertanyaan */}
      <div className="p-6 sm:p-10">
        
        {/* Badge Topik */}
        {question.topic && (
          <div className="mb-4">
            <span className="inline-block bg-blue-100 text-blue-800 text-sm font-semibold px-4 py-1 rounded-full uppercase tracking-wider">
              {question.topic}
            </span>
          </div>
        )}
        
        <p className="text-xl lg:text-2xl font-semibold text-gray-900 mb-6">
          {question.question}
        </p>
        
        {/* Opsi Jawaban (Dipoles) */}
        <div className="space-y-4">
          {question.options.map((option, index) => {
            
            const isCorrect = option === question.answer;
            const isStaged = option === stagedAnswer;
            const isUserChoice = option === userAnswer; 

            let styleClasses = "";
            
            if (isAnswered) {
              // --- Tampilan SETELAH dijawab (DIKUNCI) ---
              if (isCorrect) {
                // Jawaban Benar
                styleClasses = "bg-green-50 border-green-500 text-green-800 ring-2 ring-green-200 scale-100";
              } else if (isUserChoice) {
                // Jawaban User (Salah)
                styleClasses = "bg-red-50 border-red-500 text-red-800 ring-2 ring-red-200 scale-100";
              } else {
                // Opsi Lain (Pudar)
                styleClasses = "bg-gray-50 border-gray-200 text-gray-500 opacity-60";
              }
            } else {
              // --- Tampilan SEBELUM dijawab ---
              if (isStaged) {
                // Jawaban Dipilih (Staged)
                styleClasses = "bg-blue-50 border-blue-500 text-blue-800 ring-2 ring-blue-300 shadow-lg scale-[1.02]";
              } else {
                // Jawaban Normal (Hover dipoles)
                styleClasses = "bg-white border-gray-300 text-gray-700 hover:border-blue-500 hover:shadow-lg hover:scale-[1.02] cursor-pointer";
              }
            }

            return (
              <button
                key={index}
                onClick={() => handleSelectAnswer(option)}
                disabled={isAnswered}
                className={`flex items-center w-full p-5 border-2 rounded-lg 
                            transition-all duration-300 text-left
                            transform
                            ${styleClasses}
                            ${!isAnswered && !isStaged ? 'focus:outline-none focus:ring-2 focus:ring-blue-400' : ''}
                            `}
              >
                {isAnswered && isCorrect && <CheckIcon />}
                {isAnswered && isUserChoice && !isCorrect && <XIcon />}
                {isAnswered && !isCorrect && !isUserChoice && <div className="w-6 h-6 mr-3 flex-shrink-0"></div>}
                
                <span className="font-semibold text-base">{option}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Bagian Keyakinan & Penjelasan (Sekarang bagian dari kartu yang sama) */}
      {(stagedAnswer || isAnswered) && (
        <div className="bg-gray-50 p-6 sm:p-8 border-t border-gray-200">
          
          {/* 1. Tampilkan Kotak Keyakinan (jika belum dijawab) */}
          {!isAnswered && stagedAnswer && (
            <div className="animate-fade-in-fast">
              <h4 className="font-semibold text-center text-gray-700 mb-4">Seberapa yakin Anda dengan jawaban ini?</h4>
              <div className="flex flex-col sm:flex-row gap-3">
                <ConfidenceButton 
                  text="Ragu-ragu" 
                  level={0.5} 
                  onClick={handleSelectConfidence} 
                  stagedConfidence={stagedConfidence} 
                />
                <ConfidenceButton 
                  text="Yakin" 
                  level={1.0} 
                  onClick={handleSelectConfidence} 
                  stagedConfidence={stagedConfidence} 
                />
              </div>
            </div>
          )}

          {/* 2. Tampilkan Kotak Penjelasan (jika sudah dijawab) */}
          <div 
            className="transition-all duration-500"
            style={{ 
              maxHeight: isAnswered ? '500px' : '0', 
              opacity: isAnswered ? 1 : 0, 
              overflow: 'hidden' 
            }}
          >
            {isAnswered && (
              <div className={`p-5 rounded-lg border-l-4 
                            ${isUserCorrect 
                              ? 'bg-green-100 border-green-500' 
                              : 'bg-red-100 border-red-500'
                            }`}
              >
                <h4 className={`font-bold text-lg ${isUserCorrect ? 'text-green-800' : 'text-red-800'}`}>
                  {isUserCorrect ? 'Jawaban Benar!' : 'Jawaban Salah'}
                </h4>
                <p className={`text-base mt-1 ${isUserCorrect ? 'text-green-700' : 'text-red-700'}`}>
                  {question.explanation || "Penjelasan tidak tersedia."}
                </p>
              </div>
            )}
          </div>
          
        </div>
      )}
    </div>
  );
}

export default Question;