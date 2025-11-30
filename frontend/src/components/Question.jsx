import React, { useState, useEffect } from 'react';

const CheckIcon = () => <svg className="w-6 h-6 mr-3 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const XIcon = () => <svg className="w-6 h-6 mr-3 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const WarningIcon = () => <svg className="w-6 h-6 mr-3 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>;

// LOGIC BARU: Menentukan Status Jawaban (Correct, Partial, Wrong)
const getAnswerStatus = (userAnswer, correctAnswer) => {
  if (!userAnswer || userAnswer.length === 0) return 'wrong';
  
  // Hitung irisan (jawaban user yang ada di kunci jawaban)
  const correctPicks = userAnswer.filter(ans => correctAnswer.includes(ans));
  // Hitung jawaban ngawur (jawaban user yang TIDAK ada di kunci jawaban)
  const wrongPicks = userAnswer.filter(ans => !correctAnswer.includes(ans));

  // KONDISI 1: BENAR SEMPURNA (Semua benar dipilih, tidak ada yang salah)
  if (correctPicks.length === correctAnswer.length && wrongPicks.length === 0) {
    return 'correct';
  }
  
  // KONDISI 2: SALAH TOTAL (Tidak ada satupun yang benar)
  if (correctPicks.length === 0) {
    return 'wrong';
  }

  // KONDISI 3: KURANG TEPAT (Ada yang benar, tapi ada yang salah ATAU kurang lengkap)
  return 'partial';
};

const ConfidenceButton = ({ text, onClick, isSelected, colorBase, isDark }) => {
  let bgClass = "";
  const textClass = "text-white"; 

  if (colorBase === 'yellow') {
    bgClass = isSelected 
      ? "bg-yellow-500 ring-4 ring-yellow-200" 
      : "bg-yellow-400 hover:bg-yellow-500";
    if (isDark && !isSelected) bgClass = "bg-yellow-600 hover:bg-yellow-500"; 
  } else if (colorBase === 'green') {
    bgClass = isSelected 
      ? "bg-green-600 ring-4 ring-green-200" 
      : "bg-green-500 hover:bg-green-600";
    if (isDark && !isSelected) bgClass = "bg-green-700 hover:bg-green-600";
  }

  return (
    <button
      onClick={onClick}
      className={`flex-1 text-base font-bold py-4 px-4 rounded-xl transition-all duration-200 transform shadow-md active:scale-95
                  ${bgClass} ${textClass}`}
    >
      {text}
    </button>
  );
};

