import { useState, useEffect } from 'react';
import axios from 'axios';
import Result from './components/Result';
import LoadingSpinner from './components/LoadingSpinner';
import Question from './components/Question';

// --- URL & Ikon ---
const API_URL = 'http://localhost:5000/api/quiz';

const ArrowRightIcon = () => (
  <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
  </svg>
);

// --- IKON BARU UNTUK START PAGE ---
const HeroIllustration = () => (
  <svg className="w-full h-full text-blue-600" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path fillRule="evenodd" clipRule="evenodd" d="M100 200C155.228 200 200 155.228 200 100C200 44.7715 155.228 0 100 0C44.7715 0 0 44.7715 0 100C0 155.228 44.7715 200 100 200ZM100 180C144.183 180 180 144.183 180 100C180 55.8172 144.183 20 100 20C55.8172 20 20 55.8172 20 100C20 144.183 55.8172 180 100 180Z" fill="url(#paint0_linear)"/>
    <path d="M100 150C127.614 150 150 127.614 150 100C150 72.3858 127.614 50 100 50C72.3858 50 50 72.3858 50 100C50 127.614 72.3858 150 100 150Z" stroke="url(#paint1_linear)" strokeWidth="8"/>
    <path d="M100 130C116.569 130 130 116.569 130 100C130 83.4315 116.569 70 100 70C83.4315 70 70 83.4315 70 100C70 116.569 83.4315 130 100 130Z" stroke="url(#paint2_linear)" strokeWidth="6"/>
    <path d="M100 115C108.284 115 115 108.284 115 100C115 91.7157 108.284 85 100 85C91.7157 85 85 91.7157 85 100C85 108.284 91.7157 115 100 115Z" fill="url(#paint3_linear)"/>
    <defs>
      <linearGradient id="paint0_linear" x1="0" y1="0" x2="200" y2="200" gradientUnits="userSpaceOnUse">
        <stop stopColor="white" stopOpacity="0.1"/>
        <stop offset="1" stopColor="#3B82F6" stopOpacity="0.05"/>
      </linearGradient>
      <linearGradient id="paint1_linear" x1="50" y1="50" x2="150" y2="150" gradientUnits="userSpaceOnUse">
        <stop stopColor="#3B82F6"/>
        <stop offset="1" stopColor="#9333EA"/>
      </linearGradient>
      <linearGradient id="paint2_linear" x1="70" y1="70" x2="130" y2="130" gradientUnits="userSpaceOnUse">
        <stop stopColor="#EC4899"/>
        <stop offset="1" stopColor="#F59E0B"/>
      </linearGradient>
      <linearGradient id="paint3_linear" x1="85" y1="85" x2="115" y2="115" gradientUnits="userSpaceOnUse">
        <stop stopColor="#10B981"/>
        <stop offset="1" stopColor="#3B82F6"/>
      </linearGradient>
    </defs>
  </svg>
);

