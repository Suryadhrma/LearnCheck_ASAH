import { useState, useEffect } from 'react';
import axios from 'axios';
import Result from './components/Result';
import LoadingSpinner from './components/LoadingSpinner';
import Question from './components/Question';

const API_URL = 'http://localhost:5000/api';

// --- IKON-IKON (Sesuai Screenshot Dicoding) ---
const SunIcon = () => (
  <svg className="w-5 h-5 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
);
const MoonIcon = () => (
  <svg className="w-5 h-5 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
);
const ArrowRightIcon = () => (
  <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
);
const FeatureCheckIcon = () => (
  <svg className="w-6 h-6 text-green-500 flex-shrink-0 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
);

// Ilustrasi Hero
const HeroIllustration = () => (
  <svg className="w-full h-full text-blue-600 drop-shadow-xl" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="100" cy="100" r="90" fill="url(#grad1)" fillOpacity="0.1" />
    <path d="M60 140L100 60L140 140H60Z" fill="url(#grad2)" />
    <circle cx="100" cy="90" r="20" fill="white" />
    <path d="M90 90L100 110L110 90" stroke="#3B82F6" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
    <defs>
      <linearGradient id="grad1" x1="0" y1="0" x2="200" y2="200"><stop offset="0%" stopColor="#3B82F6"/><stop offset="100%" stopColor="#9333EA"/></linearGradient>
      <linearGradient id="grad2" x1="60" y1="140" x2="140" y2="60"><stop offset="0%" stopColor="#3B82F6"/><stop offset="100%" stopColor="#2563EB"/></linearGradient>
    </defs>
  </svg>
);

