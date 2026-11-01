import React, { useEffect } from 'react';
import { Trophy, Sparkles, X } from 'lucide-react';
import { playClickSound } from '../utils/audio';

interface WinCelebrationProps {
  isOpen: boolean;
  onClose: () => void;
  winAmount: number;
  winningAnimalKhmer: string;
  winningNumber: number;
}

export const WinCelebration: React.FC<WinCelebrationProps> = ({
  isOpen,
  onClose,
  winAmount,
  winningAnimalKhmer,
  winningNumber,
}) => {
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        onClose();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-fade-in select-none">
      <div className="relative bg-gradient-to-b from-amber-500 via-amber-600 to-yellow-600 p-1 rounded-2xl shadow-2xl max-w-sm w-full animate-bounce-short">
        <div className="bg-slate-900 rounded-xl p-6 text-center text-white relative overflow-hidden">
          {/* Close button */}
          <button
            onClick={() => {
              playClickSound();
              onClose();
            }}
            className="absolute top-3 right-3 text-white/60 hover:text-white p-1 rounded-full hover:bg-white/10 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Ambient Glow */}
          <div className="absolute inset-0 bg-radial from-yellow-500/20 via-transparent to-transparent pointer-events-none" />

          {/* Trophy Icon */}
          <div className="w-16 h-16 mx-auto mb-3 bg-gradient-to-tr from-yellow-500 to-amber-300 rounded-full flex items-center justify-center shadow-lg border-2 border-yellow-200">
            <Trophy className="w-9 h-9 text-slate-950 fill-yellow-400" />
          </div>

          <div className="flex items-center justify-center gap-1.5 text-yellow-300 font-extrabold text-sm mb-1 tracking-wide uppercase">
            <Sparkles className="w-4 h-4 text-yellow-400" />
            <span>សូមអបអរសាទរ! (Congratulations!)</span>
            <Sparkles className="w-4 h-4 text-yellow-400" />
          </div>

          <p className="text-xs text-slate-300 mb-3">
            អ្នកបានឈ្នះក្នុងវេននេះ! លេខឈ្នះគឺ{' '}
            <span className="font-bold text-yellow-400">
              {winningAnimalKhmer} (លេខ {winningNumber})
            </span>
          </p>

          {/* Winning Amount Card */}
          <div className="bg-gradient-to-r from-amber-950 via-slate-800 to-amber-950 border-2 border-yellow-400/80 rounded-xl py-3 px-4 shadow-inner mb-4">
            <div className="text-xs font-bold text-yellow-300">ទឹកប្រាក់ឈ្នះសរុប (Total Win)</div>
            <div className="text-3xl font-black text-emerald-400 drop-shadow-md">
              +{winAmount.toLocaleString()}៛
            </div>
          </div>

          <button
            onClick={() => {
              playClickSound();
              onClose();
            }}
            className="w-full bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-300 hover:to-amber-400 text-slate-950 font-black py-2.5 px-4 rounded-lg text-sm shadow-lg transition-transform active:scale-95 cursor-pointer"
          >
            បន្តការលេង (Continue Playing)
          </button>
        </div>
      </div>
    </div>
  );
};
