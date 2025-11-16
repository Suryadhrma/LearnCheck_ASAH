import React from 'react';

// --- Ikon SVG ---
const RetryIcon = () => (
  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h5M20 19v-5h-5M2 12c0-4.97 4.03-9 9-9s9 4.03 9 9-4.03 9-9 9S2 16.97 2 12z" />
  </svg>
);

// --- 4 Ikon Kuadran ---
const IconBenarYakin = () => (
  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m12.728 0l-.707.707M12 21v-1m-6.364-1.636l.707-.707M6.343 6.343l.707.707m12.728 0l.707.707M12 5a7 7 0 100 14 7 7 0 000-14z" /></svg>
);
const IconBenarRagu = () => (
  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
);
const IconSalahYakin = () => (
  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
);
const IconSalahRagu = () => (
  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
);

// --- Komponen Kotak Kuadran ---
const QuadrantBox = ({ title, count, description, icon, colorClass }) => (
  <div className={`p-6 rounded-xl border-l-8 shadow-md ${colorClass}`}>
    <div className="flex items-center justify-between">
      <h3 className="text-xl font-bold">{title}</h3>
      {icon}
    </div>
    <p className="text-4xl font-extrabold my-2">{count} <span className="text-lg font-normal">soal</span></p>
    <p className="text-sm text-gray-600">{description}</p>
  </div>
);

// --- KOMPONEN BARU: Item Rekomendasi Belajar ---
const RecommendationItem = ({ question, userAnswer, type }) => {
  const isCritical = type === 'critical';
  const colorClass = isCritical ? 'border-red-500' : 'border-yellow-500';
  const bgColor = isCritical ? 'bg-red-50' : 'bg-yellow-50';
  const textColor = isCritical ? 'text-red-800' : 'text-yellow-800';

  return (
    <div className={`p-5 rounded-lg border-l-4 ${colorClass} ${bgColor} shadow-sm`}>
      <p className={`font-semibold ${textColor} mb-1`}>
        {isCritical ? "Fokus Kritis (Salah & Yakin):" : "Perlu Penguatan (Benar & Ragu):"}
      </p>
      <p className="text-lg font-semibold text-gray-800 my-2">{question.question}</p>
      
      {isCritical && (
         <p className="text-sm text-red-700 font-medium">
          Jawaban Anda (Salah): {userAnswer}
        </p>
      )}
      {!isCritical && userAnswer && (
        <p className="text-sm text-gray-500 line-through">
          Jawaban Anda (Benar, tapi ragu): {userAnswer}
        </p>
      )}
      <p className="text-sm text-green-700 font-medium">
        Jawaban Benar: {question.answer}
      </p>
      
      <p className="text-sm text-gray-600 mt-2">
        <span className="font-semibold">Penjelasan:</span> {question.explanation}
      </p>
    </div>
  );
};

// --- KOMPONEN BARU: Bar Analisis Topik ---
const TopicAnalysisBar = ({ topic, correct, total }) => {
  const percentage = (correct / total) * 100;
  let bgColor = "bg-green-500";
  if (percentage < 40) bgColor = "bg-red-500";
  else if (percentage < 70) bgColor = "bg-yellow-500";

  return (
    <div>
      <div className="flex justify-between mb-1">
        <span className="text-base font-medium text-gray-700">{topic}</span>
        <span className="text-sm font-medium text-gray-700">{correct} / {total}</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2.5 shadow-inner">
        <div 
          className={`h-2.5 rounded-full transition-all duration-500 ${bgColor}`} 
          style={{ width: `${percentage}%` }}>
        </div>
      </div>
    </div>
  );
};


