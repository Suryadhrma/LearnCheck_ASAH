import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

// HELPER LOGIC
const getAnswerStatus = (userAnswer, correctAnswer) => {
  if (!userAnswer || userAnswer.length === 0) return 'wrong';
  const correctPicks = userAnswer.filter(ans => correctAnswer.includes(ans));
  const wrongPicks = userAnswer.filter(ans => !correctAnswer.includes(ans));
  if (correctPicks.length === correctAnswer.length && wrongPicks.length === 0) return 'correct';
  if (correctPicks.length === 0) return 'wrong';
  return 'partial';
};

// ICONS
const RefreshIcon = () => (<svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>);
const IconBenarYakin = () => <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const IconBenarRagu = () => <svg className="w-5 h-5 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const WarningIcon = () => <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>;
const IconSalahYakin = () => <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const SpeakerIcon = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /></svg>;
const SpeakerWaveIcon = () => <svg className="w-4 h-4 animate-pulse text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /></svg>;
const RobotIcon = () => <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>;

// SUB-COMPONENTS
const StatBox = ({ label, value, subLabel, isDark }) => (
  <div className={`flex-1 p-2 rounded-lg border flex flex-col items-center justify-center
                  ${isDark ? 'bg-gray-700/50 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
    <span className={`text-[10px] font-bold uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{label}</span>
    <span className="text-2xl sm:text-3xl font-black leading-none my-1">{value}</span>
    {subLabel && <span className="text-[10px] opacity-70">{subLabel}</span>}
  </div>
);

const MatrixItem = ({ label, count, icon, colorClass, isDark }) => (
  <div className={`flex flex-col items-center justify-center p-2 rounded border
                  ${isDark ? 'bg-gray-700/30 border-gray-700' : 'bg-white border-gray-100'}`}>
    <div className="flex items-center gap-1 mb-1">
      {icon}
      <span className="text-xl font-bold">{count}</span>
    </div>
    <span className={`text-[10px] text-center leading-none ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{label}</span>
  </div>
);

const RecommendationItem = ({ question, userAnswer, status, isDark }) => {
  const [aiExplanation, setAiExplanation] = useState(null);
  const [loadingAi, setLoadingAi] = useState(false);

  let borderColor, bgClass, titleText, titleColor;
  if (status === 'wrong') {
    borderColor = 'border-red-500'; bgClass = isDark ? 'bg-red-900/20' : 'bg-red-50'; titleColor = 'text-red-600 dark:text-red-400'; titleText = "Salah";
  } else if (status === 'partial') {
    borderColor = 'border-orange-500'; bgClass = isDark ? 'bg-orange-900/20' : 'bg-orange-50'; titleColor = 'text-orange-600 dark:text-orange-400'; titleText = "Kurang Tepat";
  } else {
    borderColor = 'border-yellow-500'; bgClass = isDark ? 'bg-yellow-900/20' : 'bg-yellow-50'; titleColor = 'text-yellow-600 dark:text-yellow-400'; titleText = "Ragu-ragu";
  }

  const formattedUserAnswer = Array.isArray(userAnswer) ? userAnswer.join(', ') : (userAnswer || "-");
  const formattedCorrect = question.answer.join(', ');

  const handleAskAI = async () => {
    if (aiExplanation) return;
    setLoadingAi(true);
    try {
        const res = await axios.post(`${API_URL}/explain`, {
            question: question.question,
            topic: question.topic,
            userAnswer: formattedUserAnswer,
            correctAnswer: formattedCorrect
        });
        setAiExplanation(res.data.explanation);
    } catch (err) {
        setAiExplanation("Gagal menghubungi AI Tutor. Coba lagi nanti.");
    } finally {
        setLoadingAi(false);
    }
  };

  return (
    <div className={`p-3 sm:p-4 rounded border-l-4 shadow-sm text-sm mb-2 ${borderColor} ${bgClass}`}>
      <div className="flex justify-between items-start mb-1">
         <p className={`font-bold uppercase text-[10px] tracking-wider ${titleColor}`}>{titleText}</p>
      </div>
      <p className={`font-semibold mb-2 leading-snug text-xs sm:text-sm ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
        {question.question}
      </p>
      <div className={`text-[10px] sm:text-xs pt-2 border-t flex flex-col gap-1 ${isDark ? 'border-gray-600 text-gray-400' : 'border-gray-200 text-gray-500'}`}>
        <div><span className="font-bold">Jawaban Anda:</span> {formattedUserAnswer}</div>
        <div><span className="font-bold">Ket:</span> {question.explanation.substring(0, 100)}...</div>
      </div>

      <div className="mt-3">
        {!aiExplanation && !loadingAi && (
            <button onClick={handleAskAI} className="text-[10px] sm:text-xs font-bold flex items-center text-blue-600 hover:text-blue-800 dark:text-blue-400 transition-colors">
                <RobotIcon /> Bingung? Tanya AI Tutor
            </button>
        )}
        {loadingAi && <div className="text-[10px] italic text-gray-500 animate-pulse mt-2">Sedang mengetik penjelasan... ✍️</div>}
        {aiExplanation && (
            <div className="mt-3 p-3 bg-white dark:bg-gray-800 rounded-lg border border-blue-200 dark:border-gray-600 shadow-sm animate-fade-in">
                <div className="flex items-center gap-2 mb-1 text-blue-600 dark:text-blue-400 font-bold text-[10px] uppercase tracking-wider">
                    <RobotIcon /> Penjelasan AI Tutor
                </div>
                <p className="text-xs leading-relaxed text-gray-700 dark:text-gray-300">{aiExplanation}</p>
            </div>
        )}
      </div>
    </div>
  );
};

// MAIN COMPONENT: TERIMA PROP DIFFICULTY
function Result({ questions, userAnswers, confidenceScores, onRetry, isDark, difficulty }) {
  let score = 0;
  let totalConfidenceSum = 0;
  const buckets = { benarYakin: [], benarRagu: [], partial: [], salah: [] };
  const [isSpeaking, setIsSpeaking] = useState(false);
  const saveRef = useRef(false);

  questions.forEach(q => {
    const uAnswer = userAnswers[q.id];
    const status = getAnswerStatus(uAnswer, q.answer);
    const confidence = confidenceScores[q.id] || 0.5;
    totalConfidenceSum += confidence;

    if (status === 'correct') {
      score += 1;
      if (confidence === 1.0) buckets.benarYakin.push(q);
      else buckets.benarRagu.push(q);
    } else if (status === 'partial') {
      score += 0.5;
      buckets.partial.push(q);
    } else {
      buckets.salah.push(q);
    }
  });

  const totalQuestions = questions.length;
  // SAFEGUARD: Hindari NaN jika totalQuestions 0
  const scorePercentage = totalQuestions > 0 ? (score / totalQuestions) * 100 : 0;
  const avgConfidence = totalQuestions > 0 ? (totalConfidenceSum / totalQuestions) * 100 : 0;
  
  const priorityList = [
    ...buckets.salah.map(q => ({ ...q, answerStatus: 'wrong' })),
    ...buckets.partial.map(q => ({ ...q, answerStatus: 'partial' })),
    ...buckets.benarRagu.map(q => ({ ...q, answerStatus: 'review' }))
  ];

  // SAVE HISTORY (DIFFICULTY) 
  useEffect(() => {
    if (saveRef.current) return;
    saveRef.current = true;

    // Pastikan nilai score aman
    const safeScore = isNaN(scorePercentage) ? 0 : Math.round(scorePercentage);

    const newEntry = {
        date: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }), // "4 Des"
        score: safeScore,
        difficulty: difficulty || 'medium', // Simpan difficulty
        timestamp: Date.now()
    };

    const existingHistory = JSON.parse(localStorage.getItem('learncheck_history') || '[]');
    const updatedHistory = [newEntry, ...existingHistory].slice(0, 7);
    
    localStorage.setItem('learncheck_history', JSON.stringify(updatedHistory));
  }, [scorePercentage, difficulty]);

  const generateSummaryText = () => {
    let text = `Ringkasan hasil. Skor Anda ${scorePercentage.toFixed(0)} persen. `;
    if (buckets.benarYakin.length > 0) text += `${buckets.benarYakin.length} soal dipahami sempurna. `;
    if (buckets.salah.length > 0) text += `${buckets.salah.length} soal perlu dipelajari lagi. `;
    if (scorePercentage >= 80) text += "Hasil luar biasa!";
    else if (scorePercentage >= 50) text += "Cukup bagus.";
    else text += "Jangan menyerah.";
    return text;
  };
  const summaryText = generateSummaryText();

  useEffect(() => {
    return () => { window.speechSynthesis.cancel(); setIsSpeaking(false); };
  }, []);

  const handleToggleSummarySpeech = () => {
    if (isSpeaking) {
      window.speechSynthesis.cancel(); setIsSpeaking(false);
    } else {
      const utterance = new SpeechSynthesisUtterance(summaryText);
      utterance.lang = 'id-ID'; utterance.rate = 0.95;
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.cancel(); window.speechSynthesis.speak(utterance);
      setIsSpeaking(true);
    }
  };

  return (
    <div className={`w-full h-screen flex flex-col p-3 sm:p-4 animate-fade-in overflow-hidden
                    ${isDark ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'}`}>
      
      <div className="flex-shrink-0 flex flex-col gap-3 mb-3">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-lg font-bold leading-none">Hasil Belajar</h1>
            <p className={`text-[10px] ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
               Level: {difficulty} • Performa & Analisis
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <StatBox label="Skor" value={`${scorePercentage.toFixed(0)}%`} isDark={isDark} />
          <StatBox label="Keyakinan" value={`${avgConfidence.toFixed(0)}%`} isDark={isDark} />
        </div>

        <div className="grid grid-cols-4 gap-2">
          <MatrixItem label="Paham" count={buckets.benarYakin.length} icon={<IconBenarYakin />} isDark={isDark} />
          <MatrixItem label="Hoki" count={buckets.benarRagu.length} icon={<IconBenarRagu />} isDark={isDark} />
          <MatrixItem label="Kurang" count={buckets.partial.length} icon={<WarningIcon />} isDark={isDark} />
          <MatrixItem label="Salah" count={buckets.salah.length} icon={<IconSalahYakin />} isDark={isDark} />
        </div>
      </div>

      <div className="flex-1 min-h-0 flex flex-col border-t pt-2 border-gray-100 dark:border-gray-700">
        <h2 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2 flex-shrink-0">
           {priorityList.length > 0 ? "Detail Jawaban:" : "Kerja Bagus!"}
        </h2>
        
        <div className="overflow-y-auto pr-1 custom-scrollbar space-y-2 pb-16">
          {priorityList.map((q) => (
              <RecommendationItem key={q.id} question={q} userAnswer={userAnswers[q.id]} status={q.answerStatus} isDark={isDark} />
          ))}
          
          {priorityList.length === 0 && (
             <div className="text-center py-4 opacity-50 text-sm">Semua jawaban sudah tepat & yakin! 🎉</div>
          )}

          <div className={`mt-4 p-4 rounded-xl border border-dashed ${isDark ? 'bg-gray-700/30 border-gray-600' : 'bg-gray-50 border-gray-300'}`}>
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-bold text-sm uppercase tracking-wide opacity-80">Ringkasan AI</h3>
              <button onClick={handleToggleSummarySpeech} className={`p-1.5 rounded-full transition-all ${isSpeaking ? 'bg-blue-100 text-blue-600 animate-pulse' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'}`} title="Bacakan Ringkasan">
                {isSpeaking ? <SpeakerWaveIcon /> : <SpeakerIcon />}
              </button>
            </div>
            <p className="text-xs sm:text-sm leading-relaxed italic opacity-90">"{summaryText}"</p>
          </div>

          <div className="mt-6 mb-8">
            <button 
              onClick={onRetry} 
              className="w-full py-3 rounded-xl font-bold text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg flex items-center justify-center transform active:scale-95 transition-all"
            >
              <RefreshIcon /> Mulai Kuis Baru
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}

export default Result;