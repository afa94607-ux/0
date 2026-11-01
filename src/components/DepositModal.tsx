import React, { useState } from 'react';
import { X, Wallet, CheckCircle, RefreshCw } from 'lucide-react';
import { playClickSound, playWinSound } from '../utils/audio';

interface DepositModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentBalance: number;
  onAddBalance: (amount: number) => void;
  onResetBalance: () => void;
}

export const DepositModal: React.FC<DepositModalProps> = ({
  isOpen,
  onClose,
  currentBalance,
  onAddBalance,
  onResetBalance,
}) => {
  const [customAmount, setCustomAmount] = useState<string>('');

  if (!isOpen) return null;

  const quickAmounts = [50000, 100000, 500000, 1000000, 2000000];

  const handleDeposit = (amt: number) => {
    playWinSound();
    onAddBalance(amt);
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseInt(customAmount.replace(/\D/g, ''), 10);
    if (!isNaN(val) && val > 0) {
      handleDeposit(val);
      setCustomAmount('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="bg-[#4667a9] text-white px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-base">
            <Wallet className="w-5 h-5 text-amber-300" />
            <span>គ្រប់គ្រងសមតុល្យ (Balance Manager)</span>
          </div>
          <button
            onClick={() => {
              playClickSound();
              onClose();
            }}
            className="text-white/80 hover:text-white p-1 rounded hover:bg-white/10 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          {/* Current Balance Display */}
          <div className="bg-slate-50 border border-slate-200 p-4 rounded-lg flex items-center justify-between">
            <span className="text-slate-600 font-medium text-sm">
              សមតុល្យបច្ចុប្បន្ន (Current Balance):
            </span>
            <span className="font-extrabold text-2xl text-[#16a34a]">
              {currentBalance.toLocaleString()}៛
            </span>
          </div>

          {/* Quick Top-up Buttons */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              បន្ថែមប្រាក់រហ័ស (Quick Top-Up)
            </label>
            <div className="grid grid-cols-3 gap-2">
              {quickAmounts.map((amt) => (
                <button
                  key={amt}
                  onClick={() => handleDeposit(amt)}
                  className="bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 font-bold py-2 px-3 rounded-lg text-sm transition-all hover:scale-102 active:scale-95 cursor-pointer shadow-xs"
                >
                  +{amt.toLocaleString()}៛
                </button>
              ))}
            </div>
          </div>

          {/* Custom Amount Input */}
          <form onSubmit={handleCustomSubmit} className="space-y-2">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              បញ្ចូលចំនួនទឹកប្រាក់ផ្សេងទៀត (Custom Amount)
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                placeholder="ឧ. 250000"
                value={customAmount}
                onChange={(e) => setCustomAmount(e.target.value)}
                className="flex-1 border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-medium"
              />
              <button
                type="submit"
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 rounded-lg text-sm flex items-center gap-1 transition-all cursor-pointer shadow-xs active:scale-95"
              >
                <CheckCircle className="w-4 h-4" />
                <span>បន្ថែម</span>
              </button>
            </div>
          </form>

          {/* Reset Balance */}
          <div className="pt-2 border-t border-slate-200 flex justify-between items-center">
            <button
              onClick={() => {
                playClickSound();
                onResetBalance();
              }}
              className="text-xs text-rose-600 hover:text-rose-800 font-bold flex items-center gap-1 cursor-pointer p-1"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>កំណត់សមតុល្យដើមឡើងវិញ (Reset to 500,000៛)</span>
            </button>
            <button
              onClick={() => {
                playClickSound();
                onClose();
              }}
              className="bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold px-4 py-1.5 rounded-lg text-sm cursor-pointer"
            >
              បិទ (Close)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
