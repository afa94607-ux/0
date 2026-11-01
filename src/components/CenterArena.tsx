import React from 'react';
import { GoldBowl } from './GoldBowl';
import { Animal } from '../types/yuki';
import { AnimalIllustration } from './AnimalIllustration';
import { Crown, Sparkles, Volume2 } from 'lucide-react';

export interface CenterArenaProps {
  countdown: number;
  isDrawing: boolean;
  revealedWinner: Animal | null;
  revealedStep: number;
  currentRoundAnimals: Animal[];
  isBettingLocked: boolean;
  language?: 'kh' | 'en';
  khmerVoiceover?: {
    number?: number;
    khmer: string;
    english: string;
    type: 'countdown' | 'blessing';
  } | null;
  onTestCountdown?: () => void;
  onTestReveal?: () => void;
}

export const CenterArena: React.FC<CenterArenaProps> = ({
  countdown,
  isDrawing,
  revealedWinner,
  revealedStep,
  currentRoundAnimals,
  isBettingLocked,
  language = 'kh',
  khmerVoiceover,
}) => {
  // 12th animal is the final figure in Row 3, which strictly determines the winning result
  const finalFigureWinner =
    revealedStep >= 12 ? (currentRoundAnimals[11] || revealedWinner) : null;

  return (
    <div className="flex-1 bg-gradient-to-b from-white via-slate-50 to-blue-50/20 p-2.5 sm:p-4 flex flex-col justify-between items-center border-r border-[#cbd5e1] min-h-[500px] relative overflow-hidden select-none">
      {/* Background ambient lighting */}
      <div className="absolute inset-0 bg-radial from-blue-100/30 via-transparent to-transparent pointer-events-none" />

      {/* Top Status & Alert Bar */}
      <div className="w-full mb-2">
        {/* Khmer Voiceover Countdown Banner (10 down to 1) */}
        {khmerVoiceover?.type === 'countdown' && (
          <div className="bg-gradient-to-r from-red-600 via-amber-600 to-red-600 text-white font-black text-xs sm:text-sm py-1.5 px-3 rounded shadow-md flex items-center justify-center gap-2 animate-pulse border border-yellow-300">
            <Volume2 className="w-4 h-4 text-yellow-300 animate-bounce" />
            <span className="text-yellow-300 font-extrabold text-sm sm:text-base">
              {khmerVoiceover.number}
            </span>
            <span className="text-white font-extrabold text-sm sm:text-base">
              «{khmerVoiceover.khmer}»
            </span>
            <span className="text-yellow-100 text-[11px] font-normal">
              ({khmerVoiceover.english})
            </span>
            <span className="text-[10px] bg-black/40 px-2 py-0.5 rounded text-yellow-200">
              🔒 បិទភ្នាល់
            </span>
          </div>
        )}

        {/* Khmer Blessing Banner («សូមសំណាងល្អ») */}
        {khmerVoiceover?.type === 'blessing' && (
          <div className="bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-slate-950 font-black text-xs sm:text-sm py-2 px-3 rounded shadow-lg flex items-center justify-center gap-2 animate-bounce border-2 border-yellow-200">
            <Sparkles className="w-4 h-4 text-red-600 animate-spin" />
            <span className="text-sm sm:text-base tracking-wide text-red-950 font-black">
              🔊 «{khmerVoiceover.khmer}»
            </span>
            <span className="text-[11px] bg-red-700 text-white font-bold px-2 py-0.5 rounded-full shadow-xs">
              ✨ Good Luck!
            </span>
          </div>
        )}

        {/* Standard Locked Alert Bar when not actively speaking voiceover */}
        {!khmerVoiceover && isBettingLocked && !isDrawing && (
          <div className="bg-amber-500 text-slate-950 font-black text-xs py-1 px-3 rounded shadow-xs flex items-center justify-center gap-1.5 animate-pulse">
            <span className="w-2 h-2 rounded-full bg-red-600 animate-ping" />
            <span>
              {language === 'kh'
                ? '🔒 ការភ្នាល់ត្រូវបានបិទ! ត្រៀមប្រកាសលទ្ធផល...'
                : '🔒 Betting Locked! Awaiting results...'}
            </span>
          </div>
        )}

        {/* Revealing in progress */}
        {isDrawing && revealedStep < 12 && (
          <div className="bg-blue-600 text-white font-black text-xs py-1 px-3 rounded shadow-xs flex items-center justify-center gap-2 animate-pulse border border-blue-400">
            <span className="w-2 h-2 rounded-full bg-yellow-300 animate-ping" />
            <span>
              {language === 'kh' ? '📢 កំពុងបើកលទ្ធផល...' : '📢 Revealing results...'}
            </span>
          </div>
        )}

        {/* Winner announced */}
        {finalFigureWinner && (
          <div className="bg-gradient-to-r from-emerald-600 via-green-600 to-emerald-600 text-white font-black text-xs py-1.5 px-3 rounded shadow-md flex items-center justify-center gap-2 animate-bounce border border-yellow-300">
            <Crown className="w-4 h-4 text-yellow-300 animate-pulse" />
            <span>
              {language === 'kh'
                ? `🏆 លទ្ធផលឈ្នះ: លេខ ${finalFigureWinner.number} - ${finalFigureWinner.nameKhmer} (${
                    finalFigureWinner.size === 'small' ? 'តូច' : 'ធំ'
                  }, ${
                    finalFigureWinner.color === 'red'
                      ? 'ក្រហម'
                      : finalFigureWinner.color === 'green'
                      ? 'បៃតង'
                      : 'ខៀវ'
                  })`
                : `🏆 Winner: No. ${finalFigureWinner.number} - ${finalFigureWinner.nameEnglish} (${
                    finalFigureWinner.size === 'small' ? 'Small' : 'Big'
                  }, ${
                    finalFigureWinner.color === 'red'
                      ? 'Red'
                      : finalFigureWinner.color === 'green'
                      ? 'Green'
                      : 'Blue'
                  })`}
            </span>
          </div>
        )}
      </div>

      {/* Line 1: 6 Bowls */}
      <div className="w-full flex items-center justify-center my-1.5">
        <div className="flex items-center justify-center gap-1.5 sm:gap-2.5">
          {[1, 2, 3, 4, 5, 6].map((num) => {
            const isRevealed = revealedStep >= num;
            const isCurrentlyRevealing = isDrawing && revealedStep === num;
            const animal = isRevealed && currentRoundAnimals[num - 1] ? currentRoundAnimals[num - 1] : null;

            return (
              <GoldBowl
                key={num}
                number={num}
                revealedAnimal={animal}
                isRevealing={isCurrentlyRevealing}
                className={`transition-all duration-300 ${
                  isCurrentlyRevealing
                    ? 'border-yellow-400 ring-4 ring-yellow-400 scale-108 shadow-lg bg-yellow-50 z-10'
                    : isRevealed
                    ? 'border-[#2563eb] shadow-sm bg-blue-50/20'
                    : 'border-[#93c5fd] hover:border-blue-400'
                }`}
              />
            );
          })}
        </div>
      </div>

      {/* Line 2: 5 Bowls */}
      <div className="w-full flex items-center justify-center my-1.5">
        <div className="flex items-center justify-center gap-1.5 sm:gap-2.5">
          {[7, 8, 9, 10, 11].map((num) => {
            const isRevealed = revealedStep >= num;
            const isCurrentlyRevealing = isDrawing && revealedStep === num;
            const animal = isRevealed && currentRoundAnimals[num - 1] ? currentRoundAnimals[num - 1] : null;

            return (
              <GoldBowl
                key={num}
                number={num}
                revealedAnimal={animal}
                isRevealing={isCurrentlyRevealing}
                className={`transition-all duration-300 ${
                  isCurrentlyRevealing
                    ? 'border-yellow-400 ring-4 ring-yellow-400 scale-108 shadow-lg bg-yellow-50 z-10'
                    : isRevealed
                    ? 'border-[#2563eb] shadow-sm bg-indigo-50/20'
                    : 'border-[#93c5fd] hover:border-blue-400'
                }`}
              />
            );
          })}
        </div>
      </div>

      {/* Line 3: Final Result (Number 12) */}
      <div className="w-full flex items-center justify-center my-2">
        <div
          className={`relative flex items-center justify-center bg-white rounded-xl transition-all duration-300 w-44 h-40 sm:w-52 sm:h-44 md:w-56 md:h-48 p-1.5 border-4 shadow-lg overflow-hidden ${
            finalFigureWinner
              ? 'border-yellow-400 ring-4 ring-yellow-300 shadow-yellow-200 bg-amber-50/90 scale-102'
              : isDrawing && revealedStep === 11
              ? 'border-amber-500 ring-4 ring-amber-300 animate-pulse shadow-md'
              : 'border-[#2563eb]'
          }`}
        >
          {finalFigureWinner ? (
            /* Final winning animal result display */
            <div className="relative w-full h-full flex flex-col items-center justify-between p-1 animate-scale-in">
              <div className="absolute top-1 left-1 z-20 bg-yellow-400 border border-yellow-200 text-slate-900 font-black text-xs px-2 py-0.5 rounded shadow-xs flex items-center gap-1">
                <Crown className="w-3.5 h-3.5 text-amber-800" />
              </div>

              {/* Animal Illustration */}
              <div className="w-full flex-1 flex items-center justify-center overflow-hidden">
                <AnimalIllustration
                  number={finalFigureWinner.number}
                  className="w-full h-full object-contain rounded-lg"
                />
              </div>

              {/* Winner Name & Details Pill */}
              <div className="w-full mt-1 bg-gradient-to-r from-amber-100 via-yellow-100 to-amber-100 border border-yellow-300 rounded-md p-1 flex flex-col items-center shadow-xs">
                <div className="text-xs sm:text-sm font-black text-slate-900 leading-tight">
                  លេខ {finalFigureWinner.number} — {finalFigureWinner.nameKhmer} ({finalFigureWinner.nameEnglish})
                </div>

                <div className="flex items-center gap-1.5 mt-0.5 text-[10px] font-black">
                  <span
                    className={`px-1.5 py-0.2 rounded text-white ${
                      finalFigureWinner.size === 'small' ? 'bg-blue-600' : 'bg-red-600'
                    }`}
                  >
                    {finalFigureWinner.size === 'small' ? 'តូច' : 'ធំ'}
                  </span>
                  <span
                    className={`px-1.5 py-0.2 rounded text-white ${
                      finalFigureWinner.parity === 'odd' ? 'bg-purple-600' : 'bg-indigo-600'
                    }`}
                  >
                    {finalFigureWinner.parity === 'odd' ? 'សេស' : 'គូ'}
                  </span>
                  <span
                    className={`px-1.5 py-0.2 rounded text-white ${
                      finalFigureWinner.color === 'red'
                        ? 'bg-red-600'
                        : finalFigureWinner.color === 'green'
                        ? 'bg-emerald-600'
                        : 'bg-blue-600'
                    }`}
                  >
                    {finalFigureWinner.color === 'red'
                      ? 'ក្រហម'
                      : finalFigureWinner.color === 'green'
                      ? 'បៃតង'
                      : 'ខៀវ'}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            /* Authentic hidden mystery bowl card */
            <div className="w-full h-full flex items-center justify-center p-1">
              <div
                className={`w-full h-full flex items-center justify-center ${
                  isDrawing && revealedStep === 11 ? 'animate-bounce' : ''
                }`}
              >
                <img
                  src="/assets/aistudio/hidden_bowl_card.png"
                  alt="លទ្ធផលលាក់ជួរទី ៣"
                  className="w-full h-full object-contain rounded-lg filter drop-shadow-sm"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Also export as Side2BowlArena to satisfy any existing references
export const Side2BowlArena = CenterArena;
