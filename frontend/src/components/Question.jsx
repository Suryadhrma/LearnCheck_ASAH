import React, { useState, useEffect } from 'react';

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

// HELPER FUNCTIONS
const getAnswerStatus = (userAnswer, correctAnswer) => {
  if (!userAnswer || userAnswer.length === 0) return 'wrong';
  const correctPicks = userAnswer.filter(ans => correctAnswer.includes(ans));
  const wrongPicks = userAnswer.filter(ans => !correctAnswer.includes(ans));
  // Status: Benar Sempurna, Salah Total, atau Partial
  if (correctPicks.length === correctAnswer.length && wrongPicks.length === 0) return 'correct';
  if (correctPicks.length === 0) return 'wrong';
  return 'partial';
};

// SUB-COMPONENT: TOMBOL CONFIDENCE
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
    <button onClick={onClick} className={`flex-1 py-2 sm:py-3 px-2 rounded-lg text-xs sm:text-sm font-bold text-white transition-all transform active:scale-95 ${bgClass}`}>
      {text}
    </button>
  );
};

// MAIN COMPONENT
function Question({ question, userAnswer, onAnswerSubmit, isDark }) {
  // State Management
  const [stagedAnswers, setStagedAnswers] = useState([]); 
  const [stagedConfidence, setStagedConfidence] = useState(null);
  const [showQuestion, setShowQuestion] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showHint, setShowHint] = useState(false); // Toggle Hint

  const isMultipleChoice = question.type === 'multiple';
  const isAnswered = userAnswer !== null && userAnswer !== undefined;
  const answerStatus = isAnswered ? getAnswerStatus(userAnswer, question.answer) : null;

  // Efek Animasi & Cleanup saat pindah soal
  useEffect(() => {
    setShowQuestion(false);
    const timer = setTimeout(() => setShowQuestion(true), 50);
    
    // Reset semua state interaksi
    return () => {
      clearTimeout(timer);
      window.speechSynthesis.cancel(); // Matikan suara
      setIsSpeaking(false);
      setShowHint(false); // Tutup hint
    };
  }, [question]);

  // Logic Text-to-Speech (Membaca Soal + Opsi)
  const handleToggleSpeech = () => {
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    } else {
      // Gabungkan Soal + Opsi dengan jeda
      const optionsText = question.options.join('. '); 
      const fullText = `${question.question}. Pilihan jawaban adalah: ${optionsText}`;
      
      const utterance = new SpeechSynthesisUtterance(fullText);
      utterance.lang = 'id-ID'; // Bahasa Indonesia
      utterance.rate = 0.9;     // Kecepatan baca sedikit lambat
      
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      window.speechSynthesis.cancel(); 
      window.speechSynthesis.speak(utterance);
      setIsSpeaking(true);
    }
  };

  // Logic Memilih Jawaban
  const handleSelectAnswer = (option) => {
    if (isAnswered) return; // Cegah ubah jawaban jika sudah submit
    
    setStagedAnswers(prev => {
      if (isMultipleChoice) {
        // Toggle selection untuk Multiple Choice
        if (prev.includes(option)) return prev.filter(item => item !== option);
        if (prev.length >= 2) { alert("Maksimal pilih 2 jawaban!"); return prev; }
        return [...prev, option];
      } else {
        // Replace selection untuk Single Choice
        return [option];
      }
    });
    setStagedConfidence(null); 
  };

  // Logic Submit via Tombol Confidence
  const handleSelectConfidence = (level) => {
    window.speechSynthesis.cancel(); // Stop suara agar fokus
    setIsSpeaking(false);
    setStagedConfidence(level);
    onAnswerSubmit(question.id, stagedAnswers, level);
  };

  // Styling Dinamis
  const cardBg = isDark ? 'bg-gray-800' : 'bg-white';
  const textPrimary = isDark ? 'text-gray-100' : 'text-gray-900';
  
  let statusBorder = "";
  if (isAnswered) {
    if (answerStatus === 'correct') statusBorder = "border-2 border-green-500";
    else if (answerStatus === 'partial') statusBorder = "border-2 border-orange-500";
    else statusBorder = "border-2 border-red-500";
  }

  return (
    // Wrapper Full Height Flexbox
    <div className={`w-full h-full flex flex-col ${cardBg} ${statusBorder} rounded-xl overflow-hidden transition-all duration-300 shadow-sm`}>
      
      {/* AREA SCROLLABLE (Header + Soal + Hint + Opsi) */}
      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
        
        <div className={`transition-opacity duration-300 ${showQuestion ? 'opacity-100' : 'opacity-0'}`}>
          
          {/* Header Bar: Topik & Action Buttons */}
          <div className="flex justify-between items-start mb-3 gap-2">
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
            </div>
            
            <span className="text-[10px] font-bold text-gray-400 border border-gray-200 dark:border-gray-700 px-2 py-0.5 rounded">
              {isMultipleChoice ? "Pilih Banyak" : "Pilih Satu"}
            </span>
          </div>

          {/* Teks Pertanyaan */}
          <p className={`text-sm sm:text-base font-semibold mb-2 leading-relaxed ${textPrimary}`}>
            {question.question}
          </p>

          {/* Kotak Hint */}
          {showHint && question.hint && (
            <div className="mb-4 p-3 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 text-xs sm:text-sm text-yellow-800 dark:text-yellow-200 animate-fade-in-fast flex items-start gap-2">
               <div className="mt-0.5 flex-shrink-0"><LightBulbIcon /></div>
               <div className="italic"><span className="font-bold not-italic">Petunjuk:</span> {question.hint}</div>
            </div>
          )}

          {/* Daftar Opsi Jawaban */}
          <div className="space-y-2 pb-4 mt-4">
            {question.options.map((option, index) => {
              const isCorrectOption = question.answer.includes(option);
              const isSelected = stagedAnswers.includes(option);
              const isUserFinalChoice = isAnswered && userAnswer.includes(option);
              
              // Logic Pewarnaan Tombol
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
                  className={`relative w-full p-3 border rounded-lg text-left transition-all duration-200 flex items-start gap-3 ${styleClasses}`}
                  style={{ 
                    opacity: showQuestion ? 1 : 0, 
                    transform: showQuestion ? 'translateY(0)' : 'translateY(10px)',
                    transitionDelay: `${index * 50}ms`
                  }}
                >
                  {/* Indikator Pilihan (Bulat/Kotak) */}
                  <div className={`mt-0.5 w-4 h-4 flex-shrink-0 flex items-center justify-center border transition-colors
                    ${isMultipleChoice ? 'rounded' : 'rounded-full'}
                    ${isSelected || isUserFinalChoice ? 'border-transparent bg-current' : 'border-gray-400'}
                  `}>
                     {(isSelected || isUserFinalChoice) && (
                        isMultipleChoice 
                        ? <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" /></svg>
                        : <div className="w-2 h-2 bg-white rounded-full" />
                     )}
                  </div>
                  
                  {/* Teks Opsi */}
                  <span className={`text-xs sm:text-sm font-medium flex-1 ${isSelected && !isAnswered ? 'text-white' : ''}`}>{option}</span>
                  
                  {/* Icon Feedback (Benar/Salah) */}
                  {isAnswered && isCorrectOption && <CheckIcon />}
                  {isAnswered && isUserFinalChoice && !isCorrectOption && <XIcon />}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* FOOTER AREA (Fixed Bottom) */}
      {(stagedAnswers.length > 0 || isAnswered) && (
        <div className={`flex-shrink-0 p-3 border-t ${isDark ? 'bg-gray-900/50 border-gray-700' : 'bg-gray-50 border-gray-100'}`}>
          
          {/* SELEKSI KEYAKINAN (Sebelum Submit) */}
          {!isAnswered && stagedAnswers.length > 0 && (
            <div className="animate-fade-in-fast">
              <p className={`text-[10px] sm:text-xs font-bold text-center mb-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                Seberapa yakin Anda?
              </p>
              <div className="flex gap-2">
                <ConfidenceButton text="Ragu 🤔" onClick={() => handleSelectConfidence(0.5)} isSelected={stagedConfidence === 0.5} colorBase="yellow" isDark={isDark} />
                <ConfidenceButton text="Yakin 🚀" onClick={() => handleSelectConfidence(1.0)} isSelected={stagedConfidence === 1.0} colorBase="green" isDark={isDark} />
              </div>
            </div>
          )}

          {/* PENJELASAN (Setelah Submit) */}
          {isAnswered && (
             <div className={`rounded p-3 text-xs sm:text-sm leading-relaxed border-l-4 animate-fade-in overflow-y-auto max-h-32 custom-scrollbar
                ${answerStatus === 'correct' ? (isDark ? 'bg-green-900/30 border-green-500 text-green-200' : 'bg-green-50 border-green-500 text-green-800') 
                : answerStatus === 'partial' ? (isDark ? 'bg-orange-900/30 border-orange-500 text-orange-200' : 'bg-orange-50 border-orange-500 text-orange-800')
                : (isDark ? 'bg-red-900/30 border-red-500 text-red-200' : 'bg-red-50 border-red-500 text-red-800')}`}>
                <span className="font-bold block mb-1">
                  {answerStatus === 'correct' ? '🎉 Benar!' : answerStatus === 'partial' ? '⚠️ Kurang Tepat' : '😅 Salah'}
                </span>
                {question.explanation}
             </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Question;