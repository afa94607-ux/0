import React, { useState } from 'react';
import { SettledBetRecord } from '../types/yuki';
import { X, ArrowDownRight, ArrowUpRight, Filter } from 'lucide-react';
import { playClickSound } from '../utils/audio';

interface WinLossModalProps {
  isOpen: boolean;
  onClose: () => void;
  settledBets: SettledBetRecord[];
}

export const WinLossModal: React.FC<WinLossModalProps> = ({ isOpen, onClose, settledBets }) => {
  const [filter, setFilter] = useState<'all' | 'won' | 'lost'>('all');

  if (!isOpen) return null;

  const filteredBets = settledBets.filter((bet) => {
    if (filter === 'won') return bet.won;
    if (filter === 'lost') return !bet.won;
    return true;
  });

  const totalStaked = settledBets.reduce((sum, b) => sum + b.amount, 0);
  const totalPayout = settledBets.reduce((sum, b) => sum + (b.won ? b.payout : 0), 0);
  const netProfit = totalPayout - totalStaked;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in select-none">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[85vh] flex flex-col overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="bg-[#4667a9] text-white px-5 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-base">
            <span>របាយការណ៍ ឈ្នះចាញ់ (Win / Loss Statement)</span>
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

        {/* Summary Metrics */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 grid grid-cols-3 gap-3 text-center">
          <div className="bg-white p-3 rounded-lg border border-slate-200">
            <div className="text-xs text-slate-500 font-semibold">សរុបភ្នាល់ (Total Bets)</div>
            <div className="text-lg font-bold text-slate-800">{totalStaked.toLocaleString()}៛</div>
          </div>
          <div className="bg-white p-3 rounded-lg border border-slate-200">
            <div className="text-xs text-slate-500 font-semibold">សរុបឈ្នះ (Total Payout)</div>
            <div className="text-lg font-bold text-blue-600">{totalPayout.toLocaleString()}៛</div>
          </div>
          <div className="bg-white p-3 rounded-lg border border-slate-200">
            <div className="text-xs text-slate-500 font-semibold">ចំណេញ / ខាត (Net Profit)</div>
            <div
              className={`text-lg font-black flex items-center justify-center gap-1 ${
                netProfit >= 0 ? 'text-[#16a34a]' : 'text-red-600'
              }`}
            >
              {netProfit >= 0 ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownRight className="w-5 h-5" />}
              {netProfit.toLocaleString()}៛
            </div>
          </div>
        </div>

        {/* Filter bar */}
        <div className="px-5 py-2.5 bg-white border-b border-slate-200 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-semibold text-slate-600">ត្រងទិន្នន័យ (Filter):</span>
            <button
              onClick={() => setFilter('all')}
              className={`px-2.5 py-1 rounded-full font-bold cursor-pointer transition-colors ${
                filter === 'all' ? 'bg-[#4667a9] text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              ទាំងអស់ ({settledBets.length})
            </button>
            <button
              onClick={() => setFilter('won')}
              className={`px-2.5 py-1 rounded-full font-bold cursor-pointer transition-colors ${
                filter === 'won' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              ឈ្នះ ({settledBets.filter((b) => b.won).length})
            </button>
            <button
              onClick={() => setFilter('lost')}
              className={`px-2.5 py-1 rounded-full font-bold cursor-pointer transition-colors ${
                filter === 'lost' ? 'bg-rose-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              ចាញ់ ({settledBets.filter((b) => !b.won).length})
            </button>
          </div>
        </div>

        {/* Statement Table */}
        <div className="flex-1 overflow-y-auto p-4">
          {filteredBets.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-sm">
              មិនទាន់មានកំណត់ត្រាភ្នាល់នៅឡើយទេ
            </div>
          ) : (
            <div className="overflow-x-auto border border-slate-200 rounded-lg">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-2.5">វេន / ម៉ោង</th>
                    <th className="p-2.5">ប្រភេទភ្នាល់</th>
                    <th className="p-2.5 text-right">ទឹកប្រាក់ភ្នាល់</th>
                    <th className="p-2.5 text-center">អត្រា</th>
                    <th className="p-2.5 text-center">លទ្ធផលចេញ</th>
                    <th className="p-2.5 text-right">ទឹកប្រាក់សង</th>
                    <th className="p-2.5 text-center">ស្ថានភាព</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 font-medium">
                  {filteredBets.map((bet) => (
                    <tr key={bet.id} className="hover:bg-slate-50">
                      <td className="p-2.5">
                        <span className="font-bold text-slate-800">{bet.roundId}</span>
                        <span className="text-slate-400 block text-[10px]">{bet.time}</span>
                      </td>
                      <td className="p-2.5 font-bold text-slate-800">{bet.labelKhmer}</td>
                      <td className="p-2.5 text-right font-bold text-slate-700">
                        {bet.amount.toLocaleString()}៛
                      </td>
                      <td className="p-2.5 text-center">{bet.odds}</td>
                      <td className="p-2.5 text-center">
                        <span className="font-bold text-slate-800">
                          {bet.winningAnimalKhmer} ({bet.winningNumber})
                        </span>
                      </td>
                      <td className="p-2.5 text-right font-bold">
                        {bet.won ? (
                          <span className="text-[#16a34a]">+{bet.payout.toLocaleString()}៛</span>
                        ) : (
                          <span className="text-slate-400">0៛</span>
                        )}
                      </td>
                      <td className="p-2.5 text-center">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            bet.won ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {bet.won ? 'ឈ្នះ' : 'ចាញ់'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={() => {
              playClickSound();
              onClose();
            }}
            className="bg-[#4667a9] hover:bg-[#3b5998] text-white font-bold px-5 py-1.5 rounded-lg text-sm cursor-pointer"
          >
            បិទ (Close)
          </button>
        </div>
      </div>
    </div>
  );
};
