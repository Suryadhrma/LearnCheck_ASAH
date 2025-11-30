import React from 'react';

// Fungsi Helper Status yang sama
const getAnswerStatus = (userAnswer, correctAnswer) => {
  if (!userAnswer || userAnswer.length === 0) return 'wrong';
  const correctPicks = userAnswer.filter(ans => correctAnswer.includes(ans));
  const wrongPicks = userAnswer.filter(ans => !correctAnswer.includes(ans));
  if (correctPicks.length === correctAnswer.length && wrongPicks.length === 0) return 'correct';
  if (correctPicks.length === 0) return 'wrong';
  return 'partial';
};

const RefreshIcon = () => (
  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
  </svg>
);

// Ikon & Kotak Matriks (Tetap sama, hanya logika pemanggilan di bawah berubah)
const IconBenarYakin = () => <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m12.728 0l-.707.707M12 21v-1m-6.364-1.636l.707-.707M6.343 6.343l.707.707m12.728 0l.707.707M12 5a7 7 0 100 14 7 7 0 000-14z" /></svg>;
const IconBenarRagu = () => <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const IconSalahYakin = () => <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>;
const IconSalahRagu = () => <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>;

const QuadrantBox = ({ title, count, description, icon, colorClass, isDark }) => (
  <div className={`p-6 rounded-xl border-l-8 shadow-md transition-transform hover:scale-[1.02] duration-300
                  ${colorClass} ${isDark ? 'bg-gray-700 text-gray-100' : 'bg-white text-gray-900'}`}>
    <div className="flex items-center justify-between mb-2">
      <h3 className="text-xl font-bold">{title}</h3>
      <div className={`${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{icon}</div>
    </div>
    <p className="text-4xl font-extrabold my-2">{count} <span className="text-lg font-normal opacity-70">soal</span></p>
    <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{description}</p>
  </div>
);

const TopicAnalysisBar = ({ topic, correct, total, isDark }) => {
  const percentage = total > 0 ? (correct / total) * 100 : 0;
  let color = "bg-green-500";
  if (percentage < 40) color = "bg-red-500";
  else if (percentage < 70) color = "bg-yellow-500";

  return (
    <div>
      <div className="flex justify-between mb-1">
        <span className={`text-base font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>{topic}</span>
        <span className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{correct} / {total}</span>
      </div>
      <div className={`w-full rounded-full h-3 shadow-inner overflow-hidden ${isDark ? 'bg-gray-600' : 'bg-gray-200'}`}>
        <div className={`h-3 rounded-full transition-all duration-1000 ease-out ${color}`} style={{ width: `${percentage}%` }}></div>
      </div>
    </div>
  );
};

const RecommendationItem = ({ question, userAnswer, status, isDark }) => {
  // Logic warna berdasarkan status (termasuk Partial)
  let borderColor, bgClass, titleColor, titleText;
  
  if (status === 'wrong') {
    borderColor = 'border-red-500';
    bgClass = isDark ? 'bg-red-900/20' : 'bg-red-50';
    titleColor = 'text-red-600 dark:text-red-400';
    titleText = "⚠️ Fokus Kritis (Jawaban Salah)";
  } else if (status === 'partial') {
    borderColor = 'border-orange-500'; // Oranye untuk Partial
    bgClass = isDark ? 'bg-orange-900/20' : 'bg-orange-50';
    titleColor = 'text-orange-600 dark:text-orange-400';
    titleText = "🚧 Kurang Tepat (Perlu Dilengkapi)";
  } else {
    // Review (Benar tapi Ragu)
    borderColor = 'border-yellow-500';
    bgClass = isDark ? 'bg-yellow-900/20' : 'bg-yellow-50';
    titleColor = 'text-yellow-600 dark:text-yellow-400';
    titleText = "💡 Perlu Penguatan (Benar & Ragu)";
  }

  const textColor = isDark ? 'text-gray-200' : 'text-gray-800';
  const formattedUserAnswer = Array.isArray(userAnswer) ? userAnswer.join(', ') : userAnswer;
  const formattedCorrectAnswer = Array.isArray(question.answer) ? question.answer.join(', ') : question.answer;

  return (
    <div className={`p-5 rounded-lg border-l-4 shadow-sm mb-4 ${borderColor} ${bgClass}`}>
      <p className={`font-bold mb-2 uppercase text-xs tracking-wider ${titleColor}`}>
        {titleText}
      </p>
      <p className={`text-lg font-semibold mb-3 ${textColor}`}>{question.question}</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
        <div className={`p-3 rounded ${isDark ? 'bg-gray-800 text-gray-200' : 'bg-white text-gray-800'} border border-gray-200 dark:border-gray-700`}>
          <span className="font-bold block text-xs uppercase mb-1 opacity-70">Jawaban Anda:</span>
          {formattedUserAnswer || "(Tidak menjawab)"}
        </div>
        <div className="p-3 bg-green-100 dark:bg-green-900/40 rounded text-green-800 dark:text-green-200">
          <span className="font-bold block text-xs uppercase mb-1">Jawaban Benar:</span>
          {formattedCorrectAnswer}
        </div>
      </div>
      
      <p className={`text-sm mt-3 pt-3 border-t ${isDark ? 'border-gray-600 text-gray-400' : 'border-gray-200 text-gray-600'}`}>
        <span className="font-semibold">Penjelasan:</span> {question.explanation}
      </p>
    </div>
  );
};