function Question({ question, userAnswer, onAnswerSubmit, isDark }) {
  const [stagedAnswers, setStagedAnswers] = useState([]); 
  const [stagedConfidence, setStagedConfidence] = useState(null);
  const [showQuestion, setShowQuestion] = useState(false);

  const isMultipleChoice = question.type === 'multiple';
  const isAnswered = userAnswer !== null && userAnswer !== undefined;

  // Tentukan Status Jawaban (correct / partial / wrong)
  const answerStatus = isAnswered ? getAnswerStatus(userAnswer, question.answer) : null;

  useEffect(() => {
    const timer = setTimeout(() => setShowQuestion(true), 100);
    return () => clearTimeout(timer);
  }, [question]);

  const handleSelectAnswer = (option) => {
    if (isAnswered) return;

    setStagedAnswers(prev => {
      if (isMultipleChoice) {
        if (prev.includes(option)) return prev.filter(item => item !== option);
        else return [...prev, option];
      } else {
        return [option];
      }
    });
    setStagedConfidence(null); 
  };

  const handleSelectConfidence = (level) => {
    setStagedConfidence(level);
    onAnswerSubmit(question.id, stagedAnswers, level);
  };

  const cardBg = isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-white';
  const textPrimary = isDark ? 'text-gray-100' : 'text-gray-900';

  // Tentukan warna border kartu berdasarkan status
  let borderClass = "";
  if (isAnswered) {
    if (answerStatus === 'correct') borderClass = 'border-green-500';
    else if (answerStatus === 'partial') borderClass = 'border-orange-400'; // Warna Oranye untuk Kurang Tepat
    else borderClass = 'border-red-500';
  }

  return (
    <div className={`${cardBg} rounded-2xl shadow-2xl transition-all duration-500 border-4 overflow-hidden ${borderClass}`}>
      
      <div className="p-6 sm:p-10">
        <div className={`transition-all duration-500 ease-out ${showQuestion ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`}>
          {question.topic && (
            <div className="mb-4 flex justify-between items-center">
              <span className="inline-block bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 text-sm font-semibold px-4 py-1 rounded-full uppercase tracking-wider">
                {question.topic}
              </span>
              <span className="text-xs font-bold text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                {isMultipleChoice ? "☑️ Pilih Banyak Jawaban" : "🔘 Pilih Satu Jawaban"}
              </span>
            </div>
          )}
          <p className={`text-xl font-semibold mb-6 ${textPrimary}`}>{question.question}</p>
        </div>
        
        <div className="space-y-4">
          {question.options.map((option, index) => {
            const isCorrectOption = question.answer.includes(option);
            const isSelected = stagedAnswers.includes(option);
            const isUserFinalChoice = isAnswered && userAnswer.includes(option);
            
            let styleClasses = "";

            if (isAnswered) {
              if (isCorrectOption) {
                // Jawaban Benar (Selalu Hijau)
                styleClasses = isDark ? "bg-green-900/50 border-green-500 text-green-100" : "bg-green-50 border-green-500 text-green-800";
              } else if (isUserFinalChoice && !isCorrectOption) {
                // Jawaban User Salah (Merah)
                styleClasses = isDark ? "bg-red-900/50 border-red-500 text-red-100" : "bg-red-50 border-red-500 text-red-800";
              } else {
                // Opsi lain
                styleClasses = isDark ? "bg-gray-700 border-gray-600 text-gray-500 opacity-50" : "bg-gray-50 border-gray-200 text-gray-400 opacity-50";
              }
            } else {
              if (isSelected) styleClasses = "bg-blue-600 border-blue-600 text-white shadow-lg scale-[1.02]";
              else styleClasses = isDark ? "bg-gray-700 border-gray-600 text-gray-200 hover:border-blue-500" : "bg-white border-gray-300 text-gray-700 hover:border-blue-500";
            }

            return (
              <button
                key={index}
                onClick={() => handleSelectAnswer(option)}
                disabled={isAnswered}
                className={`flex items-center w-full p-4 border-2 rounded-lg transition-all duration-200 text-left transform ${styleClasses}`}
                style={{
                  opacity: showQuestion ? 1 : 0,
                  transform: showQuestion ? 'translateY(0)' : 'translateY(20px)',
                  transitionDelay: `${100 + index * 50}ms`
                }}
              >
                <div className={`w-5 h-5 flex-shrink-0 mr-4 flex items-center justify-center transition-colors border
                  ${isMultipleChoice ? 'rounded' : 'rounded-full'} 
                  ${isSelected || isUserFinalChoice ? 'bg-current border-transparent' : 'border-gray-400'}`}>
                  
                  {(isSelected || isUserFinalChoice) && (
                    isMultipleChoice ? (
                      <svg className={`w-3 h-3 text-white`} fill="currentColor" viewBox="0 0 20 20"><path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/></svg>
                    ) : (
                      <div className="w-2.5 h-2.5 bg-white rounded-full" />
                    )
                  )}
                </div>

                {isAnswered && isCorrectOption && <CheckIcon />}
                {isAnswered && isUserFinalChoice && !isCorrectOption && <XIcon />}
                
                <span className="font-semibold text-base flex-1">{option}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* FOOTER */}
      {(stagedAnswers.length > 0 || isAnswered) && (
        <div className={`p-6 sm:p-8 border-t ${isDark ? 'bg-gray-900 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
          {!isAnswered && stagedAnswers.length > 0 && (
            <div className="animate-fade-in-fast">
              <h4 className={`font-semibold text-center mb-4 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Seberapa yakin Anda?
              </h4>
              <div className="flex gap-4">
                <ConfidenceButton 
                    text="Ragu-ragu 🤔" 
                    onClick={() => handleSelectConfidence(0.5)}
                    isSelected={stagedConfidence === 0.5}
                    colorBase="yellow"
                    isDark={isDark}
                />
                <ConfidenceButton 
                    text="Yakin Banget! 🚀" 
                    onClick={() => handleSelectConfidence(1.0)}
                    isSelected={stagedConfidence === 1.0}
                    colorBase="green"
                    isDark={isDark}
                />
              </div>
            </div>
          )}

          <div className={`transition-all duration-500 ease-out overflow-hidden ${isAnswered ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
            {isAnswered && (
              <div className={`p-5 rounded-lg border-l-4 mt-4 
                ${answerStatus === 'correct' 
                    ? (isDark ? 'bg-green-900/30 border-green-500' : 'bg-green-100 border-green-500') 
                    : answerStatus === 'partial'
                        ? (isDark ? 'bg-orange-900/30 border-orange-500' : 'bg-orange-100 border-orange-500') // Background Oranye untuk Partial
                        : (isDark ? 'bg-red-900/30 border-red-500' : 'bg-red-100 border-red-500')}`}>
                
                <h4 className={`font-bold text-lg flex items-center
                  ${answerStatus === 'correct' ? (isDark ? 'text-green-400' : 'text-green-800') 
                  : answerStatus === 'partial' ? (isDark ? 'text-orange-400' : 'text-orange-800') // Text Oranye
                  : (isDark ? 'text-red-400' : 'text-red-800')}`}>
                  {answerStatus === 'correct' && 'Jawaban Benar! 🎉'}
                  {answerStatus === 'partial' && <><WarningIcon /> Jawaban Kurang Tepat</>}
                  {answerStatus === 'wrong' && 'Jawaban Salah 😅'}
                </h4>
                
                <p className={`text-base mt-2 leading-relaxed 
                  ${answerStatus === 'correct' ? (isDark ? 'text-green-200' : 'text-green-700') 
                  : answerStatus === 'partial' ? (isDark ? 'text-orange-200' : 'text-orange-800')
                  : (isDark ? 'text-red-200' : 'text-red-700')}`}>
                  {question.explanation}
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