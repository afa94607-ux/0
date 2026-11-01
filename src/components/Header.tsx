import React from 'react';
import { Volume2, VolumeX, HelpCircle, Wallet, History, BarChart3, PlaySquare } from 'lucide-react';
import { playClickSound } from '../utils/audio';
import { Language, translations } from '../utils/translations';

export type ActiveTab = 'bet' | 'statement' | 'results' | 'admin';

interface HeaderProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  language: Language;
  onLanguageChange: (lang: Language) => void;
  isMuted: boolean;
  onToggleMute: () => void;
  onOpenDeposit: () => void;
  onOpenRules: () => void;
  balance: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onTabChange,
  language,
  onLanguageChange,
  isMuted,
  onToggleMute,
  onOpenDeposit,
  onOpenRules,
}) => {
  const t = translations[language];

  return (
    <header className="bg-[#4667a9] text-white px-3 sm:px-6 py-2 flex items-center justify-between border-b border-[#3b5998] shadow-sm select-none">
      {/* Left Navigation Tabs */}
      <div className="flex items-center space-x-6 sm:space-x-10 text-base sm:text-lg font-bold">
        <button
          onClick={() => {
            playClickSound();
            onTabChange('bet');
          }}
          className={`relative pb-0.5 transition-colors cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'bet'
              ? 'text-[#ffeaa7] drop-shadow-sm font-extrabold'
              : 'text-white/90 hover:text-white'
          }`}
        >
          <PlaySquare className="w-4 h-4 sm:w-5 sm:h-5" />
          <span>{t.tabBet}</span>
          {activeTab === 'bet' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#ffeaa7] rounded-full" />
          )}
        </button>

        <button
          onClick={() => {
            playClickSound();
            onTabChange('statement');
          }}
          className={`relative pb-0.5 transition-colors cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'statement'
              ? 'text-[#ffeaa7] drop-shadow-sm font-extrabold'
              : 'text-white/90 hover:text-white'
          }`}
        >
          <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5" />
          <span>{t.tabStatement}</span>
          {activeTab === 'statement' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#ffeaa7] rounded-full" />
          )}
        </button>

        <button
          onClick={() => {
            playClickSound();
            onTabChange('results');
          }}
          className={`relative pb-0.5 transition-colors cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'results'
              ? 'text-[#ffeaa7] drop-shadow-sm font-extrabold'
              : 'text-white/90 hover:text-white'
          }`}
        >
          <History className="w-4 h-4 sm:w-5 sm:h-5" />
          <span>{t.tabResults}</span>
          {activeTab === 'results' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#ffeaa7] rounded-full" />
          )}
        </button>

        <button
          onClick={() => {
            playClickSound();
            onTabChange('admin');
          }}
          className={`relative pb-0.5 transition-colors cursor-pointer flex items-center gap-1.5 px-2 py-0.5 rounded ${
            activeTab === 'admin'
              ? 'bg-amber-400 text-slate-950 font-black shadow-md'
              : 'bg-black/20 text-yellow-300 hover:bg-black/30 hover:text-yellow-200 border border-yellow-400/40'
          }`}
          title="ផ្ទាំងគ្រប់គ្រងប្រព័ន្ធ (Admin Control Panel)"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span>⚙️ {t.tabAdmin}</span>
        </button>
      </div>

      {/* Right Controls */}
      <div className="flex items-center space-x-2 sm:space-x-4">
        {/* Language selector: 1. Khmer, 2. English (replaces former chip selector) */}
        <div className="flex items-center bg-[#385387] p-0.5 rounded-md border border-white/20 shadow-inner">
          <button
            type="button"
            onClick={() => {
              playClickSound();
              onLanguageChange('kh');
            }}
            className={`flex items-center gap-1 sm:gap-1.5 px-2 py-1 rounded text-xs font-bold transition-all cursor-pointer ${
              language === 'kh'
                ? 'bg-yellow-400 text-slate-950 shadow font-black'
                : 'text-white/80 hover:text-white hover:bg-white/10'
            }`}
            title="1. ភាសាខ្មែរ (Khmer)"
          >
            <span className="text-sm leading-none">🇰🇭</span>
            <span>1. ខ្មែរ</span>
          </button>
          <button
            type="button"
            onClick={() => {
              playClickSound();
              onLanguageChange('en');
            }}
            className={`flex items-center gap-1 sm:gap-1.5 px-2 py-1 rounded text-xs font-bold transition-all cursor-pointer ${
              language === 'en'
                ? 'bg-yellow-400 text-slate-950 shadow font-black'
                : 'text-white/80 hover:text-white hover:bg-white/10'
            }`}
            title="2. English"
          >
            <span className="text-sm leading-none">🇬🇧</span>
            <span>2. English</span>
          </button>
        </div>

        {/* Quick Deposit button */}
        <button
          onClick={() => {
            playClickSound();
            onOpenDeposit();
          }}
          className="flex items-center gap-1 bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold px-2.5 py-1 rounded text-xs sm:text-sm shadow transition-all cursor-pointer"
        >
          <Wallet className="w-3.5 h-3.5" />
          <span>{t.deposit}</span>
        </button>

        {/* How to play / rules */}
        <button
          onClick={() => {
            playClickSound();
            onOpenRules();
          }}
          className="text-white/90 hover:text-white p-1 rounded hover:bg-white/10 transition-colors cursor-pointer"
          title={`${t.rules} (Rules)`}
        >
          <HelpCircle className="w-5 h-5" />
        </button>

        {/* Sound Toggle */}
        <button
          onClick={() => {
            onToggleMute();
            playClickSound();
          }}
          className="text-white/90 hover:text-white p-1 rounded hover:bg-white/10 transition-colors cursor-pointer"
          title={isMuted ? `${t.soundMuted} (Unmute)` : `${t.soundUnmuted} (Mute)`}
        >
          {isMuted ? <VolumeX className="w-5 h-5 text-red-300" /> : <Volume2 className="w-5 h-5" />}
        </button>
      </div>
    </header>
  );
};
