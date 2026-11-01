import React, { useState, useMemo } from 'react';
import { RotateCw, Ticket, CheckCircle2, XCircle } from 'lucide-react';
import { RoundResult, SettledBetRecord } from '../types/yuki';
import { EmptyDeskIllustration } from './EmptyDeskIllustration';
import { playClickSound } from '../utils/audio';

import { Language, translations } from '../utils/translations';

interface SidebarProps {
  balance: number;
  activeBetTotal: number;
  recentResults: RoundResult[];
  recentBets: SettledBetRecord[];
  currentDateStr: string;
  userId?: string;
  language?: Language;
  onRefresh?: () => void;
  onOpenDeposit: () => void;
  onClearBets?: () => void;
  onDoubleBets?: () => void;
  isBettingLocked?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  balance,
  activeBetTotal,
  recentResults,
  recentBets,
  currentDateStr,
  userId = 'AADDPDPP004',
  language = 'kh',
  onRefresh,
  onOpenDeposit,
  onClearBets,
  onDoubleBets,
  isBettingLocked = false,
}) => {
  const t = translations[language];

  // Identify the last 3 draws
  const recent3RoundIds = useMemo(() => {
    const list: string[] = [];
    // take from recentResults first
    recentResults.forEach((r) => {
      if (!list.includes(r.roundId)) list.push(r.roundId);
    });
    // also include from recentBets if needed
    recentBets.forEach((b) => {
      if (!list.includes(b.roundId)) list.push(b.roundId);
    });
    return list.slice(0, 3);
  }, [recentResults, recentBets]);

  // Selected filter state: 'all' or specific roundId
  const [selectedRoundFilter, setSelectedRoundFilter] = useState<string>('all');

  // Bets belonging to the last 3 draws
  const betsIn3Draws = useMemo(() => {
    if (recent3RoundIds.length === 0) return recentBets;
    return recentBets.filter((b) => recent3RoundIds.includes(b.roundId));
  }, [recentBets, recent3RoundIds]);

  // Filtered bets for display
  const displayBets = useMemo(() => {
    if (selectedRoundFilter === 'all') return betsIn3Draws;
    return betsIn3Draws.filter((b) => b.roundId === selectedRoundFilter);
  }, [betsIn3Draws, selectedRoundFilter]);

  // Financial summary
  const totalBetAmount = useMemo(() => {
    return displayBets.reduce((sum, b) => sum + b.amount, 0);
  }, [displayBets]);

  const totalWonAmount = useMemo(() => {
    return displayBets.reduce((sum, b) => sum + (b.won ? b.payout : 0), 0);
  }, [displayBets]);
  return (
    <aside className="w-full lg:w-72 xl:w-80 bg-white border-r border-[#cbd5e1] flex flex-col justify-between select-none text-slate-800 text-sm">
      <div className="p-3">
        {/* User Account Info Header */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-2 mb-2">
          <div className="font-medium text-slate-600 text-xs sm:text-sm">
            {currentDateStr}
          </div>
          <div className="flex items-center gap-1">
            <span
              onClick={onOpenDeposit}
              className="text-[#2563eb] font-bold tracking-tight cursor-pointer hover:underline text-xs sm:text-sm"
              title="ចុចដើម្បីដាក់ប្រាក់"
            >
              {userId}
            </span>
            <button
              onClick={() => {
                playClickSound();
                if (onRefresh) onRefresh();
              }}
              className="text-slate-400 hover:text-slate-600 p-0.5 rounded cursor-pointer transition-transform active:rotate-180"
              title="ផ្ទុកឡើងវិញ (Refresh)"
            >
              <RotateCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Currency Label */}
        <div className="text-slate-500 font-semibold text-xs mb-2">
          (KHR)
        </div>

        {/* Balance Metrics */}
        <div className="space-y-2 mb-3">
          <div className="flex items-center justify-between text-xs sm:text-sm">
            <span className="text-slate-700 font-medium">{language === 'kh' ? 'សមតុល្យទឹកប្រាក់' : 'Balance'}</span>
            <span className="font-extrabold text-[#16a34a] text-sm sm:text-base">
              {balance.toLocaleString()}៛
            </span>
          </div>

          <div className="flex items-center justify-between text-xs sm:text-sm">
            <span className="text-slate-700 font-medium">{language === 'kh' ? 'លុយកំពុងភ្នាល់' : 'Active Bets'}</span>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-[#16a34a] text-sm sm:text-base">
                {activeBetTotal.toLocaleString()}៛
              </span>
              {activeBetTotal > 0 && onClearBets && (
                <button
                  onClick={onClearBets}
                  disabled={isBettingLocked}
                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded transition-colors ${
                    isBettingLocked
                      ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                      : 'bg-rose-100 hover:bg-rose-200 text-rose-700 cursor-pointer'
                  }`}
                  title={language === 'kh' ? 'លុបការភ្នាល់' : 'Clear Bets'}
                >
                  {language === 'kh' ? 'លុប' : 'Clear'}
                </button>
              )}
              {activeBetTotal > 0 && onDoubleBets && (
                <button
                  onClick={onDoubleBets}
                  disabled={isBettingLocked}
                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded transition-colors ${
                    isBettingLocked
                      ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                      : 'bg-indigo-100 hover:bg-indigo-200 text-indigo-700 cursor-pointer'
                  }`}
                  title={language === 'kh' ? 'ទ្វេដង' : 'Double (2x)'}
                >
                  2x
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Recent Results Header */}
        <div className="bg-[#dbe6f6] px-2 py-1.5 rounded flex items-center justify-between mb-2">
          <span className="font-bold text-slate-800 text-xs sm:text-sm">
            {language === 'kh' ? 'លទ្ធផលចុងក្រោយ' : 'Recent Results'}
          </span>
          <button
            onClick={() => {
              playClickSound();
              if (onRefresh) onRefresh();
            }}
            className="text-slate-500 hover:text-slate-800 cursor-pointer"
          >
            <RotateCw className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Recent Results List (Last 3 - 5 draws) */}
        <div className="space-y-2 mb-4">
          {recentResults.slice(0, 3).map((res, idx) => (
            <div
              key={res.id || `${res.roundId}-${idx}`}
              className="flex items-center justify-between text-[11px] bg-slate-50 hover:bg-slate-100 p-1.5 rounded-lg border border-slate-200 shadow-xs"
            >
              <span className="font-bold text-slate-700 text-xs sm:text-sm">
                {res.roundId} <span className="text-[11px] text-slate-500 font-semibold ml-1">{res.timestamp}</span>
              </span>

              <div className="flex items-center gap-1.5 sm:gap-2">
                {/* Size Badge: Small (Cyan) or Big (Pink) */}
                <span
                  className={`px-2 py-1 rounded text-xs font-bold text-white shadow-xs ${
                    res.size === 'small' ? 'bg-[#00b4d8]' : 'bg-[#ec4899]'
                  }`}
                >
                  {res.size === 'small' ? (language === 'kh' ? 'តូច' : 'Small') : (language === 'kh' ? 'ធំ' : 'Big')}
                </span>

                <span className="text-slate-300 font-bold">|</span>

                {/* Color Badge: Red, Green, or Blue */}
                <span
                  className={`px-2 py-1 rounded text-xs font-bold text-white shadow-xs ${
                    res.color === 'red'
                      ? 'bg-[#dc2626]'
                      : res.color === 'green'
                      ? 'bg-[#16a34a]'
                      : 'bg-[#2563eb]'
                  }`}
                >
                  {res.color === 'red'
                    ? (language === 'kh' ? 'ក្រហម' : 'Red')
                    : res.color === 'green'
                    ? (language === 'kh' ? 'បៃតង' : 'Green')
                    : (language === 'kh' ? 'ខៀវ' : 'Blue')}
                </span>

                <span className="text-slate-300 font-bold">|</span>

                {/* Number */}
                <span className="text-xs font-bold text-amber-950 bg-amber-200/90 border border-amber-400 px-1.5 py-0.5 rounded shadow-xs">
                  {language === 'kh' ? `លេខ ${res.number}` : `No. ${res.number}`}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Recent Bets Header: Bet Slips History at Recent Bet 3 Draw */}
        <div className="bg-[#dbe6f6] px-2.5 py-1.5 rounded flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-1.5">
            <Ticket className="w-3.5 h-3.5 text-[#1d4ed8]" />
            <span className="font-bold text-slate-800 text-xs sm:text-sm">
              {language === 'kh' ? 'ទើបភ្នាល់ 3 វេនចុងក្រោយ' : 'Recent Bet 3 Draws'}
            </span>
          </div>
          <div className="flex items-center gap-1">
            {betsIn3Draws.length > 0 && (
              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-blue-100 text-blue-800 border border-blue-200">
                {displayBets.length} {language === 'kh' ? 'សន្លឹក' : 'slips'}
              </span>
            )}
            <button
              onClick={() => {
                playClickSound();
                if (onRefresh) onRefresh();
              }}
              className="text-slate-500 hover:text-slate-800 cursor-pointer p-0.5 rounded transition-transform active:rotate-180"
              title={language === 'kh' ? 'ផ្ទុកឡើងវិញ' : 'Refresh'}
            >
              <RotateCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* When no betting has occurred yet, show clean empty state */}
        {betsIn3Draws.length === 0 ? (
          <div className="py-6 flex flex-col items-center justify-center bg-slate-50/60 rounded-lg border border-dashed border-slate-200">
            <EmptyDeskIllustration />
            <span className="text-[11px] text-slate-400 mt-2 font-medium">
              {language === 'kh' ? 'មិនទាន់មានការភ្នាល់' : 'No bets placed yet'}
            </span>
          </div>
        ) : (
          <>
            {/* 3 Draws Round Filter Tabs (Active when bets exist) */}
            {recent3RoundIds.length > 0 && (
              <div className="flex items-center gap-1 mb-1.5 overflow-x-auto pb-0.5">
                <button
                  onClick={() => {
                    playClickSound();
                    setSelectedRoundFilter('all');
                  }}
                  className={`text-[10px] font-bold px-2 py-0.5 rounded transition-all shrink-0 cursor-pointer ${
                    selectedRoundFilter === 'all'
                      ? 'bg-[#1d4ed8] text-white shadow-xs'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                  }`}
                >
                  {language === 'kh' ? 'ទាំងអស់' : 'All'} ({betsIn3Draws.length})
                </button>
                {recent3RoundIds.map((rId) => {
                  const count = betsIn3Draws.filter((b) => b.roundId === rId).length;
                  const shortId = rId.includes('#') ? `#${rId.split('#')[1]}` : rId;
                  return (
                    <button
                      key={rId}
                      onClick={() => {
                        playClickSound();
                        setSelectedRoundFilter(rId);
                      }}
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded transition-all shrink-0 cursor-pointer ${
                        selectedRoundFilter === rId
                          ? 'bg-[#1d4ed8] text-white shadow-xs'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                      }`}
                    >
                      {shortId} ({count})
                    </button>
                  );
                })}
              </div>
            )}

            {/* Summary Financial Bar */}
            {displayBets.length > 0 && (
              <div className="flex items-center justify-between bg-slate-100/90 border border-slate-200 px-2 py-1 rounded text-[10px] mb-1.5 font-medium">
                <div className="text-slate-600">
                  {language === 'kh' ? 'ភ្នាល់សរុប:' : 'Total Bet:'}{' '}
                  <span className="font-bold text-slate-800">{totalBetAmount.toLocaleString()}៛</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-300">|</span>
                  <div className="text-slate-600">
                    {language === 'kh' ? 'ឈ្នះ:' : 'Won:'}{' '}
                    <span className={`font-bold ${totalWonAmount > 0 ? 'text-emerald-600 font-extrabold' : 'text-slate-500'}`}>
                      {totalWonAmount > 0 ? `+${totalWonAmount.toLocaleString()}៛` : '0៛'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Scrollable Bet Slips Content */}
            {displayBets.length === 0 ? (
              <div className="py-5 flex flex-col items-center justify-center bg-slate-50/70 rounded-lg border border-dashed border-slate-200">
                <EmptyDeskIllustration />
                <span className="text-[11px] text-slate-400 mt-2 font-medium">
                  {language === 'kh' ? 'មិនទាន់មានការភ្នាល់នៅវេននេះ' : 'No bet slips in this draw'}
                </span>
              </div>
            ) : (
              <div className="relative">
                {/* Scrollable list container: can scroll up and down through all betting slips */}
                <div className="space-y-1.5 text-xs max-h-56 sm:max-h-64 overflow-y-auto pr-1">
              {displayBets.map((b) => (
                <div
                  key={b.id}
                  className={`p-2 rounded-lg border transition-all duration-150 ${
                    b.won
                      ? 'bg-gradient-to-r from-emerald-50/90 to-white border-emerald-300 shadow-xs'
                      : 'bg-white border-slate-200 hover:border-slate-300 shadow-2xs'
                  }`}
                >
                  {/* Slip Header: Round ID, Time, & Win/Loss Status */}
                  <div className="flex items-center justify-between pb-1 border-b border-slate-100">
                    <div className="flex items-center gap-1">
                      <span className="font-bold text-[10px] text-slate-700 bg-slate-100 px-1.5 py-0.2 rounded">
                        {b.roundId}
                      </span>
                      <span className="text-[10px] text-slate-400 font-medium">
                        {b.time}
                      </span>
                    </div>

                    {/* Result Badge */}
                    {b.won ? (
                      <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                        {language === 'kh' ? 'ឈ្នះ' : 'WON'}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                        <XCircle className="w-3 h-3 text-rose-500 shrink-0" />
                        {language === 'kh' ? 'មិនត្រូវ' : 'LOST'}
                      </span>
                    )}
                  </div>

                  {/* Bet Selection: What they bet on */}
                  <div className="flex items-center justify-between mt-1.5">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />
                      <span className="font-bold text-slate-900 text-xs">
                        {b.labelKhmer}
                      </span>
                    </div>
                    <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-1.5 py-0.2 rounded">
                      x{b.odds.toFixed(2)}
                    </span>
                  </div>

                  {/* Financials: Bet Amount & Win Payout */}
                  <div className="mt-1.5 pt-1 border-t border-dashed border-slate-200 flex items-center justify-between text-[11px]">
                    <div>
                      <span className="text-[10px] text-slate-500">
                        {language === 'kh' ? 'ទឹកប្រាក់ភ្នាល់:' : 'Bet:'}{' '}
                      </span>
                      <span className="font-bold text-slate-800">
                        {b.amount.toLocaleString()}៛
                      </span>
                    </div>

                    <div>
                      {b.won ? (
                        <div className="text-right">
                          <span className="text-[10px] text-emerald-600 font-semibold">
                            {language === 'kh' ? 'ឈ្នះបាន:' : 'Win:'}{' '}
                          </span>
                          <span className="font-extrabold text-emerald-700 text-xs">
                            +{b.payout.toLocaleString()}៛
                          </span>
                        </div>
                      ) : (
                        <div className="text-right">
                          <span className="text-[10px] text-slate-400">
                            {language === 'kh' ? 'លទ្ធផល:' : 'Result:'}{' '}
                          </span>
                          <span className="font-medium text-rose-600 text-xs">
                            -{b.amount.toLocaleString()}៛
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Winning outcome reference */}
                  {b.winningAnimalKhmer && (
                    <div className="mt-1 text-[9px] text-slate-400 flex items-center justify-between bg-slate-50 px-1 py-0.5 rounded">
                      <span>{language === 'kh' ? 'លទ្ធផលចេញ:' : 'Result:'}</span>
                      <span className="font-semibold text-slate-600">
                        {b.winningAnimalKhmer} (លេខ {b.winningNumber})
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Scroll Indicator */}
            {displayBets.length > 3 && (
              <div className="text-[9px] text-center text-slate-400 pt-1 font-medium select-none">
                {language === 'kh' ? '▲ អូសឡើងលើ / ចុះក្រោម ដើម្បីមើលសន្លឹកភ្នាល់ទាំងអស់ ▼' : '▲ Scroll up / down to see all betting ▼'}
              </div>
            )}
          </div>
        )}
          </>
        )}
      </div>

      {/* Footer support text */}
      <div className="p-2 border-t border-slate-200 text-center text-[10px] text-slate-400">
        YUKI 12 Live Terminal v2.1
      </div>
    </aside>
  );
};
