import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import Result from './components/Result';
import LoadingSpinner from './components/LoadingSpinner';
import Question from './components/Question';
import UserPreferencesButton from './components/UserPreferencesButton';
import HistoryChart from './components/HistoryChart';

const API_URL = 'http://localhost:5000/api';

// --- ICONS SVG ---
const SunIcon = () => (<svg className="w-4 h-4 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>);
const MoonIcon = () => (<svg className="w-4 h-4 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>);
const ArrowRightIcon = () => (<svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>);
const FeatureCheckIcon = () => (<svg className="w-4 h-4 text-green-500 flex-shrink-0 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>);
const ShieldCheckIcon = () => (<svg className="w-3 h-3 mr-1 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>);
const LevelIcon = () => <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>;
const ChartIcon = () => <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>;

// const HeroIllustration = () => (
//   <svg className="w-full h-full text-blue-600 drop-shadow-lg" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
//     <circle cx="100" cy="100" r="80" fill="url(#grad1)" fillOpacity="0.1" />
//     <path d="M70 130L100 70L130 130H70Z" fill="url(#grad2)" />
//     <defs>
//       <linearGradient id="grad1" x1="0" y1="0" x2="200" y2="200"><stop offset="0%" stopColor="#3B82F6"/><stop offset="100%" stopColor="#9333EA"/></linearGradient>
//       <linearGradient id="grad2" x1="70" y1="130" x2="130" y2="70"><stop offset="0%" stopColor="#3B82F6"/><stop offset="100%" stopColor="#2563EB"/></linearGradient>
//     </defs>
//   </svg>
// );

function App() {
  // --- STATE MANAGEMENT ---
  const [quizData, setQuizData] = useState(null);
  const [preferences, setPreferences] = useState({ theme: 'light', fontSize: 'medium' });
  const [userAnswers, setUserAnswers] = useState({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [gameStatus, setGameStatus] = useState('idle'); // idle, loading, active, submitted
  const [error, setError] = useState(null);
  const [tutorialId, setTutorialId] = useState(null);
  const [userId, setUserId] = useState(null);
  const [confidenceScores, setConfidenceScores] = useState({});
  const [initLoading, setInitLoading] = useState(true);
  const [difficulty, setDifficulty] = useState('medium'); 
  const [history, setHistory] = useState([]);
  const [showModal, setShowModal] = useState(false);

  // --- INITIALIZATION & SESSION RESTORE ---
  useEffect(() => {
    // Timeout safeguard
    const timeout = setTimeout(() => setInitLoading(false), 5000);

    const params = new URLSearchParams(window.location.search);
    // Gunakan default 'react-basic' dan 'dev-user' jika URL params kosong (untuk dev mode)
    const tutId = params.get('tutorial_id') || 'react-basic';
    const uId = params.get('user_id') || '1'; // Default User 1

    setTutorialId(tutId);
    setUserId(uId);

    // --- LOGIC RESTORE SESSION (FITUR BARU) ---
    const sessionKey = `quiz_session_${uId}_${tutId}`;
    const savedSession = localStorage.getItem(sessionKey);

    if (savedSession) {
        // Jika ada sesi tersimpan, muat kembali
        try {
            const parsedSession = JSON.parse(savedSession);
            setQuizData(parsedSession.quizData);
            setUserAnswers(parsedSession.userAnswers);
            setConfidenceScores(parsedSession.confidenceScores);
            setCurrentQuestionIndex(parsedSession.currentQuestionIndex);
            setDifficulty(parsedSession.difficulty);
            setGameStatus(parsedSession.gameStatus); // Bisa 'active' atau 'submitted'
            
            // Fetch pref saja (background process)
            axios.get(`${API_URL}/preferences`, { params: { user_id: uId } })
                .then(res => { if(res.data) setPreferences(res.data); })
                .catch(console.warn)
                .finally(() => setInitLoading(false));
            
            clearTimeout(timeout);
            return; // Selesai, jangan jalankan fetch default
        } catch (e) {
            console.error("Gagal restore sesi, reset...", e);
            localStorage.removeItem(sessionKey);
        }
    }

    // Jika tidak ada sesi tersimpan, load default state (Preferences & History)
    axios.get(`${API_URL}/preferences`, { params: { user_id: uId } })
      .then(res => { if (res.data) setPreferences(res.data); })
      .catch(err => console.warn("Gagal load preferensi", err))
      .finally(() => {
          setInitLoading(false);
          clearTimeout(timeout);
      });
    
    return () => clearTimeout(timeout);
  }, []);

  // --- AUTO SAVE SESSION ---
  // Setiap kali ada perubahan state penting, simpan ke localStorage
  useEffect(() => {
    if (!userId || !tutorialId) return;
    
    // Jangan simpan jika status idle atau loading (hanya simpan progres aktif/hasil)
    if (gameStatus === 'active' || gameStatus === 'submitted') {
        const sessionKey = `quiz_session_${userId}_${tutorialId}`;
        const sessionData = {
            quizData,
            userAnswers,
            confidenceScores,
            currentQuestionIndex,
            gameStatus,
            difficulty
        };
        localStorage.setItem(sessionKey, JSON.stringify(sessionData));
    }
  }, [quizData, userAnswers, confidenceScores, currentQuestionIndex, gameStatus, difficulty, userId, tutorialId]);


  // LOAD HISTORY SAAT IDLE
  useEffect(() => {
    if (gameStatus === 'idle') {
        try {
            const savedHistory = JSON.parse(localStorage.getItem('learncheck_history') || '[]');
            setHistory(savedHistory);
        } catch (e) {
            console.error("Error reading history", e);
            localStorage.removeItem('learncheck_history');
        }
    }
  }, [gameStatus]);

  // Handler Perubahan Preferensi dari Button
  // const handlePreferencesChange = (newPrefs, newUserId) => {
  //   setPreferences(newPrefs);
  //   setUserId(newUserId);
  //   const url = new URL(window.location);
  //   url.searchParams.set('user_id', newUserId);
  //   window.history.pushState({}, '', url);
  // };
  const toggleModal = () => {
    setShowModal(!showModal);
  };
  const handleStartQuiz = async () => {
    setGameStatus('loading');
    setError(null);
    try {
      const response = await axios.get(`${API_URL}/quiz`, { 
          params: { tutorial_id: tutorialId, difficulty: difficulty } 
      });
      
      if (!response.data || !response.data.questions || response.data.questions.length === 0) {
          throw new Error("Data kuis kosong atau tidak valid dari AI.");
      }

      setQuizData(response.data);
      
      // RESET TOTAL (Karena user pencet mulai baru)
      setUserAnswers({});
      setConfidenceScores({});
      setCurrentQuestionIndex(0);
      
      // Update session storage dengan state baru yang bersih
      const sessionKey = `quiz_session_${userId}_${tutorialId}`;
      localStorage.removeItem(sessionKey); // Bersihkan sesi lama

      setGameStatus('active');
    } catch (err) {
      console.error("Gagal start quiz:", err);
      setError(err.response?.data?.error || err.message || 'Gagal memuat kuis. Cek koneksi backend.');
      setGameStatus('error');
    }
  };

  const handleAnswerSubmit = (questionId, selectedOption, confidence) => {
    const newAnswers = { ...userAnswers, [questionId]: selectedOption };
    setUserAnswers(newAnswers);
    const newConfidence = { ...confidenceScores, [questionId]: confidence };
    setConfidenceScores(newConfidence);
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex === quizData.questions.length - 1) setGameStatus('submitted');
    else setCurrentQuestionIndex(prev => prev + 1);
  };

  // Reset total saat user menekan "Mulai Kuis Baru" di halaman result
  const handleRetry = () => {
    const sessionKey = `quiz_session_${userId}_${tutorialId}`;
    localStorage.removeItem(sessionKey); // Hapus sesi
    
    setUserAnswers({});
    setConfidenceScores({});
    setCurrentQuestionIndex(0);
    setGameStatus('idle');
    setQuizData(null);
  };

  const isDark = preferences.theme === 'dark';
  const themeClass = isDark ? 'dark' : '';
  const fontSizeClass = {
    'small': 'text-sm', 'medium': 'text-base', 'large': 'text-lg', 'extra-large': 'text-xl'
  }[preferences.fontSize] || 'text-base';
  const fontTypeClass = preferences.fontType === 'serif' ? 'font-serif' : preferences.fontType === 'mono' ? 'font-mono' : 'font-sans';

  const wrapperClasses = `w-full h-screen overflow-hidden flex flex-col transition-colors duration-300 ${themeClass} ${fontSizeClass} ${fontTypeClass}
    ${isDark ? 'bg-gray-900 text-gray-100' : 'bg-gradient-to-br from-white to-gray-50 text-gray-800'}`;

  // --- RENDER ---

  if (initLoading) return <div className="min-h-[100px] bg-white"></div>;

  return (
    <div className={wrapperClasses}>
      
      {/* TOMBOL PREFERENSI USER */}
      {/* <UserPreferencesButton 
         onPreferencesChange={handlePreferencesChange} 
         currentUserId={userId}
         currentTutorialId={tutorialId}
      /> */}

      {/* ERROR STATE */}
      {gameStatus === 'error' && (
        <div className="flex items-center justify-center p-8 h-full">
          <div className="p-6 bg-white dark:bg-gray-800 rounded border-l-4 border-red-500 text-center shadow-lg w-full max-w-md">
            <h2 className="font-bold text-xl text-red-600 mb-2">Terjadi Kesalahan</h2>
            <p className="text-sm opacity-80 mb-4">{error}</p>
            <button 
                onClick={() => window.location.reload()} 
                className="px-6 py-2 bg-gray-200 dark:bg-gray-700 rounded font-bold hover:bg-gray-300 dark:hover:bg-gray-600 transition"
            >
                Muat Ulang Halaman
            </button>
          </div>
        </div>
      )}

      {/* LOADING STATE */}
      {gameStatus === 'loading' && <LoadingSpinner isDark={isDark} />}

      {/* RESULT STATE */}
      {gameStatus === 'submitted' && (
        <div className="flex justify-center p-3 sm:p-4 animate-fade-in">
          <div className="w-full max-w-4xl"> 
            <Result
              questions={quizData.questions}
              userAnswers={userAnswers}
              confidenceScores={confidenceScores}
              onRetry={handleRetry}
              isDark={isDark}
              difficulty={difficulty}
            />
          </div>
        </div>
      )}

      {/* ACTIVE QUIZ STATE */}
      {gameStatus === 'active' && quizData && quizData.questions ? (
        <div className="flex items-center justify-center p-4 lg:p-8 animate-fade-in h-full overflow-y-auto">
          {quizData.questions[currentQuestionIndex] ? (
            <>
                

                {/* MAIN CONTENT (SCROLLABLE) */}
                <main className="flex-1 min-h-0 relative overflow-hidden flex flex-col"> 
                    <div className="flex-1 p-1 overflow-hidden">
                       <Question
                          key={currentQuestionIndex} 
                          question={quizData.questions[currentQuestionIndex]}
                          userAnswer={userAnswers[quizData.questions[currentQuestionIndex].id] || null}
                          onAnswerSubmit={handleAnswerSubmit}
                          isDark={isDark}
                          difficulty={difficulty}
                          userId={userId}
                          currentQuestionIndex={currentQuestionIndex}
                          quizData={quizData}
                          handleNextQuestion={handleNextQuestion}
                        />
                    </div>
                </main>
            </>
          ) : (
             <div className="text-center p-8 text-red-500">Gagal memuat soal. Silakan coba lagi.</div>
          )}
        </div>
      ) : null}

      {/* START PAGE */}
      {gameStatus === 'idle' && (
        <div className="flex items-center justify-center p-4 lg:p-8 animate-fade-in h-full">
          <div className={`w-full max-w-5xl shadow-2xl rounded-xl overflow-hidden ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
            <div className="flex flex-col-reverse lg:flex-row">
              <div className="w-full lg:w-3/5 p-6 sm:p-12 flex flex-col justify-center">
                <div className="flex items-center gap-3 mb-4">
                  <span className={`px-2 py-1 rounded-full text-[10px] sm:text-xs font-bold border flex items-center gap-2
                    ${isDark ? 'bg-gray-700 border-gray-600 text-blue-300' : 'bg-blue-50 border-blue-100 text-blue-600'}`}>
                    {isDark ? <MoonIcon /> : <SunIcon />}
                    Mode: {preferences.theme === 'dark' ? 'Dark' : 'Light'}
                  </span>
                </div>

                <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold mb-3 sm:mb-6 leading-tight">
                  LearnCheck AI
                </h1>
                <p className={`text-sm sm:text-lg mb-6 sm:mb-8 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                  Laporan Belajar Cerdas & Adaptif.
                </p>
                
                <div className="w-full mb-6 text-left">
                    <p className="text-xs font-bold mb-2 uppercase opacity-70 flex items-center"><LevelIcon /> Pilih Kesulitan:</p>
                    <div className="grid grid-cols-3 gap-2">
                        {['easy', 'medium', 'hard'].map((level) => (
                            <button key={level} onClick={() => setDifficulty(level)} className={`py-2 px-1 rounded-lg text-xs font-bold border-2 transition-all capitalize ${difficulty === level ? 'border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' : 'border-gray-200 dark:border-gray-700 text-gray-500 hover:border-gray-400'}`}>
                                {level === 'easy' ? 'Mudah' : level === 'medium' ? 'Sedang' : 'Sulit'}
                            </button>
                        ))}
                    </div>
                </div>
                
                <button
                  onClick={handleStartQuiz}
                  disabled={!tutorialId || !userId}
                  className={`w-full py-3 sm:py-4 px-6 rounded-lg text-base font-bold text-white shadow-lg transition-all transform hover:-translate-y-1
                    ${(!tutorialId || !userId) ? 'bg-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 animate-subtle-glow'}`}
                >
                  {(!tutorialId || !userId) ? 'Loading...' : 'Mulai Sekarang'}
                </button>

                {/* CHART RIWAYAT BELAJAR */}
                <button 
                  onClick={() => setShowModal(true)}  // Membuka modal
                  className="fixed top-4 right-6 p-3 bg-blue-500 text-white rounded-full shadow-lg hover:bg-blue-600 focus:outline-none"
                >
                  <ChartIcon />
                </button>
              {/* Tombol Chart untuk membuka modal */}
              <button 
                  onClick={toggleModal} // Membuka atau menutup modal
                  className="fixed top-4 right-6 p-3 bg-blue-500 text-white rounded-full shadow-lg hover:bg-blue-600 focus:outline-none"
                >
                  <ChartIcon />
                </button>

              </div>
              
            </div>
          </div>
        </div>
      )}
{showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-500 bg-opacity-75">
          <div className="bg-white dark:bg-gray-800 rounded-lg w-11/12 md:w-3/4 p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800 dark:text-white">Riwayat Belajar</h2>
              <button
                onClick={toggleModal} // Menutup modal
                className="text-gray-600 dark:text-white font-bold text-xl"
              >
                &times; {/* Tombol Close */}
              </button>
            </div>
            <HistoryChart history={history} isDark={preferences.theme === 'dark'} />
          </div>
        </div>
      )}
    </div>
  );
}

export default App;