function Result({ questions, userAnswers, confidenceScores, onRetry, isDark }) {
  let score = 0;
  let totalConfidenceSum = 0;
  const buckets = { benarYakin: [], benarRagu: [], partial: [], salah: [] }; // Bucket baru untuk Partial
  const topicAnalysis = {}; 

  questions.forEach(q => {
    const uAnswer = userAnswers[q.id];
    const status = getAnswerStatus(uAnswer, q.answer);
    
    const confidence = confidenceScores[q.id] || 0.5;
    totalConfidenceSum += confidence;
    const topic = q.topic || "Umum";
    if (!topicAnalysis[topic]) topicAnalysis[topic] = { correct: 0, total: 0 };
    topicAnalysis[topic].total++;

    if (status === 'correct') {
      score += 1; // Poin penuh
      topicAnalysis[topic].correct++;
      if (confidence === 1.0) buckets.benarYakin.push(q);
      else buckets.benarRagu.push(q);
    } else if (status === 'partial') {
      score += 0.5; // Poin setengah untuk partial
      buckets.partial.push(q); // Masuk bucket partial
    } else {
      buckets.salah.push(q); // Salah total
    }
  });

  const totalQuestions = questions.length;
  const scorePercentage = (score / totalQuestions) * 100;
  const avgConfidence = (totalConfidenceSum / totalQuestions) * 100;

  // List rekomendasi sekarang mencakup Salah Total, Kurang Tepat, dan Benar tapi Ragu
  const priorityList = [
    ...buckets.salah.map(q => ({ ...q, answerStatus: 'wrong' })),
    ...buckets.partial.map(q => ({ ...q, answerStatus: 'partial' })),
    ...buckets.benarRagu.map(q => ({ ...q, answerStatus: 'review' }))
  ];

  return (
    <div className={`w-full shadow-2xl rounded-2xl p-8 sm:p-12 animate-fade-in ${isDark ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'}`}>
      <div className="text-center mb-12">
        <h1 className="text-4xl font-extrabold mb-4">Laporan Belajar Cerdas</h1>
        <p className={`text-lg ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Analisis komprehensif hasil belajar Anda.</p>
      </div>
      
      <div className="flex flex-col md:flex-row gap-6 mb-12">
        <div className="flex-1 bg-gradient-to-br from-blue-600 to-blue-800 text-white p-8 rounded-2xl shadow-xl">
          <p className="text-sm font-bold uppercase text-blue-200">Skor Akhir</p>
          <p className="text-6xl font-black">{scorePercentage.toFixed(0)}%</p>
        </div>
        <div className={`flex-1 p-8 rounded-2xl shadow-xl border ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
          <p className="text-sm font-bold uppercase opacity-70">Keyakinan Rerata</p>
          <p className="text-6xl font-black">{avgConfidence.toFixed(0)}%</p>
        </div>
      </div>

      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Matriks Metakognitif</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <QuadrantBox title="Pemahaman Penuh" count={buckets.benarYakin.length} description="Benar & Yakin." icon={<IconBenarYakin />} colorClass="border-green-500" isDark={isDark} />
          <QuadrantBox title="Tebakan Beruntung" count={buckets.benarRagu.length} description="Benar tapi Ragu." icon={<IconBenarRagu />} colorClass="border-yellow-500" isDark={isDark} />
          {/* Ubah kotak ketiga untuk menangani Partial / Salah */}
          <QuadrantBox title="Kurang Tepat" count={buckets.partial.length} description="Benar sebagian." icon={<WarningIcon />} colorClass="border-orange-500" isDark={isDark} /> 
          <QuadrantBox title="Perlu Belajar" count={buckets.salah.length} description="Salah Total." icon={<IconSalahYakin />} colorClass="border-red-500" isDark={isDark} />
        </div>
      </div>

      {priorityList.length > 0 && (
        <div className="mb-12 animate-fade-in">
          <h2 className="text-2xl font-bold mb-6 text-red-500">🎯 Rekomendasi Belajar</h2>
          <div className="space-y-4">
            {priorityList.map(q => <RecommendationItem key={q.id} question={q} userAnswer={userAnswers[q.id]} status={q.answerStatus} isDark={isDark} />)}
          </div>
        </div>
      )}

      <div className={`pt-8 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
        <button onClick={onRetry} className="w-full py-4 rounded-xl font-bold text-lg text-white bg-gradient-to-r from-gray-700 to-gray-900 hover:to-black shadow-lg flex items-center justify-center">
          <RefreshIcon /> <span className="ml-2">Mulai Kuis Baru</span>
        </button>
      </div>
    </div>
  );
}

// Icon Warning untuk Result
const WarningIcon = () => <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>;

export default Result;