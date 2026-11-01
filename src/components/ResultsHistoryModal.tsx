import React from 'react';
import { RoundResult } from '../types/yuki';
import { X, Trophy, BarChart2 } from 'lucide-react';
import { playClickSound } from '../utils/audio';

interface ResultsHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  results: RoundResult[];
}

export const ResultsHistoryModal: React.FC<ResultsHistoryModalProps> = ({
  isOpen,
  onClose,
  results,
}) => {
  if (!isOpen) return null;

  // Calculate statistics
  const totalRounds = results.length;
  const smallCount = results.filter((r) => r.size === 'small').length;
  const bigCount = results.filter((r) => r.size === 'big').length;
  const redCount = results.filter((r) => r.color === 'red').length;
  const greenCount = results.filter((r) => r.color === 'green').length;
  const blueCount = results.filter((r) => r.color === 'blue').length;
  const oddCount = results.filter((r) => r.parity === 'odd').length;
  const evenCount = results.filter((r) => r.parity === 'even').length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in select-none">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[85vh] flex flex-col overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="bg-[#4667a9] text-white px-5 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-base">
            <Trophy className="w-5 h-5 text-amber-300" />
            <span>ប្រវត្តិ និងស្ថិតិនៃលទ្ធផល (Draw History & Analytics)</span>
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

        {/* Analytics Distribution Cards */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
          {/* Small vs Big */}
          <div className="bg-white p-2.5 rounded-lg border border-slate-200">
            <div className="flex items-center gap-1 font-bold text-slate-700 mb-1">
              <BarChart2 className="w-3.5 h-3.5 text-blue-500" />
              <span>តូច / ធំ</span>
            </div>
            <div className="flex justify-between font-bold">
              <span className="text-[#00b4d8]">
                តូច: {smallCount} ({totalRounds > 0 ? Math.round((smallCount / totalRounds) * 100) : 0}%)
              </span>
              <span className="text-[#ec4899]">
                ធំ: {bigCount} ({totalRounds > 0 ? Math.round((bigCount / totalRounds) * 100) : 0}%)
              </span>
            </div>
          </div>

          {/* Odd vs Even */}
          <div className="bg-white p-2.5 rounded-lg border border-slate-200">
            <div className="flex items-center gap-1 font-bold text-slate-700 mb-1">
              <BarChart2 className="w-3.5 h-3.5 text-orange-500" />
              <span>សេស / គូ</span>
            </div>
            <div className="flex justify-between font-bold">
              <span className="text-[#ea580c]">
                សេស: {oddCount} ({totalRounds > 0 ? Math.round((oddCount / totalRounds) * 100) : 0}%)
              </span>
              <span className="text-[#f59e0b]">
                គូ: {evenCount} ({totalRounds > 0 ? Math.round((evenCount / totalRounds) * 100) : 0}%)
              </span>
            </div>
          </div>

          {/* Color Breakdown */}
          <div className="col-span-2 bg-white p-2.5 rounded-lg border border-slate-200">
            <div className="flex items-center gap-1 font-bold text-slate-700 mb-1">
              <BarChart2 className="w-3.5 h-3.5 text-red-500" />
              <span>ពណ៌ (ក្រហម / បៃតង / ខៀវ)</span>
            </div>
            <div className="flex justify-between font-bold">
              <span className="text-[#dc2626]">
                ក្រហម: {redCount} ({totalRounds > 0 ? Math.round((redCount / totalRounds) * 100) : 0}%)
              </span>
              <span className="text-[#16a34a]">
                បៃតង: {greenCount} ({totalRounds > 0 ? Math.round((greenCount / totalRounds) * 100) : 0}%)
              </span>
              <span className="text-[#2563eb]">
                ខៀវ: {blueCount} ({totalRounds > 0 ? Math.round((blueCount / totalRounds) * 100) : 0}%)
              </span>
            </div>
          </div>
        </div>

        {/* Results Table */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="overflow-x-auto border border-slate-200 rounded-lg">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                <tr>
                  <th className="p-2.5">វេន (Round)</th>
                  <th className="p-2.5">ម៉ោង (Time)</th>
                  <th className="p-2.5 text-center">លេខឈ្នះ (Number)</th>
                  <th className="p-2.5">សត្វ (Zodiac Animal)</th>
                  <th className="p-2.5 text-center">តូច / ធំ</th>
                  <th className="p-2.5 text-center">ពណ៌ (Color)</th>
                  <th className="p-2.5 text-center">សេស / គូ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-medium">
                {results.map((res, idx) => (
                  <tr key={res.id || `${res.roundId}-${idx}`} className="hover:bg-slate-50">
                    <td className="p-2.5 font-bold text-slate-800">{res.roundId}</td>
                    <td className="p-2.5 text-slate-500">{res.fullDateTime || res.timestamp}</td>
                    <td className="p-2.5 text-center">
                      <span
                        className={`inline-block w-6 h-6 rounded-full font-black text-white text-center leading-6 text-xs shadow-xs ${
                          res.size === 'small' ? 'bg-[#00b4d8]' : 'bg-[#ec4899]'
                        }`}
                      >
                        {res.number}
                      </span>
                    </td>
                    <td className="p-2.5">
                      <span className="font-bold text-slate-800">
                        {res.animal.nameKhmer} ({res.animal.nameEnglish})
                      </span>
                    </td>
                    <td className="p-2.5 text-center">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold text-white ${
                          res.size === 'small' ? 'bg-[#00b4d8]' : 'bg-[#ec4899]'
                        }`}
                      >
                        {res.size === 'small' ? 'តូច (1-6)' : 'ធំ (7-12)'}
                      </span>
                    </td>
                    <td className="p-2.5 text-center">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold text-white ${
                          res.color === 'red'
                            ? 'bg-[#dc2626]'
                            : res.color === 'green'
                            ? 'bg-[#16a34a]'
                            : 'bg-[#2563eb]'
                        }`}
                      >
                        {res.color === 'red' ? 'ក្រហម' : res.color === 'green' ? 'បៃតង' : 'ខៀវ'}
                      </span>
                    </td>
                    <td className="p-2.5 text-center">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold text-white ${
                          res.parity === 'odd' ? 'bg-[#ea580c]' : 'bg-[#f59e0b]'
                        }`}
                      >
                        {res.parity === 'odd' ? 'សេស (Odd)' : 'គូ (Even)'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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
