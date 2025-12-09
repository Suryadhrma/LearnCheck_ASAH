import React, { useState, useEffect } from 'react';
import App from '../App';
import AnswerModal from './AnswerModal';
// ICONS SVG 
const CheckIcon = () => <svg className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>;
const XIcon = () => <svg className="w-4 h-4 sm:w-5 sm:h-5 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>;
const WarningIcon = () => <svg className="w-4 h-4 sm:w-5 sm:h-5 text-orange-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>;

// Icon Speaker (Suara Mati)
const SpeakerIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /></svg>;
// Icon Speaker Wave (Suara Hidup)
const SpeakerWaveIcon = () => <svg className="w-5 h-5 animate-pulse text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /></svg>;
// Icon Lampu (Hint)
const LightBulbIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m12.728 0l-.707.707M12 21v-1m-6.364-1.636l.707-.707M6.343 6.343l.707.707m12.728 0l.707.707M12 5a7 7 0 100 14 7 7 0 000-14z" /></svg>;
// ICONS SVG
const ArrowRightIcon = () => (<svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>);
// HELPER FUNCTIONS
const getAnswerStatus = (userAnswer, correctAnswer) => {
  if (!userAnswer || userAnswer.length === 0) return 'wrong';
  const correctPicks = userAnswer.filter(ans => correctAnswer.includes(ans));
  const wrongPicks = userAnswer.filter(ans => !correctAnswer.includes(ans));
  if (correctPicks.length === correctAnswer.length && wrongPicks.length === 0) return 'correct';
  if (correctPicks.length === 0) return 'wrong';
  return 'partial';
};

const ConfidenceButton = ({ text, onClick, isSelected, colorBase, isDark }) => {
  let bgClass = "";
  // Styling tombol berdasarkan warna (Kuning/Hijau) dan mode (Dark/Light)
  if (colorBase === 'yellow') {
    bgClass = isSelected ? "bg-yellow-500 ring-2 ring-yellow-200" : "bg-yellow-400 hover:bg-yellow-500";
    if (isDark && !isSelected) bgClass = "bg-yellow-700 hover:bg-yellow-600"; 
  } else {
    bgClass = isSelected ? "bg-green-600 ring-2 ring-green-200" : "bg-green-500 hover:bg-green-600";
    if (isDark && !isSelected) bgClass = "bg-green-700 hover:bg-green-600";
  }

  return (
    <button onClick={onClick} className={`flex-1 py-1.5 px-4 rounded-lg text-xs sm:text-sm font-bold text-white transition-all transform active:scale-95 ${bgClass}`}>
      {text}
    </button>
  );
};


// MAIN COMPONENT
function Question({ question, userAnswer, onAnswerSubmit, isDark, userId, difficulty, currentQuestionIndex , quizData, handleNextQuestion }) {
  const [stagedAnswers, setStagedAnswers] = useState([]); 
  const [stagedConfidence, setStagedConfidence] = useState(null);
  const [showQuestion, setShowQuestion] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showHint, setShowHint] = useState(false); 
  const [showAnswerModal, setShowAnswerModal] = useState(false); // State to control modal visibility
  const [hasModalBeenClosed, setHasModalBeenClosed] = useState(false); // Track if modal was closed
  
  const isMultipleChoice = question.type === 'multiple';
  const isAnswered = userAnswer !== null && userAnswer !== undefined;
  const answerStatus = isAnswered ? getAnswerStatus(userAnswer, question.answer) : null;

  useEffect(() => {
    setShowQuestion(false);
    const timer = setTimeout(() => setShowQuestion(true), 50);
     // Show the answer modal automatically after the answer is submitted, if it's not closed yet
     if (isAnswered && !hasModalBeenClosed) {
      setTimeout(() => {
        setShowAnswerModal(true); // Modal appears automatically
      }, 500); // Slight delay before modal appears after submission
    }
    return () => {
      clearTimeout(timer);
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      setShowHint(false);
    };
  }, [question, isAnswered, hasModalBeenClosed]);
  
  
  const handleToggleSpeech = () => {
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    } else {
      const optionsText = question.options.join('. '); 
      const fullText = `${question.question}. Pilihan jawaban adalah: ${optionsText}`;
      
      const utterance = new SpeechSynthesisUtterance(fullText);
      utterance.lang = 'id-ID';
      utterance.rate = 0.9;
      
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      window.speechSynthesis.cancel(); 
      window.speechSynthesis.speak(utterance);
      setIsSpeaking(true);
    }
  };
