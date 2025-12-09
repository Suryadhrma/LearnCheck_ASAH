// Modal untuk feedback jawaban
const AnswerModal = ({ isOpen, onClose, answerStatus, explanation, isDark }) => {
    if (!isOpen) return null; // Don't render if modal is not open
  
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-500 bg-opacity-75">
        <div className="bg-white dark:bg-gray-800 rounded-lg w-11/12 md:w-3/4 p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white">Feedback Jawaban</h2>
            <button onClick={onClose} className="text-gray-600 dark:text-white font-bold text-xl">
              &times; {/* Close icon */}
            </button>
          </div>
  
          <div
            className={`rounded p-3 leading-relaxed border-l-4 overflow-y-auto max-h-32 custom-scrollbar ${
              answerStatus === 'correct'
                ? isDark ? 'bg-green-900/30 border-green-500 text-green-200' : 'bg-green-50 border-green-500 text-green-800'
                : answerStatus === 'partial'
                ? isDark ? 'bg-orange-900/30 border-orange-500 text-orange-200' : 'bg-orange-50 border-orange-500 text-orange-800'
                : isDark ? 'bg-red-900/30 border-red-500 text-red-200' : 'bg-red-50 border-red-500 text-red-800'
            }`}
          >
            <span className="font-bold block mb-1">
              {answerStatus === 'correct' ? '🎉 Benar!' : answerStatus === 'partial' ? '⚠️ Kurang Tepat' : '😅 Salah'}
            </span>
            <p>{explanation}</p>
          </div>
        </div>
      </div>
    );
  };
  
  export default AnswerModal;
  