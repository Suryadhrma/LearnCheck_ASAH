const ChartIcon = () => <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>;
const HistoryChart = ({ history, isDark }) => { 
    if (!history || history.length === 0) return null;
    const chartData = [...history].reverse(); 
  
    return (
      <div className={`mt-6 p-4 rounded-xl border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} w-full animate-fade-in`}>
         <h3 className={`text-xs font-bold mb-4 uppercase tracking-wider flex items-center ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            <ChartIcon /> Progress Belajar ({chartData.length} Sesi Terakhir)
         </h3>
         <div className="flex items-end justify-between h-28 gap-2">
            {chartData.map((item, idx) => {
               const safeScore = isNaN(item.score) ? 0 : item.score;
               let barColor = safeScore >= 80 ? 'bg-green-500' : safeScore >= 50 ? 'bg-yellow-500' : 'bg-red-500';
               return (
                 <div key={idx} className="flex flex-col items-center flex-1 group cursor-default h-full justify-end">
                    <span className={`text-[7px] uppercase font-bold mb-1 opacity-60 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} >
                      {item.difficulty?.substring(0, 3) || 'MED'}
                    </span>
                    <div className="relative w-full flex justify-center items-end h-[70%]">
                       <div 
                         className={`w-full max-w-[12px] sm:max-w-[20px] rounded-t transition-all duration-1000 ease-out ${barColor} opacity-80 group-hover:opacity-100`}
                         style={{ height: `${Math.max(safeScore, 5)}%` }}
                       >
                         <span className={`absolute -top-6 left-1/2 transform -translate-x-1/2 text-[10px] font-bold py-0.5 px-1.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 shadow-sm
                            ${isDark ? 'bg-gray-700 text-white' : 'bg-gray-800 text-white'}`}>
                           {safeScore}%
                         </span>
                       </div>
                    </div>
                    <span className={`text-[8px] mt-1 opacity-60 truncate w-full text-center ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      {item.date}
                    </span>
                 </div>
               );
            })}
         </div>
      </div>
    );
  };
  
  export default HistoryChart;
  