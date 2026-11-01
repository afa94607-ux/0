import React, { useState, useEffect } from 'react';
import { Printer, X } from 'lucide-react';
import { BetCategory } from '../types/yuki';
import { playChipSound, playClickSound } from '../utils/audio';

interface BetModalProps {
  isOpen: boolean;
  onClose: () => void;
  roundId: string;
  roundEndTime: string;
  category: BetCategory | null;
  categoryLabel: string;
  odds: number;
  currentTimeStr: string;
  onConfirmBet: (category: BetCategory, amount: number, odds: number, labelKhmer: string) => void;
  userBalance: number;
  onOpenDeposit: () => void;
  isBettingLocked?: boolean;
}

const CHIP_BUTTONS = [
  { label: '1ពាន់', value: 1000 },
  { label: '2ពាន់', value: 2000 },
  { label: '5ពាន់', value: 5000 },
  { label: '1ម៉ឺន', value: 10000 },
  { label: '2ម៉ឺន', value: 20000 },
  { label: '5ម៉ឺន', value: 50000 },
  { label: '20ម៉ឺន', value: 200000 },
  { label: '50ម៉ឺន', value: 500000 },
];

export const BetModal: React.FC<BetModalProps> = ({
  isOpen,
  onClose,
  roundId,
  roundEndTime,
  category,
  categoryLabel,
  odds,
  currentTimeStr,
  onConfirmBet,
  userBalance,
  onOpenDeposit,
  isBettingLocked = false,
}) => {
  const [betAmount, setBetAmount] = useState<number>(0);
  const [isSingleSlip, setIsSingleSlip] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      setBetAmount(0);
    }
  }, [isOpen]);

  if (!isOpen || !category) return null;

  const handleChipClick = (val: number) => {
    if (isBettingLocked) return;
    playChipSound();
    setBetAmount((prev) => prev + val);
  };

  const handleClear = () => {
    playClickSound();
    setBetAmount(0);
  };

  const handleConfirm = () => {
    if (isBettingLocked) {
      return;
    }
    if (betAmount < 100) {
      return;
    }
    if (betAmount > 1000000) {
      alert('ចំនួនភ្នាល់អតិបរមាគឺ 1,000,000៛');
      return;
    }
    if (userBalance < betAmount) {
      onOpenDeposit();
      return;
    }

    playChipSound();
    onConfirmBet(category, betAmount, odds, categoryLabel);
    onClose();
  };

  const handlePrint = () => {
    playClickSound();
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-4 select-none animate-fade-in font-sans">
      <div className="bg-[#1e2f75] rounded-xl shadow-2xl max-w-[560px] w-full overflow-hidden border border-blue-900 text-white">
        {/* Top Header Bar */}
        <div className="bg-[#1a2c6d] px-4 py-2 flex items-center justify-between border-b border-blue-900">
          <div className="text-white font-extrabold text-base sm:text-lg tracking-tight">
            {roundId} {roundEndTime}
          </div>

          <div className="flex items-center gap-1.5">
            {/* Green Print Button */}
            <button
              onClick={handlePrint}
              className="w-8 h-8 rounded bg-[#16a34a] hover:bg-[#15803d] flex items-center justify-center text-white cursor-pointer transition-colors shadow-xs"
              title="បោះពុម្ពប័ណ្ណភ្នាល់ (Print Slip)"
            >
              <Printer className="w-4 h-4" />
            </button>

            {/* Red Close Button */}
            <button
              onClick={() => {
                playClickSound();
                onClose();
              }}
              className="w-8 h-8 rounded bg-[#dc2626] hover:bg-[#b91c1c] flex items-center justify-center text-white font-black text-sm cursor-pointer transition-colors shadow-xs"
              title="បិទ (Close)"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Sub Header: Metadata Grid Bar */}
        <div className="grid grid-cols-6 border-b-2 border-blue-900 bg-[#243982] text-xs sm:text-sm font-bold">
          {/* Bet Type */}
          <div className="col-span-2 p-2 border-r border-blue-800 flex items-center gap-1">
            <span className="text-white">ប្រភេទភ្នាល់:</span>
            <span className="text-[#22c55e] font-extrabold ml-auto">{categoryLabel}</span>
          </div>

          {/* Odds */}
          <div className="col-span-2 p-2 border-r border-blue-800 flex items-center gap-1">
            <span className="text-white">ពិន្ទុភ្នាល់:</span>
            <span className="text-[#22c55e] font-extrabold ml-auto">{odds}</span>
          </div>

          {/* Time */}
          <div className="col-span-2 p-2 flex items-center gap-1">
            <span className="text-white">ម៉ោង:</span>
            <span className="text-[#22c55e] font-mono font-extrabold ml-auto">{currentTimeStr}</span>
          </div>
        </div>

        {/* Center Blue Stage Area */}
        <div className="p-4 sm:p-6 bg-[#1f358a] m-3 rounded-xl border border-blue-800 shadow-inner">
          {/* Bet Amount Input Row */}
          <div className="flex items-center justify-between gap-3 mb-5 sm:mb-6">
            <label className="text-white font-black text-base sm:text-lg">
              លុយភ្នាល់:
            </label>
            <div className="w-56 sm:w-64 bg-white rounded-md px-3 py-1.5 flex items-center justify-start border-2 border-blue-300 shadow-inner">
              <span className="text-[#16a34a] font-black text-xl sm:text-2xl font-mono">
                {betAmount.toLocaleString()}
              </span>
            </div>
          </div>

          {/* 8 Big Yellow Circular Buttons (2 rows of 4) */}
          <div className="grid grid-cols-4 gap-2.5 sm:gap-4 justify-items-center">
            {CHIP_BUTTONS.map((chip) => (
              <button
                key={chip.label}
                onClick={() => handleChipClick(chip.value)}
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[#fde047] hover:bg-[#facc15] active:scale-95 transition-all shadow-[0_4px_10px_rgba(0,0,0,0.35)] flex items-center justify-center cursor-pointer border-2 border-yellow-300"
              >
                <span className="text-[#dc2626] font-black text-xs sm:text-base leading-tight drop-shadow-xs">
                  {chip.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Limits & Options */}
        <div className="px-5 pb-2 text-slate-800 bg-white pt-3">
          <div className="flex items-center justify-between text-xs sm:text-sm font-bold text-slate-900 mb-2">
            <span>ចំនួនតិចបំផុត: 100</span>
            <span>ចំនួនច្រើនបំផុត: 1,000,000</span>
          </div>

          <div className="flex items-center gap-2 mb-4 text-xs sm:text-sm font-bold text-slate-700">
            <input
              type="checkbox"
              id="singleSlip"
              checked={isSingleSlip}
              onChange={(e) => setIsSingleSlip(e.target.checked)}
              className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
            />
            <label htmlFor="singleSlip" className="cursor-pointer select-none">
              បញ្ជូនមួយប៉ុង
            </label>
          </div>

          {/* Action Buttons: ភ្នាល់ (Green) & លុប (Red) */}
          <div className="grid grid-cols-2 gap-3 pb-3">
            <button
              onClick={handleConfirm}
              disabled={isBettingLocked}
              className={`font-black py-2.5 sm:py-3 rounded-lg text-base sm:text-lg transition-all shadow-md text-center ${
                isBettingLocked
                  ? 'bg-slate-400 text-slate-200 cursor-not-allowed'
                  : 'bg-[#16a34a] hover:bg-[#15803d] active:scale-[0.98] text-white cursor-pointer'
              }`}
            >
              {isBettingLocked ? 'បិទការភ្នាល់' : 'ភ្នាល់'}
            </button>

            <button
              onClick={handleClear}
              className="bg-[#b91c1c] hover:bg-[#991b1b] active:scale-[0.98] text-white font-black py-2.5 sm:py-3 rounded-lg text-base sm:text-lg transition-all shadow-md cursor-pointer text-center"
            >
              លុប
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
