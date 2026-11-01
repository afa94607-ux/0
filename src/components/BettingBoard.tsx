import React from 'react';
import { ANIMALS } from '../data/animals';
import { Animal, BetCategory, PlacedBet } from '../types/yuki';
import { AnimalIllustration } from './AnimalIllustration';
import { playChipSound, playClickSound } from '../utils/audio';
import { RotateCw } from 'lucide-react';

interface BettingBoardProps {
  countdown: number;
  currentRoundId: string;
  roundEndTime: string;
  currentTimeStr: string;
  selectedChip: number;
  placedBets: Record<BetCategory, PlacedBet>;
  onPlaceBet: (category: BetCategory, amount: number, odds: number, labelKhmer: string) => void;
  onOpenBetModal: (category: BetCategory, odds: number, labelKhmer: string) => void;
  isDrawing: boolean;
  winningAnimal: Animal | null;
  onRefreshRound?: () => void;
  khmerVoiceover?: {
    number?: number;
    khmer: string;
    english: string;
    type: 'countdown' | 'blessing';
  } | null;
}

export const BettingBoard: React.FC<BettingBoardProps> = ({
  countdown,
  currentRoundId,
  roundEndTime,
  currentTimeStr,
  selectedChip,
  placedBets,
  onPlaceBet,
  onOpenBetModal,
  isDrawing,
  winningAnimal,
  onRefreshRound,
  khmerVoiceover,
}) => {
  const isLocked = countdown <= 10 || isDrawing;

  const handleBetClick = (category: BetCategory, odds: number, labelKhmer: string) => {
    if (isLocked) return;
    playClickSound();
    onOpenBetModal(category, odds, labelKhmer);
  };

  const formatCountdown = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const renderChipBadge = (category: BetCategory) => {
    const bet = placedBets[category];
    if (!bet || bet.amount <= 0) return null;

    let formatAmount = `${bet.amount}`;
    if (bet.amount >= 1000000) {
      formatAmount = `${(bet.amount / 1000000).toFixed(1).replace('.0', '')}M`;
    } else if (bet.amount >= 1000) {
      formatAmount = `${bet.amount / 1000}k`;
    }

    return (
      <div className="absolute top-1 right-1 z-20 flex items-center justify-center">
        <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-yellow-400 border-2 border-yellow-200 text-slate-900 font-black text-[10px] sm:text-[11px] shadow-lg flex items-center justify-center animate-scale-in">
          {formatAmount}
        </div>
      </div>
    );
  };

  return (
    <div
      className="w-full lg:w-[630px] flex flex-col bg-white border-l border-[#cbd5e1] select-none text-slate-900"
      style={{
        paddingBottom: '1px',
        marginLeft: '1px',
        marginRight: '-61px',
        paddingTop: '0px',
        marginBottom: '3px',
        marginTop: '0px',
      }}
    >
      {/* Top Countdown & Round Info Bar */}
      <div className="flex h-12 sm:h-14">
        {/* Red Countdown Box (3-minute timer with 10s lockout highlight) */}
        <div
          className={`w-28 sm:w-32 flex flex-col items-center justify-center font-black tracking-tight shadow-inner transition-all ${
            countdown <= 10
              ? 'bg-[#b91c1c] text-yellow-300 animate-pulse'
              : 'bg-[#c80000] text-white'
          }`}
          style={{
            marginLeft: '4px',
          }}
        >
          <span className="text-xl sm:text-2xl font-mono leading-none">
            {formatCountdown(countdown)}
          </span>
          {countdown <= 10 && (
            <span className="text-[10px] font-black uppercase text-yellow-200 tracking-wider mt-0.5">
              {countdown === 0 ? 'ប្រកាស' : 'បិទភ្នាល់'}
            </span>
          )}
        </div>

        {/* Blue Round & Time Banner */}
        <div
          className="flex-1 bg-[#1b3b75] text-white flex items-center justify-between px-3 text-xs sm:text-sm font-bold"
          style={{
            paddingBottom: '0px',
            paddingRight: '33px',
            paddingTop: '0px',
            paddingLeft: '12px',
            marginTop: '0px',
            marginLeft: '0px',
            marginRight: '69px',
          }}
        >
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => {
                playClickSound();
                if (onRefreshRound) onRefreshRound();
              }}
              className="hover:rotate-180 transition-transform cursor-pointer text-white/90"
              title="Refresh Round"
            >
              <RotateCw className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
            <span>{currentRoundId} {roundEndTime}</span>
          </div>

          <div className="font-mono text-sm sm:text-base font-bold tracking-wider">
            {currentTimeStr}
          </div>
        </div>
      </div>

      {/* 10-Second Lockout Notification Bar */}
      {countdown <= 10 && !isDrawing && (
        <div className="bg-amber-400 text-slate-950 px-3 py-1 text-xs font-black flex items-center justify-center gap-1.5 border-b border-amber-500 shadow-xs animate-pulse">
          {khmerVoiceover ? (
            <span className="flex items-center gap-1.5 text-red-950 font-extrabold">
              <span>🔊</span>
              <span>
                {khmerVoiceover.type === 'countdown'
                  ? `${khmerVoiceover.number}: «${khmerVoiceover.khmer}»`
                  : `«${khmerVoiceover.khmer}»`}
              </span>
              <span>•</span>
              <span>🔒 មិនអាចភ្នាល់ក្នុងរយៈពេល ១០ វិនាទីចុងក្រោយ</span>
            </span>
          ) : (
            <span>🔒 មិនអាចភ្នាល់ក្នុងរយៈពេល ១០ វិនាទីចុងក្រោយ (Betting Closed: Final 10s)</span>
          )}
        </div>
      )}
      {isDrawing && (
        <div className="bg-rose-600 text-white px-3 py-1 text-xs font-black flex items-center justify-center gap-1.5 border-b border-rose-700 shadow-xs animate-pulse">
          <span>📢 កំពុងប្រកាសលទ្ធផល... (Announcing Results...)</span>
        </div>
      )}

      {/* Upper Betting Matrix */}
      <div
        className="grid grid-cols-5 gap-0.5 bg-slate-200 p-0.5 border-b border-slate-300"
        style={{
          paddingBottom: '2px',
          paddingTop: '2px',
          marginLeft: '0px',
          paddingRight: '37px',
          paddingLeft: '5px',
          marginBottom: '-2px',
          marginTop: '0px',
          width: '594.097px',
        }}
      >
        {/* Row 1 & 2 Left: Small (តូច) & Odd (សេស) */}
        <div className="col-span-1 flex flex-col gap-0.5">
          {/* Small (តូច) */}
          <button
            onClick={() => handleBetClick('small', 1.95, 'តូច')}
            disabled={isLocked}
            className="relative h-14 sm:h-16 bg-[#00b4d8] hover:bg-[#0096c7] active:scale-[0.98] transition-all flex flex-col items-center justify-center text-white cursor-pointer shadow-sm group"
          >
            {renderChipBadge('small')}
            <span className="font-bold text-base sm:text-lg drop-shadow-sm">តូច</span>
            <div className="bg-white text-slate-800 text-[11px] font-bold px-3 py-0.2 rounded-full mt-0.5 shadow-sm">
              1.95
            </div>
          </button>

          {/* Odd (សេស) */}
          <button
            onClick={() => handleBetClick('odd', 1.95, 'សេស')}
            disabled={isLocked}
            className="relative h-14 sm:h-16 bg-[#ea580c] hover:bg-[#c2410c] active:scale-[0.98] transition-all flex flex-col items-center justify-center text-white cursor-pointer shadow-sm group"
          >
            {renderChipBadge('odd')}
            <span className="font-bold text-base sm:text-lg drop-shadow-sm">សេស</span>
            <div className="bg-white text-slate-800 text-[11px] font-bold px-3 py-0.2 rounded-full mt-0.5 shadow-sm">
              1.95
            </div>
          </button>
        </div>

        {/* Row 1 & 2 Middle: Big (ធំ) & Even (គូ) */}
        <div className="col-span-1 flex flex-col gap-0.5">
          {/* Big (ធំ) */}
          <button
            onClick={() => handleBetClick('big', 1.95, 'ធំ')}
            disabled={isLocked}
            className="relative h-14 sm:h-16 bg-[#ec4899] hover:bg-[#db2777] active:scale-[0.98] transition-all flex flex-col items-center justify-center text-white cursor-pointer shadow-sm group"
          >
            {renderChipBadge('big')}
            <span className="font-bold text-base sm:text-lg drop-shadow-sm">ធំ</span>
            <div className="bg-white text-slate-800 text-[11px] font-bold px-3 py-0.2 rounded-full mt-0.5 shadow-sm">
              1.95
            </div>
          </button>

          {/* Even (គូ) */}
          <button
            onClick={() => handleBetClick('even', 1.95, 'គូ')}
            disabled={isLocked}
            className="relative h-14 sm:h-16 bg-[#f59e0b] hover:bg-[#d97706] active:scale-[0.98] transition-all flex flex-col items-center justify-center text-white cursor-pointer shadow-sm group"
          >
            {renderChipBadge('even')}
            <span className="font-bold text-base sm:text-lg drop-shadow-sm">គូ</span>
            <div className="bg-white text-slate-800 text-[11px] font-bold px-3 py-0.2 rounded-full mt-0.5 shadow-sm">
              1.95
            </div>
          </button>
        </div>

        {/* Column 3: Red (ក្រហម: 1, 4, 7, 10) */}
        <button
          onClick={() => handleBetClick('red', 2.95, 'ក្រហម')}
          disabled={isLocked}
          className="col-span-1 h-[116px] sm:h-[132px] bg-[#dc2626] hover:bg-[#b91c1c] active:scale-[0.98] transition-all flex flex-col items-center justify-between py-2 text-white cursor-pointer shadow-sm relative group"
        >
          {renderChipBadge('red')}
          <div className="flex flex-col items-center">
            <span className="font-bold text-base sm:text-lg drop-shadow-sm">ក្រហម</span>
            <span className="text-[10px] tracking-wide text-white/90 font-medium">1 4 7 10</span>
          </div>
          <div className="bg-white text-slate-800 text-[11px] font-bold px-3 py-0.2 rounded-full shadow-sm">
            2.95
          </div>
        </button>

        {/* Column 4: Green (បៃតង: 2, 5, 8, 11) */}
        <button
          onClick={() => handleBetClick('green', 2.95, 'បៃតង')}
          disabled={isLocked}
          className="col-span-1 h-[116px] sm:h-[132px] bg-[#16a34a] hover:bg-[#15803d] active:scale-[0.98] transition-all flex flex-col items-center justify-between py-2 text-white cursor-pointer shadow-sm relative group"
        >
          {renderChipBadge('green')}
          <div className="flex flex-col items-center">
            <span className="font-bold text-base sm:text-lg drop-shadow-sm">បៃតង</span>
            <span className="text-[10px] tracking-wide text-white/90 font-medium">2 5 8 11</span>
          </div>
          <div className="bg-white text-slate-800 text-[11px] font-bold px-3 py-0.2 rounded-full shadow-sm">
            2.95
          </div>
        </button>

        {/* Column 5: Blue (ខៀវ: 3, 6, 9, 12) */}
        <button
          onClick={() => handleBetClick('blue', 2.95, 'ខៀវ')}
          disabled={isLocked}
          className="col-span-1 h-[116px] sm:h-[132px] bg-[#2563eb] hover:bg-[#1d4ed8] active:scale-[0.98] transition-all flex flex-col items-center justify-between py-2 text-white cursor-pointer shadow-sm relative group"
        >
          {renderChipBadge('blue')}
          <div className="flex flex-col items-center">
            <span className="font-bold text-base sm:text-lg drop-shadow-sm">ខៀវ</span>
            <span className="text-[10px] tracking-wide text-white/90 font-medium">3 6 9 12</span>
          </div>
          <div className="bg-white text-slate-800 text-[11px] font-bold px-3 py-0.2 rounded-full shadow-sm">
            2.95
          </div>
        </button>
      </div>

      {/* The 12 Zodiac Animal Cards (2 rows of 6 cards) */}
      <div
        className="grid grid-cols-6 gap-1 p-1 sm:p-1.5 bg-slate-100 flex-1"
        style={{
          marginRight: '2px',
          paddingBottom: '186px',
          paddingRight: '24px',
          paddingLeft: '4px',
          paddingTop: '5px',
          marginLeft: '0px',
          height: '407.364px',
          width: '594.077px',
          marginTop: '3px',
          marginBottom: '9px',
        }}
      >
        {ANIMALS.map((animal) => {
          const catKey: BetCategory = `num_${animal.number}`;
          const isWinner = winningAnimal?.number === animal.number;

          // Theme colors based on animal
          const textColor =
            animal.color === 'red'
              ? 'text-[#dc2626]'
              : animal.color === 'green'
              ? 'text-[#16a34a]'
              : 'text-[#2563eb]';

          return (
            <button
              key={animal.number}
              onClick={() => handleBetClick(catKey, animal.payoutRate, `${animal.nameKhmer} (លេខ ${animal.number})`)}
              disabled={isLocked}
              className={`relative bg-amber-50/60 hover:bg-amber-100/90 active:scale-95 border-2 sm:border-4 transition-all rounded-lg p-0.5 flex flex-col justify-between cursor-pointer shadow-sm overflow-hidden aspect-square h-auto w-full ${
                isWinner ? 'ring-4 ring-yellow-400 bg-yellow-100 z-10 border-yellow-400' : 'border-amber-300/80 hover:border-amber-500'
              }`}
            >
              {renderChipBadge(catKey)}

              {animal.number === 1 ? (
                <div className="w-full h-full aspect-square flex items-center justify-center p-0">
                  <img
                    src="/assets/aistudio/image_56958bf8.png"
                    alt="ជូត 1"
                    className="w-full h-full aspect-square object-contain rounded transition-transform hover:scale-105"
                  />
                </div>
              ) : animal.number === 2 ? (
                <div className="w-full h-full aspect-square flex items-center justify-center p-0">
                  <img
                    src="/assets/aistudio/image_db618d8c.png"
                    alt="ឆ្លូវ 2"
                    className="w-full h-full aspect-square object-contain rounded transition-transform hover:scale-105"
                  />
                </div>
              ) : animal.number === 3 ? (
                <div className="w-full h-full aspect-square flex items-center justify-center p-0">
                  <img
                    src="/assets/aistudio/image_f12e60ed.png"
                    alt="ខាល 3"
                    className="w-full h-full aspect-square object-contain rounded transition-transform hover:scale-105"
                  />
                </div>
              ) : animal.number === 4 ? (
                <div className="w-full h-full aspect-square flex items-center justify-center p-0">
                  <img
                    src="/assets/aistudio/image_da2dada5.png"
                    alt="ថោះ 4"
                    className="w-full h-full aspect-square object-contain rounded transition-transform hover:scale-105"
                  />
                </div>
              ) : animal.number === 5 ? (
                <div className="w-full h-full aspect-square flex items-center justify-center p-0">
                  <img
                    src="/assets/aistudio/image_d13f2d73.png"
                    alt="រោង 5"
                    className="w-full h-full aspect-square object-contain rounded transition-transform hover:scale-105"
                  />
                </div>
              ) : animal.number === 6 ? (
                <div className="w-full h-full aspect-square flex items-center justify-center p-0">
                  <img
                    src="/assets/aistudio/image_200a760b.png"
                    alt="ម្សាញ់ 6"
                    className="w-full h-full aspect-square object-contain rounded transition-transform hover:scale-105"
                  />
                </div>
              ) : animal.number === 7 ? (
                <div className="w-full h-full aspect-square flex items-center justify-center p-0">
                  <img
                    src="/assets/aistudio/image_50856913.png"
                    alt="មមី 7"
                    className="w-full h-full aspect-square object-contain rounded transition-transform hover:scale-105"
                  />
                </div>
              ) : animal.number === 8 ? (
                <div className="w-full h-full aspect-square flex items-center justify-center p-0">
                  <img
                    src="/assets/aistudio/image_c0557994.png"
                    alt="មមែ 8"
                    className="w-full h-full aspect-square object-contain rounded transition-transform hover:scale-105"
                  />
                </div>
              ) : animal.number === 9 ? (
                <div className="w-full h-full aspect-square flex items-center justify-center p-0">
                  <img
                    src="/assets/aistudio/image_799af351.png"
                    alt="វក 9"
                    className="w-full h-full aspect-square object-contain rounded transition-transform hover:scale-105"
                  />
                </div>
              ) : animal.number === 10 ? (
                <div className="w-full h-full aspect-square flex items-center justify-center p-0">
                  <img
                    src="/assets/aistudio/image_a48a72a3.png"
                    alt="រកា 10"
                    className="w-full h-full aspect-square object-contain rounded transition-transform hover:scale-105"
                  />
                </div>
              ) : animal.number === 11 ? (
                <div className="w-full h-full aspect-square flex items-center justify-center p-0">
                  <img
                    src="/assets/aistudio/image_512554a0.png"
                    alt="ច 11"
                    className="w-full h-full aspect-square object-contain rounded transition-transform hover:scale-105"
                  />
                </div>
              ) : animal.number === 12 ? (
                <div className="w-full h-full aspect-square flex items-center justify-center p-0">
                  <img
                    src="/assets/aistudio/image_64be13af.png"
                    alt="កុរ 12"
                    className="w-full h-full aspect-square object-contain rounded transition-transform hover:scale-105"
                  />
                </div>
              ) : (
                <>
                  {/* Animal Khmer Name (Top-Left) */}
                  <div className="w-full flex justify-between items-start leading-none p-0.5">
                    <span className={`font-bold text-xs sm:text-sm ${textColor}`}>
                      {animal.nameKhmer}
                    </span>
                  </div>

                  {/* Middle Row: Big Number & Deity/Animal Illustration */}
                  <div className="relative w-full flex items-center justify-between my-auto px-0.5">
                    <span className={`font-black text-2xl sm:text-3xl leading-none ${textColor}`}>
                      {animal.number}
                    </span>

                    <div className="w-12 h-12 sm:w-14 sm:h-14">
                      <AnimalIllustration number={animal.number} />
                    </div>
                  </div>

                  {/* Bottom Right: Payout Odds '11' */}
                  <div className="w-full flex justify-end p-0.5">
                    <span className={`font-black text-[11px] sm:text-xs leading-none ${textColor}`}>
                      11
                    </span>
                  </div>
                </>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