// Handler toggle modal
 // Close modal and prevent it from reopening again
 const handleCloseModal = () => {
  setShowAnswerModal(false);
  setHasModalBeenClosed(true); // Mark modal as closed
};
 // Reopen the modal after it has been closed
 const reopenModal = () => setShowAnswerModal(true);

  const handleSelectAnswer = (option) => {
    if (isAnswered) return;
    
    setStagedAnswers(prev => {
      if (isMultipleChoice) {
        if (prev.includes(option)) return prev.filter(item => item !== option);
        if (prev.length >= 2) { alert("Maksimal pilih 2 jawaban!"); return prev; }
        return [...prev, option];
      } else {
        return [option];
      }
    });
    setStagedConfidence(null); 
  };

  const handleSelectConfidence = (level) => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
    setStagedConfidence(level);
    onAnswerSubmit(question.id, stagedAnswers, level);
  };

  const cardBg = isDark ? 'bg-gray-800' : 'bg-white';
  const textPrimary = isDark ? 'text-gray-100' : 'text-gray-900';
  
  let statusBorder = "";
  if (isAnswered) {
    if (answerStatus === 'correct') statusBorder = "border-2 border-green-500";
    else if (answerStatus === 'partial') statusBorder = "border-2 border-orange-500";
    else statusBorder = "border-2 border-red-500";
  }

  return (
    <div className={`w-full h-full flex flex-col ${cardBg} ${statusBorder} rounded-xl overflow-hidden transition-all duration-300 shadow-sm`}>
       {/* Modal untuk feedback jawaban */}
       <AnswerModal
        isOpen={showAnswerModal}
        onClose={handleCloseModal} // Close modal and prevent reopening
        answerStatus={answerStatus}
        explanation={question.explanation}
        isDark={isDark}
      />
      {/* AREA SCROLLABLE */}
      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
        
        <div className={`transition-opacity duration-300 ${showQuestion ? 'opacity-100' : 'opacity-0'}`}>
          
          {/* Header Bar */}
          <div className="flex justify-between items-start mb-2 gap-2">
            <div className="flex items-center gap-2">
              {question.topic && (
                <span className="bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wide">
                  {question.topic}
                </span>
              )}
              
              {/* Tombol Speaker */}
              <button 
                onClick={handleToggleSpeech}
                className={`p-1 rounded-full transition-colors 
                  ${isSpeaking ? 'text-blue-500 bg-blue-100 dark:bg-blue-900' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'}`}
                title={isSpeaking ? "Matikan Suara" : "Bacakan Soal & Opsi"}
              >
                {isSpeaking ? <SpeakerWaveIcon /> : <SpeakerIcon />}
              </button>

              {/* Tombol Hint */}
              {question.hint && (
                <button 
                  onClick={() => setShowHint(!showHint)}
                  className={`p-1 rounded-full transition-colors 
                    ${showHint ? 'text-yellow-500 bg-yellow-100 dark:bg-yellow-900' : 'text-gray-400 hover:text-yellow-500'}`}
                  title="Lihat Petunjuk"
                >
                  <LightBulbIcon />
                </button>
              )}
              {/* Tombol untuk membuka modal feedback */}
              {/* Show Answer Modal Button (Only when answered) */}
        {isAnswered && !showAnswerModal &&  (
        <button 
          onClick={reopenModal}
          className="p-0 rounded-full bg-gray-500 text-white"
                title="Lihat Penjelasan Jawaban"
        >
                {answerStatus === 'correct' && <CheckIcon />}
                {answerStatus === 'partial' && <WarningIcon />}
                {answerStatus === 'wrong' && <XIcon />}
        </button>
      )}
                      {/* Counter soal, user ID, dan tingkat kesulitan soal */}
          <div className="flex flex-col text-right">
            <span className="text-[10px] text-gray-500 opacity-70 capitalize flex items-center gap-1">
                User: {userId} • {difficulty}
              </span>
          </div>
          <div className="flex items-center gap-2">
          {/* Display soal progress in terms of steps */}
          <div className="flex items-center space-x-2">
            {quizData.questions.map((_, index) => (
              <div
                key={index}
                className={`h-1 w-10 rounded-full transition-all duration-300 ${
                  index <= currentQuestionIndex
                    ? 'bg-blue-500 shadow-2xl shadow-blue-500/60' // Highlight completed steps with glow aura effect
                    : 'bg-gray-400' // Uncompleted steps
                }`}
              />
            ))}
          </div>

          {/* Counter soal */}
          <span className="text-xs text-gray-500 dark:text-gray-300">
            {currentQuestionIndex + 1}/{quizData.questions.length} {/* Counter soal */}
          </span>
        </div>
        </div>
            
            {/* Material Title dan Pilihan Jenis Soal */}
          <div className="flex items-center justify-between">
            <h1 className="text-[10px] text-gray-500 opacity-70 capitalize flex items-center gap-1">
              {quizData.materialTitle}
            </h1>

            <span className="text-[10px] font-bold text-gray-400 border border-gray-200 dark:border-gray-700 px-2 py-0.5 rounded">
              {isMultipleChoice ? "Pilih Banyak" : "Pilih Satu"}
            </span>
          </div>
            
          </div>

          {/* Teks Pertanyaan – HAPUS text-sm/sm:text-base supaya ikut baseTextClass */}
          <p className={`font-semibold mb-2 leading-relaxed ${textPrimary}`}>
            {question.question}
          </p>

          {/* Kotak Hint – HAPUS text-xs/sm:text-sm supaya ikut baseTextClass */}
          {showHint && question.hint && (
            <div
              className={`
                mb-4 p-3 rounded-lg
                bg-yellow-50 dark:bg-yellow-900/20
                border border-yellow-200 dark:border-yellow-700
                text-yellow-800 dark:text-yellow-200
                animate-fade-in-fast flex items-start gap-2
              `}
            >
              <div className="mt-0.5 flex-shrink-0"><LightBulbIcon /></div>
              <div className="italic">
                <span className="font-bold not-italic">Petunjuk:</span> {question.hint}
              </div>
            </div>
          )}

          
          {/* Daftar Opsi Jawaban */}
        <div className="space-y-1 pb-3 mt-3"> {/* Kurangi space antar opsi */}
          {question.options.map((option, index) => {
            const isCorrectOption = question.answer.includes(option);
            const isSelected = stagedAnswers.includes(option);
            const isUserFinalChoice = isAnswered && userAnswer.includes(option);
            
            let styleClasses = "";
            if (isAnswered) {
              if (isCorrectOption) styleClasses = isDark ? "bg-green-900/30 border-green-500/50" : "bg-green-50 border-green-500";
              else if (isUserFinalChoice && !isCorrectOption) styleClasses = isDark ? "bg-red-900/30 border-red-500/50" : "bg-red-50 border-red-500";
              else styleClasses = isDark ? "bg-gray-700/50 border-gray-700 opacity-50" : "bg-gray-50 border-gray-200 opacity-60";
            } else {
              if (isSelected) styleClasses = "bg-blue-600 border-blue-600 text-white shadow-md";
              else styleClasses = isDark ? "bg-gray-700 border-gray-600 hover:bg-gray-600 text-gray-200" : "bg-white border-gray-200 hover:border-blue-400 text-gray-700";
            }

    return (
      <button
        key={index}
        onClick={() => handleSelectAnswer(option)}
        disabled={isAnswered}
        className={`
          relative w-full p-2 border rounded-md text-left 
          transition-all duration-200 flex items-center gap-2 
          ${styleClasses}
        `}
        style={{
          opacity: showQuestion ? 1 : 0,
          transform: showQuestion ? 'translateY(0)' : 'translateY(10px)',
          transitionDelay: `${index * 50}ms`
        }}
      >
        {/* Indikator Pilihan */}
        <div
          className={`
            mt-0.5 w-3 h-3 flex-shrink-0 flex items-center justify-center border transition-colors
            ${isMultipleChoice ? 'rounded' : 'rounded-full'}
            ${isSelected || isUserFinalChoice ? 'border-transparent bg-current' : 'border-gray-400'}
          `}
        >
          {(isSelected || isUserFinalChoice) && (
            isMultipleChoice 
              ? (
                <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" />
                </svg>
              )
              : <div className="w-1.5 h-1.5 bg-white rounded-full" />
          )}
        </div>
        
        {/* Teks Opsi */}
        <span className={`font-medium flex-1 text-sm ${isSelected && !isAnswered ? 'text-white' : ''}`}>
          {option}
        </span>
        
        {/* Icon Feedback */}
        {isAnswered && isCorrectOption && <CheckIcon />}
        {isAnswered && isUserFinalChoice && !isCorrectOption && <XIcon />}
      </button>
    );
  })}
</div>
{/* FOOTER AREA */}
{(stagedAnswers.length > 0 || isAnswered) && (
  <div className={`flex-shrink-0 p-1 border-t ${isDark ? 'bg-gray-900/50 border-gray-700' : 'bg-gray-50 border-gray-100'}`}>
    
    {/* SELEKSI KEYAKINAN */}
    {!isAnswered && stagedAnswers.length > 0 && (
      <div className="animate-fade-in-fast">
        <p className={`text-[10px] sm:text-xs font-bold text-center mb-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                Seberapa yakin Anda?
              </p>
        <div className="flex gap-2"> {/* Mengurangi jarak antar tombol */}
          <ConfidenceButton
            text="Ragu 🤔"
            onClick={() => handleSelectConfidence(0.5)}
            isSelected={stagedConfidence === 0.5}
            colorBase="yellow"
            isDark={isDark}
          />
          <ConfidenceButton
            text="Yakin 🚀"
            onClick={() => handleSelectConfidence(1.0)}
            isSelected={stagedConfidence === 1.0}
            colorBase="green"
            isDark={isDark}
          />
        </div>
      </div>
    )}
{/* Button Next Question */}
{userAnswer && (  // Checks if the question has been answered
            <div className="flex-shrink-0 pt-4 pb-2 z-20 bg-transparent">
              <button
                onClick={handleNextQuestion}
                className="w-full py-0.5 rounded-lg font-bold text-white bg-blue-600 hover:bg-blue-700 flex items-center justify-center shadow-lg transition-transform active:scale-95"
              >
                {currentQuestionIndex === quizData.questions.length - 1 ? 'Lihat Laporan' : 'Soal Selanjutnya'}
                {currentQuestionIndex !== quizData.questions.length - 1 && <ArrowRightIcon />}
              </button>
            </div>
          )}

  </div>
)}
        </div>
      </div>

      
    </div>
  );
}

export default Question;