function App() {
  const [quizData, setQuizData] = useState(null);
  const [preferences, setPreferences] = useState({ theme: 'light', fontSize: 'medium' });
  const [userAnswers, setUserAnswers] = useState({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [gameStatus, setGameStatus] = useState('idle');
  const [error, setError] = useState(null);
  const [tutorialId, setTutorialId] = useState(null);
  const [userId, setUserId] = useState(null);
  const [confidenceScores, setConfidenceScores] = useState({});
  const [initLoading, setInitLoading] = useState(true); // Loading awal hanya untuk preferensi

  // 1. FASE INISIALISASI (Ambil URL -> Ambil Preferensi LANGSUNG)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tutId = params.get('tutorial_id');
    const uId = params.get('user_id');

    if (!tutId) {
      setError('Error: tutorial_id tidak ditemukan di URL.');
      setGameStatus('error');
      setInitLoading(false);
      return;
    }

    setTutorialId(tutId);
    setUserId(uId);

    // Langsung fetch preferensi begitu ID didapat
    if (uId) {
      axios.get(`${API_URL}/preferences`, { params: { user_id: uId } })
        .then(res => {
          if (res.data) setPreferences(res.data);
        })
        .catch(err => console.warn("Gagal load preferensi awal", err))
        .finally(() => setInitLoading(false));
    } else {
      setInitLoading(false);
    }
  }, []);

  // 2. FASE MULAI KUIS (Ambil Soal AI - Berat)
  const handleStartQuiz = async () => {
    setGameStatus('loading');
    try {
      const response = await axios.get(`${API_URL}/quiz`, {
        params: { tutorial_id: tutorialId },
      });
      setQuizData(response.data);
      
      // Load progress jika ada
      const storageKey = `quiz_progress_${userId}_${tutorialId}`;
      const savedAnswers = localStorage.getItem(storageKey);
      if (savedAnswers) setUserAnswers(JSON.parse(savedAnswers));
      
      setGameStatus('active');
    } catch (err) {
      console.error(err);
      setError('Gagal memuat data kuis dari AI.');
      setGameStatus('error');
    }
  };

  const handleAnswerSubmit = (questionId, selectedOption, confidence) => {
    const newAnswers = { ...userAnswers, [questionId]: selectedOption };
    setUserAnswers(newAnswers);
    if (userId && tutorialId) localStorage.setItem(`quiz_progress_${userId}_${tutorialId}`, JSON.stringify(newAnswers));
    const newConfidence = { ...confidenceScores, [questionId]: confidence };
    setConfidenceScores(newConfidence);
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex === quizData.questions.length - 1) setGameStatus('submitted');
    else setCurrentQuestionIndex(prev => prev + 1);
  };

  const handleRetry = () => {
    if (userId && tutorialId) localStorage.removeItem(`quiz_progress_${userId}_${tutorialId}`);
    setUserAnswers({});
    setConfidenceScores({});
    setCurrentQuestionIndex(0);
    setGameStatus('idle');
    setQuizData(null);
  };

  // --- LOGIKA TEMA & FONT ---
  const isDark = preferences.theme === 'dark';
  const themeClass = isDark ? 'dark' : '';
  const fontSizeClass = {
    'small': 'text-sm',
    'medium': 'text-base',
    'large': 'text-lg',
    'extra-large': 'text-xl'
  }[preferences.fontSize] || 'text-base';

  const wrapperClasses = `min-h-screen transition-colors duration-300 ${themeClass} ${fontSizeClass} 
    ${isDark ? 'bg-gray-900 text-gray-100' : 'bg-gradient-to-br from-white to-gray-100 text-gray-800'}`;

  // --- RENDER ---

  if (initLoading) return <div className="min-h-screen bg-white"></div>; // Blank putih sebentar saat ambil preferensi

  if (gameStatus === 'error') {
    return (
      <div className={wrapperClasses + " flex items-center justify-center p-4"}>
        <div className="p-8 bg-white dark:bg-gray-800 shadow-xl rounded-lg max-w-md text-center">
          <h2 className="text-2xl font-bold text-red-600">Terjadi Kesalahan</h2>
          <p className="mt-2">{error}</p>
        </div>
      </div>
    );
  }

  if (gameStatus === 'loading') return <LoadingSpinner isDark={isDark} />;

  if (gameStatus === 'submitted') {
    return (
      <div className={wrapperClasses + " flex items-center justify-center p-4 animate-fade-in"}>
        <div className="max-w-4xl w-full"> 
          <Result
            questions={quizData.questions}
            userAnswers={userAnswers}
            confidenceScores={confidenceScores}
            onRetry={handleRetry}
            isDark={isDark}
          />
        </div>
      </div>
    );
  }

  if (gameStatus === 'active') {
    const currentQuestion = quizData.questions[currentQuestionIndex];
    const isAnswered = userAnswers[currentQuestion.id] != null;
    const isLastQuestion = currentQuestionIndex === quizData.questions.length - 1;
    const progressPercentage = ((currentQuestionIndex + 1) / quizData.questions.length) * 100;

    return (
      <div className={wrapperClasses + " animate-fade-in"}>
        <div className="max-w-4xl mx-auto p-4 sm:p-8">
          <header className="mb-6 flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold">{quizData.materialTitle}</h1>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>User: {userId}</p>
            </div>
            {/* Indikator Mode Aktif */}
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border ${isDark ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'}`}>
              {isDark ? <MoonIcon /> : <SunIcon />}
              <span className="text-xs font-semibold uppercase">{preferences.theme}</span>
            </div>
          </header>

          <main>
            <div className="mb-6">
              <p className={`text-sm font-medium mb-2 ${isDark ? 'text-blue-400' : 'text-blue-700'}`}>
                Soal {currentQuestionIndex + 1} dari {quizData.questions.length}
              </p>
              <div className={`w-full rounded-full h-2.5 shadow-inner overflow-hidden ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}>
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 h-2.5 rounded-full transition-all duration-500 ease-out" 
                     style={{ width: `${progressPercentage}%` }}></div>
              </div>
            </div>

            <Question
              key={currentQuestionIndex} 
              question={currentQuestion}
              userAnswer={userAnswers[currentQuestion.id] || null}
              onAnswerSubmit={handleAnswerSubmit}
              isDark={isDark}
            />

            <div className="mt-8 text-right transition-all duration-500" 
                 style={{ opacity: isAnswered ? 1 : 0, transform: isAnswered ? 'translateY(0)' : 'translateY(10px)' }}>
              {isAnswered && (
                <button
                  onClick={handleNextQuestion}
                  className="inline-flex items-center justify-center font-bold py-3 px-8 rounded-lg text-lg text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg transform hover:-translate-y-0.5 transition-all"
                >
                  {isLastQuestion ? 'Lihat Laporan' : 'Lanjut'}
                  {!isLastQuestion && <ArrowRightIcon />}
                </button>
              )}
            </div>
          </main>
        </div>
      </div>
    );
  }

  // --- START PAGE ---
  return (
    <div className={wrapperClasses + " flex items-center justify-center p-4 lg:p-8 animate-fade-in"}>
      <div className={`max-w-6xl w-full mx-auto shadow-2xl rounded-2xl overflow-hidden ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
        <div className="flex flex-col lg:flex-row">
          <div className="w-full lg:w-1/2 p-8 lg:p-16 flex flex-col justify-center">
            
            {/* Header dengan Status Preferensi */}
            <div className="flex items-center gap-3 mb-6">
              <span className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-2
                ${isDark ? 'bg-gray-700 border-gray-600 text-blue-300' : 'bg-blue-50 border-blue-100 text-blue-600'}`}>
                {isDark ? <MoonIcon /> : <SunIcon />}
                Mode: {preferences.theme === 'dark' ? 'Dark' : 'Light'}
              </span>
              <span className={`px-3 py-1 rounded-full text-xs font-bold border
                ${isDark ? 'bg-gray-700 border-gray-600 text-gray-300' : 'bg-gray-50 border-gray-200 text-gray-600'}`}>
                Size: {preferences.fontSize}
              </span>
            </div>

            <h1 className="text-4xl lg:text-5xl font-extrabold mb-6 leading-tight">
              Laporan Belajar Cerdas
            </h1>
            <p className={`text-lg mb-8 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              Kuis adaptif dengan analisis Metakognitif & AI (Mode {preferences.theme} aktif).
            </p>
            <ul className="space-y-4 mb-10">
              <li className="flex items-center"><FeatureCheckIcon /> <span>Soal AI Otomatis</span></li>
              <li className="flex items-center"><FeatureCheckIcon /> <span>Analisis Keyakinan Diri</span></li>
              <li className="flex items-center"><FeatureCheckIcon /> <span>Rekomendasi Personal</span></li>
            </ul>
            <button
              onClick={handleStartQuiz}
              disabled={!tutorialId || !userId}
              className={`w-full py-4 px-8 rounded-lg text-lg font-bold text-white shadow-lg transition-all transform hover:-translate-y-1
                ${(!tutorialId || !userId) ? 'bg-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 animate-subtle-glow'}`}
            >
              {(!tutorialId || !userId) ? 'Mendeteksi URL...' : 'Mulai Laporan Belajar'}
            </button>
          </div>
          <div className="w-full lg:w-1/2 bg-gradient-to-r from-blue-50 to-indigo-100 dark:from-gray-700 dark:to-gray-800 p-8 lg:p-12 flex items-center justify-center">
            <HeroIllustration />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;