const FeatureCheckIcon = () => (
  <svg className="w-6 h-6 text-green-500 flex-shrink-0 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);
// --------------------

function App() {
  // --- States (Tidak berubah) ---
  const [quizData, setQuizData] = useState(null);
  const [userAnswers, setUserAnswers] = useState({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [gameStatus, setGameStatus] = useState('idle');
  const [error, setError] = useState(null);
  const [tutorialId, setTutorialId] = useState(null);
  const [userId, setUserId] = useState(null);
  const [confidenceScores, setConfidenceScores] = useState({});

  // --- useEffect & fetchQuizData (Tidak berubah) ---
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tutId = params.get('tutorial_id');
    const uId = params.get('user_id');
    if (!tutId) {
      setError('Error: tutorial_id tidak ditemukan di URL.');
      setGameStatus('error');
      return;
    }
    setTutorialId(tutId);
    setUserId(uId);
  }, []);

  const fetchQuizData = async () => {
    try {
      const response = await axios.get(API_URL, {
        params: { tutorial_id: tutorialId },
      });
      setQuizData(response.data);
      // Muat progres (jika ada)
      const storageKey = `quiz_progress_${userId}_${tutorialId}`;
      const savedAnswers = localStorage.getItem(storageKey);
      if (savedAnswers) setUserAnswers(JSON.parse(savedAnswers));
      
      const confidenceKey = `quiz_confidence_${userId}_${tutorialId}`;
      const savedConfidence = localStorage.getItem(confidenceKey);
      if (savedConfidence) setConfidenceScores(JSON.parse(savedConfidence));
      
      return true;
    } catch (err) {
      console.error(err);
      const errorMsg = err.response?.data?.error || 'Gagal memuat data kuis.';
      setError(`${errorMsg} Pastikan server backend Anda (http://localhost:5000) sudah berjalan dan terhubung ke Gemini.`);
      return false;
    }
  };

  // --- Handlers (Tidak berubah) ---
  const handleStartQuiz = async () => {
    setGameStatus('loading');
    const success = await fetchQuizData();
    if (success) {
      setGameStatus('active');
    } else {
      setGameStatus('error');
    }
  };

  const handleAnswerSubmit = (questionId, selectedOption, confidence) => {
    const newAnswers = { ...userAnswers, [questionId]: selectedOption };
    setUserAnswers(newAnswers);
    if (userId && tutorialId) {
      localStorage.setItem(`quiz_progress_${userId}_${tutorialId}`, JSON.stringify(newAnswers));
    }
    const newConfidence = { ...confidenceScores, [questionId]: confidence };
    setConfidenceScores(newConfidence);
    if (userId && tutorialId) {
      localStorage.setItem(`quiz_confidence_${userId}_${tutorialId}`, JSON.stringify(newConfidence));
    }
  };

  const handleNextQuestion = () => {
    const isLastQuestion = currentQuestionIndex === quizData.questions.length - 1;
    if (isLastQuestion) {
      setGameStatus('submitted');
    } else {
      setCurrentQuestionIndex(prevIndex => prevIndex + 1);
    }
  };

  const handleRetry = () => {
    if (userId && tutorialId) {
      localStorage.removeItem(`quiz_progress_${userId}_${tutorialId}`);
      localStorage.removeItem(`quiz_confidence_${userId}_${tutorialId}`);
    }
    setUserAnswers({});
    setConfidenceScores({});
    setCurrentQuestionIndex(0);
    setGameStatus('idle');
    setQuizData(null);
  };

  // --- RENDER LOGIC ---

  // 1. Tampilan Error
  if (gameStatus === 'error') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4 animate-fade-in">
        <div className="p-8 bg-white shadow-xl rounded-lg max-w-md text-center">
          <h2 className="text-2xl font-bold text-red-600">Terjadi Kesalahan</h2>
          <p className="mt-2 text-gray-700">{error}</p>
        </div>
      </div>
    );
  }

  // 2. Tampilan Loading
  if (gameStatus === 'loading') {
    return <LoadingSpinner />;
  }

  // 3. Tampilan Hasil Kuis (Submitted)
  if (gameStatus === 'submitted') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white to-gray-100 text-gray-800 flex items-center justify-center p-4 animate-fade-in">
        <div className="max-w-4xl w-full"> 
          <Result
            questions={quizData.questions}
            userAnswers={userAnswers}
            confidenceScores={confidenceScores}
            onRetry={handleRetry}
          />
        </div>
      </div>
    );
  }

  // 4. Tampilan Kuis Aktif
  if (gameStatus === 'active') {
    const currentQuestion = quizData.questions[currentQuestionIndex];
    const isAnswered = userAnswers[currentQuestion.id] != null;
    const isLastQuestion = currentQuestionIndex === quizData.questions.length - 1;
    const progressPercentage = ((currentQuestionIndex + 1) / quizData.questions.length) * 100;

    return (
      <div className="min-h-screen bg-gradient-to-br from-white to-gray-100 text-gray-800 animate-fade-in">
        <div className="max-w-4xl mx-auto p-4 sm:p-8">
          
          <header className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">{quizData.materialTitle}</h1>
            <p className="text-sm text-gray-500">
              User: <span className="font-medium text-gray-800">{userId || '...'}</span>
            </p>
          </header>

          <main>
            {/* Progress Bar Visual */}
            <div className="mb-6">
              <p className="text-sm font-medium text-blue-700 mb-2">
                Soal {currentQuestionIndex + 1} dari {quizData.questions.length}
              </p>
              <div className="w-full bg-gray-200 rounded-full h-2.5 shadow-inner overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-blue-600 h-2.5 rounded-full transition-all duration-500 ease-out" 
                  style={{ width: `${progressPercentage}%` }}>
                </div>
              </div>
            </div>

            {/* Komponen Soal */}
            <Question
              key={currentQuestionIndex} 
              question={currentQuestion}
              userAnswer={userAnswers[currentQuestion.id] || null}
              onAnswerSubmit={handleAnswerSubmit}
            />

            {/* Navigasi "Lanjut" */}
            <div className="mt-8 text-right transition-all duration-500 ease-in-out" 
                 style={{ 
                   height: isAnswered ? 'auto' : '0', 
                   opacity: isAnswered ? 1 : 0, 
                   transform: isAnswered ? 'translateY(0)' : 'translateY(10px)',
                 }}>
              {isAnswered && (
                <button
                  onClick={handleNextQuestion}
                  className="inline-flex items-center justify-center font-bold py-3 px-8 rounded-lg text-lg
                             text-white 
                             bg-gradient-to-r from-blue-600 to-blue-700 
                             hover:from-blue-700 hover:to-blue-800
                             shadow-lg hover:shadow-xl
                             transition-all duration-300 ease-in-out focus:outline-none 
                             focus:ring-4 focus:ring-blue-500/50 transform hover:-translate-y-0.5"
                >
                  {isLastQuestion ? 'Lihat Laporan Belajar' : 'Lanjut'}
                  {!isLastQuestion && <ArrowRightIcon />}
                </button>
              )}
            </div>
          </main>
        </div>
      </div>
    );
  }

  // 5. Tampilan Awal (Start Page / Idle) - ROMBAK TOTAL
  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-gray-100 text-gray-800 flex items-center justify-center p-4 lg:p-8 animate-fade-in">
      <div className="max-w-6xl w-full mx-auto bg-white shadow-2xl rounded-2xl overflow-hidden">
        <div className="flex flex-col lg:flex-row">
          
          {/* Kolom Kiri: Teks & Fitur */}
          <div className="w-full lg:w-1/2 p-8 lg:p-16 flex flex-col justify-center">
            <h1 className="text-4xl lg:text-5xl font-extrabold text-gray-900 mb-6 leading-tight">
              Selamat Datang di LearnCheck
            </h1>
            <p className="text-lg text-gray-600 mb-8">
              Kuis formatif ini lebih dari sekadar benar atau salah. Ini adalah alat untuk memahami cara Anda belajar, didukung oleh AI.
            </p>
            
            {/* Daftar Fitur (NILAI TAMBAH) */}
            <ul className="space-y-4 mb-10">
              <li className="flex items-center">
                <FeatureCheckIcon />
                <span className="text-gray-700">Soal <span className="font-semibold">dibuat oleh AI</span> khusus untuk materi ini.</span>
              </li>
              <li className="flex items-center">
                <FeatureCheckIcon />
                <span className="text-gray-700">Analisis <span className="font-semibold">Topik & Keyakinan Diri</span> secara *real-time*.</span>
              </li>
              <li className="flex items-center">
                <FeatureCheckIcon />
                <span className="text-gray-700">Laporan <span className="font-semibold">Metakognitif</span> untuk tahu area kelemahan Anda.</span>
              </li>
            </ul>

            {/* Info User & Tombol Mulai */}
            <div className="bg-gray-50 p-6 rounded-lg mb-8 border border-gray-200">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-gray-500">Materi Anda</p>
                  <p className="font-semibold text-gray-800">{tutorialId || '...'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">User Anda</p>
                  <p className="font-semibold text-gray-800">{userId || '...'}</p>
                </div>
              </div>
            </div>
            
            <button
              onClick={handleStartQuiz}
              disabled={!tutorialId || !userId}
              className={`w-full inline-flex items-center justify-center font-bold py-4 px-8 rounded-lg text-lg
                          transition-all duration-300 ease-in-out focus:outline-none
                          disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed disabled:shadow-none
                          bg-gradient-to-r from-blue-600 to-blue-700 
                          text-white 
                          hover:from-blue-700 hover:to-blue-800
                          shadow-lg
                          transform hover:-translate-y-1
                          ${!tutorialId || !userId ? '' : 'animate-subtle-glow'}`}
            >
              {(!tutorialId || !userId) ? 'Mendeteksi URL...' : 'Mulai LearnCheck'}
            </button>
            
          </div>
          
          {/* Kolom Kanan: Ilustrasi */}
          <div className="w-full lg:w-1/2 bg-gradient-to-r from-blue-50 to-indigo-100 p-8 lg:p-12 flex items-center justify-center min-h-[300px] lg:min-h-0">
            <HeroIllustration />
          </div>

        </div>
      </div>
    </div>
  );
}

export default App;