// --- Komponen Utama Result ---
function Result({ questions, userAnswers, confidenceScores, onRetry }) {
  
  // --- Kalkulasi Skor ---
  let score = 0;
  let totalConfidenceSum = 0;
  
  const buckets = {
    benarYakin: [],
    benarRagu: [],
    salahYakin: [],
    salahRagu: []
  };
  
  const topicAnalysis = {}; 

  questions.forEach(q => {
    const isCorrect = userAnswers[q.id] === q.answer;
    const confidence = confidenceScores[q.id] || 0.5;
    totalConfidenceSum += confidence;
    const topic = q.topic || "Lain-lain";

    if (!topicAnalysis[topic]) {
      topicAnalysis[topic] = { correct: 0, total: 0 };
    }
    topicAnalysis[topic].total++;

    if (isCorrect) {
      score++;
      topicAnalysis[topic].correct++;
      if (confidence === 1.0) buckets.benarYakin.push(q);
      else buckets.benarRagu.push(q);
    } else {
      if (confidence === 1.0) buckets.salahYakin.push(q);
      else buckets.salahRagu.push(q);
    }
  });

  const totalQuestions = questions.length;
  const scorePercentage = (score / totalQuestions) * 100;
  const avgConfidence = (totalConfidenceSum / totalQuestions) * 100;

  // Daftar Belajar yang Dipersonalisasi
  const priorityList = [
    ...buckets.salahYakin.map(q => ({ ...q, type: 'critical' })),
    ...buckets.benarRagu.map(q => ({ ...q, type: 'review' }))
  ];

  return (
    <div className="w-full bg-white shadow-2xl rounded-xl p-8 sm:p-12">
      
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Laporan Belajar Anda
        </h1>
        <p className="text-lg text-gray-600 mb-10">
          Berikut adalah analisis lengkap pemahaman dan kesadaran diri Anda.
        </p>
      </div>
      
      {/* --- BAGIAN 1: SKOR UTAMA --- */}
      <div className="flex flex-col md:flex-row gap-4 mb-10">
        <div className="flex-1 bg-gradient-to-r from-blue-500 to-blue-700 text-white p-6 rounded-xl shadow-lg ring-4 ring-blue-500/20">
          <p className="text-sm font-medium uppercase tracking-wider text-blue-200">Skor Anda</p>
          <p className="text-5xl font-extrabold my-2">
            {scorePercentage.toFixed(0)}%
          </p>
          <p className="text-sm text-blue-100">
            {score} / {totalQuestions} benar
          </p>
        </div>
        <div className="flex-1 bg-white text-gray-800 p-6 rounded-xl shadow-lg border border-gray-200">
          <p className="text-sm font-medium uppercase tracking-wider text-gray-500">Keyakinan Rerata</p>
          <p className="text-5xl font-extrabold my-2">
            {avgConfidence.toFixed(0)}%
          </p>
          <p className="text-sm text-gray-600">
            Tingkat keyakinan Anda
          </p>
        </div>
      </div>

      {/* --- BAGIAN 2: ANALISIS TOPIK (NILAI TAMBAH BARU) --- */}
      <div className="mb-10">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Analisis per Topik</h2>
        <div className="space-y-4 p-6 bg-gray-50 rounded-lg shadow-inner border border-gray-200">
          {Object.entries(topicAnalysis).map(([topic, data]) => (
            <TopicAnalysisBar 
              key={topic}
              topic={topic}
              correct={data.correct}
              total={data.total}
            />
          ))}
        </div>
      </div>

      {/* --- BAGIAN 3: ANALISIS METAKOGNITIF (MATRIKS 2x2) --- */}
      <div className="mb-10">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-900">Analisis Metakognitif</h2>
          {priorityList.length > 0 && (
            <a href="#rekomendasi"
               className="text-sm font-medium text-blue-600 hover:text-blue-800 transition-all mt-2 sm:mt-0">
              Lihat Rekomendasi Belajar &darr;
            </a>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <QuadrantBox
            title="Pemahaman Penuh"
            count={buckets.benarYakin.length}
            description="Anda menjawab benar dan Anda yakin. Area ini sudah Anda kuasai!"
            icon={<IconBenarYakin />}
            colorClass="bg-green-50 border-green-500 text-green-800"
          />
          <QuadrantBox
            title="Tebakan Beruntung"
            count={buckets.benarRagu.length}
            description="Anda menjawab benar, tetapi Anda ragu-ragu. Tinjau kembali agar lebih yakin."
            icon={<IconBenarRagu />}
            colorClass="bg-yellow-50 border-yellow-500 text-yellow-800"
          />
          <QuadrantBox
            title="Kesalahpahaman Serius"
            count={buckets.salahYakin.length}
            description="Anda menjawab salah, tapi Anda yakin. Ini adalah area paling kritis untuk dipelajari kembali!"
            icon={<IconSalahYakin />}
            colorClass="bg-red-50 border-red-500 text-red-800"
          />
          <QuadrantBox
            title="Sadar Diri"
            count={buckets.salahRagu.length}
            description="Anda menjawab salah dan Anda sadar bahwa Anda ragu. Anda sudah tahu apa yang tidak Anda ketahui."
            icon={<IconSalahRagu />}
            colorClass="bg-blue-50 border-blue-500 text-blue-800"
          />
        </div>
      </div>

      {/* --- BAGIAN 4: REKOMENDASI BELAJAR (NILAI TAMBAH) --- */}
      {priorityList.length > 0 && (
        <div id="rekomendasi" className="mb-10 animate-fade-in">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Rekomendasi Belajar Anda</h2>
          <p className="text-gray-600 mb-4">
            Fokuskan waktu belajar Anda pada soal-soal di bawah ini, dimulai dari kesalahpahaman yang paling kritis.
          </p>
          <div className="space-y-4">
            {priorityList.map(q => (
              <RecommendationItem 
                key={q.id}
                question={q}
                userAnswer={userAnswers[q.id]}
                type={q.type}
              />
            ))}
          </div>
        </div>
      )}
      
      {/* Tombol Coba Lagi */}
      <div className="pt-8 border-t border-gray-200">
        <button
          onClick={onRetry}
          className="w-full inline-flex items-center justify-center font-bold py-3 px-6 rounded-lg text-lg
                      bg-gradient-to-r from-gray-600 to-gray-700 
                      text-white 
                      hover:from-gray-700 hover:to-gray-800
                      shadow-lg hover:shadow-xl
                      transition-all duration-300 ease-in-out focus:outline-none 
                      focus:ring-4 focus:ring-gray-500/50 transform hover:-translate-y-0.5"
        >
          <RetryIcon />
          Mulai Kuis Baru
        </button>
      </div>
    </div>
  );
}

export default Result;