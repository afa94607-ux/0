import React from 'react';
import { Trash2, Copy, RotateCcw } from 'lucide-react';
import { playChipSound, playClickSound } from '../utils/audio';

interface ChipOption {
  value: number;
  label: string;
  bgClass: string;
  borderClass: string;
  textClass: string;
}

const CHIP_OPTIONS: ChipOption[] = [
  { value: 1000, label: '1K', bgClass: 'bg-white', borderClass: 'border-blue-600', textClass: 'text-blue-700' },
  { value: 5000, label: '5K', bgClass: 'bg-red-500', borderClass: 'border-red-700', textClass: 'text-white' },
  { value: 10000, label: '10K', bgClass: 'bg-emerald-600', borderClass: 'border-emerald-800', textClass: 'text-white' },
  { value: 50000, label: '50K', bgClass: 'bg-amber-500', borderClass: 'border-amber-700', textClass: 'text-slate-900' },
  { value: 100000, label: '100K', bgClass: 'bg-purple-600', borderClass: 'border-purple-800', textClass: 'text-white' },
  { value: 500000, label: '500K', bgClass: 'bg-slate-900', borderClass: 'border-amber-400', textClass: 'text-amber-300' },
];

interface ChipSelectorProps {
  selectedChip: number;
  onSelectChip: (value: number) => void;
  onClearBets: () => void;
  onDoubleBets: () => void;
  onRepeatBets: () => void;
  canRepeat: boolean;
  canClear: boolean;
  disabled?: boolean;
}

export const ChipSelector: React.FC<ChipSelectorProps> = ({
  selectedChip,
  onSelectChip,
  onClearBets,
  onDoubleBets,
  onRepeatBets,
  canRepeat,
  canClear,
  disabled = false,
}) => {
  return (
    <div className="bg-slate-800 text-white px-3 sm:px-6 py-2 flex flex-wrap items-center justify-between gap-2 border-t border-slate-700 shadow-md select-none">
      {/* Left: Quick Betting Actions */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* Clear (លុប) */}
        <button
          onClick={() => {
            playClickSound();
            onClearBets();
          }}
          disabled={disabled || !canClear}
          className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs sm:text-sm font-bold transition-all ${
            canClear && !disabled
              ? 'bg-rose-600 hover:bg-rose-700 text-white cursor-pointer active:scale-95'
              : 'bg-slate-700 text-slate-400 cursor-not-allowed opacity-60'
          }`}
          title="លុបការភ្នាល់ទាំងអស់"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>លុប</span>
        </button>

        {/* Double (ទ្វេដង) */}
        <button
          onClick={() => {
            playChipSound();
            onDoubleBets();
          }}
          disabled={disabled || !canClear}
          className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs sm:text-sm font-bold transition-all ${
            canClear && !disabled
              ? 'bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer active:scale-95'
              : 'bg-slate-700 text-slate-400 cursor-not-allowed opacity-60'
          }`}
          title="ទ្វេដងប្រាក់ភ្នាល់ (2x)"
        >
          <Copy className="w-3.5 h-3.5" />
          <span>ទ្វេដង</span>
        </button>

        {/* Repeat (ភ្នាល់ដដែល) */}
        <button
          onClick={() => {
            playChipSound();
            onRepeatBets();
          }}
          disabled={disabled || !canRepeat}
          className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs sm:text-sm font-bold transition-all ${
            canRepeat && !disabled
              ? 'bg-amber-600 hover:bg-amber-700 text-white cursor-pointer active:scale-95'
              : 'bg-slate-700 text-slate-400 cursor-not-allowed opacity-60'
          }`}
          title="ភ្នាល់ដដែលដូចវេនមុន"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>ភ្នាល់ដដែល</span>
        </button>
      </div>

      {/* Right: Casino Chips Row */}
      <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto py-1">
        <span className="text-xs text-slate-400 hidden md:inline font-semibold">
          ជ្រើសកាក់ (Chips):
        </span>

        {CHIP_OPTIONS.map((chip) => {
          const isSelected = selectedChip === chip.value;
          return (
            <button
              key={chip.value}
              onClick={() => {
                playChipSound();
                onSelectChip(chip.value);
              }}
              disabled={disabled}
              className={`relative rounded-full flex items-center justify-center font-black transition-all cursor-pointer shadow-md ${
                chip.bgClass
              } ${chip.textClass} border-2 sm:border-3 ${chip.borderClass} ${
                isSelected
                  ? 'w-10 h-10 sm:w-11 sm:h-11 ring-4 ring-yellow-400 scale-110 z-10'
                  : 'w-8 h-8 sm:w-9 sm:h-9 hover:scale-105 opacity-85 hover:opacity-100'
              }`}
            >
              <span className="text-[10px] sm:text-[11px] drop-shadow-sm">
                {chip.label}
              </span>

              {/* Classic notched casino chip edge markings */}
              <div className="absolute inset-0.5 rounded-full border border-dashed border-white/40 pointer-events-none" />
            </button>
          );
        })}
      </div>
    </div>
  );
};
