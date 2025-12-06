import React, { useState } from 'react';
import axios from 'axios';

// ICONS 
const UserIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>;
const ChevronUpIcon = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg>;
const ChevronDownIcon = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>;
const CheckIcon = () => <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>;

// Icons Preferensi Visual
const MoonIcon = () => <svg className="w-3 h-3 text-indigo-500" fill="currentColor" viewBox="0 0 20 20"><path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" /></svg>;
const SunIcon = () => <svg className="w-3 h-3 text-yellow-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" /></svg>;
const FontIcon = () => <span className="text-[10px] font-bold text-gray-500 border rounded px-0.5 border-gray-300">Aa</span>;
const LayoutIcon = () => <svg className="w-3 h-3 text-blue-400" fill="currentColor" viewBox="0 0 20 20"><path d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" /></svg>;

const UserPreferencesButton = ({ onPreferencesChange, currentUserId, currentTutorialId }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [loadingId, setLoadingId] = useState(null);

  // List Tema User
  const themes = [
    { id: 1, label: 'User 1', desc: 'Light • Medium', icon: <SunIcon /> },
    { id: 2, label: 'User 2', desc: 'Dark • Medium', icon: <MoonIcon /> },
    { id: 3, label: 'User 3', desc: 'Light • Large • Serif', icon: <SunIcon /> },
    { id: 4, label: 'User 4', desc: 'Dark • XL', icon: <MoonIcon /> },
    { id: 5, label: 'User 5', desc: 'Light • Small • Mono', icon: <SunIcon /> },
    { id: 6, label: 'User 6', desc: 'Dark • Serif', icon: <MoonIcon /> },
  ];

  const handleSelectTheme = async (themeId) => {
    setLoadingId(themeId);
    try {
      // Menggunakan tutorialId dan userId secara dinamis
      const response = await axios.get(`${API_URL}/preferences`, {
        params: {
          user_id: themeId,
          tutorial_id: currentTutorialId || 'default-tutorial' 
        }
      });
      
      if (response.data) {
        onPreferencesChange(response.data, themeId);
      }
    } catch (error) {
      console.error("Gagal ganti tema", error);
    } finally {
      setLoadingId(null);
      setIsOpen(false);
    }
  };

  const currentUserLabel = themes.find(t => String(t.id) === String(currentUserId))?.label || `User ${currentUserId}`;

  return (
    <div className="fixed top-4 right-4 z-50">
      
      {/*\ TRIGGER BUTTON */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 bg-white dark:bg-gray-800 px-4 py-2 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 transition-all"
      >
        <div className="p-1.5 bg-indigo-100 text-indigo-600 rounded-full">
            <UserIcon />
        </div>
        <div className="text-left hidden sm:block">
            <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">Pilih User</div>
            <div className="text-sm font-bold text-gray-800 dark:text-gray-200">{currentUserLabel}</div>
        </div>
        <div className="text-gray-400">
            {isOpen ? <ChevronUpIcon /> : <ChevronDownIcon />}
        </div>
      </button>

      {/* DROPDOWN MENU */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden animate-fade-in-fast origin-top-right">
            
            <div className="p-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                <h3 className="font-bold text-gray-800 dark:text-white">Simulasi API User</h3>
                <p className="text-xs text-gray-500 mt-1">Ganti user untuk melihat adaptasi tampilan.</p>
            </div>

            <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                {themes.map((theme) => {
                    const isActive = String(currentUserId) === String(theme.id);
                    return (
                        <button
                            key={theme.id}
                            onClick={() => handleSelectTheme(theme.id)}
                            disabled={loadingId !== null}
                            className={`w-full flex items-center justify-between p-4 border-b border-gray-50 dark:border-gray-700/50 transition-colors
                                ${isActive ? 'bg-blue-50 dark:bg-blue-900/20' : 'hover:bg-gray-50 dark:hover:bg-gray-700'}
                            `}
                        >
                            <div className="flex items-center gap-3">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs
                                    ${isActive ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-300'}
                                `}>
                                    {theme.id}
                                </div>
                                
                                <div className="text-left">
                                    <div className={`text-sm font-bold ${isActive ? 'text-blue-700 dark:text-blue-300' : 'text-gray-700 dark:text-gray-200'}`}>
                                        {theme.label}
                                    </div>
                                    <div className="flex items-center gap-2 mt-1">
                                        {theme.icon}
                                        <div className="w-[1px] h-3 bg-gray-300"></div>
                                        <FontIcon />
                                        <div className="w-[1px] h-3 bg-gray-300"></div>
                                        <span className="text-[10px] text-gray-500 ml-1">{theme.desc}</span>
                                    </div>
                                </div>
                            </div>

                            <div>
                                {loadingId === theme.id ? (
                                    <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                                ) : isActive ? (
                                    <CheckIcon />
                                ) : null}
                            </div>
                        </button>
                    );
                })}
            </div>
        </div>
      )}
    </div>
  );
};

export default UserPreferencesButton;