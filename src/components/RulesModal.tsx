import { X, BookOpen, ShieldCheck, Volume2 } from 'lucide-react';
import { playClickSound, playKhmerVoiceAudio, KHMER_COUNTDOWN_WORDS, KHMER_BLESSING } from '../utils/audio';

interface RulesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RulesModal: React.FC<RulesModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in select-none">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="bg-[#4667a9] text-white px-5 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-base">
            <BookOpen className="w-5 h-5 text-amber-300" />
            <span>ច្បាប់នៃការលេង យូគី ១២ (YUKI 12 Rules & Payouts)</span>
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

        {/* Scrollable Body */}
        <div className="p-5 space-y-4 overflow-y-auto text-sm text-slate-700">
          <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg flex items-start gap-2.5">
            <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-blue-900">អំពីហ្គេម យូគី ១២ (About YUKI 12)</h4>
              <p className="text-xs text-blue-800 mt-0.5">
                យូគី ១២ គឺជាហ្គេមឆ្នោតប្រពៃណីដែលមានសត្វទាំង ១២ នៃក្បួនរាសីចក្រខ្មែរ (លេខ ១ ដល់ ១២)។ ក្នុងមួយវេនមានរយៈពេលកំណត់ (Countdown) ហើយលទ្ធផលត្រូវបានបើកបង្ហាញតាមរយៈថូ ឬដុំមាសសំណាង។
              </p>
            </div>
          </div>

          {/* Odds Table */}
          <div>
            <h4 className="font-bold text-slate-800 text-sm mb-2 border-b pb-1">
              តារាងអត្រាសង (Payout Multipliers)
            </h4>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse border border-slate-200 text-xs">
                <thead>
                  <tr className="bg-slate-100 text-slate-800">
                    <th className="border border-slate-200 p-2 font-bold">ជម្រើសភ្នាល់ (Bet Type)</th>
                    <th className="border border-slate-200 p-2 font-bold">លេខត្រូវ (Numbers)</th>
                    <th className="border border-slate-200 p-2 font-bold">អត្រាសង (Rate)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  <tr>
                    <td className="p-2 font-bold text-slate-800">តូច (Small)</td>
                    <td className="p-2">លេខ 1, 2, 3, 4, 5, 6</td>
                    <td className="p-2 font-bold text-blue-600">1 : 1.95</td>
                  </tr>
                  <tr>
                    <td className="p-2 font-bold text-slate-800">ធំ (Big)</td>
                    <td className="p-2">លេខ 7, 8, 9, 10, 11, 12</td>
                    <td className="p-2 font-bold text-pink-600">1 : 1.95</td>
                  </tr>
                  <tr>
                    <td className="p-2 font-bold text-slate-800">សេស (Odd)</td>
                    <td className="p-2">លេខ 1, 3, 5, 7, 9, 11</td>
                    <td className="p-2 font-bold text-orange-600">1 : 1.95</td>
                  </tr>
                  <tr>
                    <td className="p-2 font-bold text-slate-800">គូ (Even)</td>
                    <td className="p-2">លេខ 2, 4, 6, 8, 10, 12</td>
                    <td className="p-2 font-bold text-amber-600">1 : 1.95</td>
                  </tr>
                  <tr className="bg-red-50/50">
                    <td className="p-2 font-bold text-red-600">ក្រហម (Red)</td>
                    <td className="p-2">លេខ 1, 4, 7, 10</td>
                    <td className="p-2 font-bold text-red-600">1 : 2.95</td>
                  </tr>
                  <tr className="bg-emerald-50/50">
                    <td className="p-2 font-bold text-emerald-600">បៃតង (Green)</td>
                    <td className="p-2">លេខ 2, 5, 8, 11</td>
                    <td className="p-2 font-bold text-emerald-600">1 : 2.95</td>
                  </tr>
                  <tr className="bg-blue-50/50">
                    <td className="p-2 font-bold text-blue-600">ខៀវ (Blue)</td>
                    <td className="p-2">លេខ 3, 6, 9, 12</td>
                    <td className="p-2 font-bold text-blue-600">1 : 2.95</td>
                  </tr>
                  <tr className="bg-yellow-50/70">
                    <td className="p-2 font-bold text-slate-900">សត្វទោល/លេខទោល (Single Animal 1-12)</td>
                    <td className="p-2">លេខណាដែលអ្នកជ្រើសរើស (1 ដល់ 12)</td>
                    <td className="p-2 font-black text-amber-700">1 : 11.00</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* 12 Animals Reference */}
          <div>
            <h4 className="font-bold text-slate-800 text-sm mb-2 border-b pb-1">
              សត្វទាំង ១២ (The 12 Zodiac Animals)
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
              <div className="p-2 rounded bg-red-50 border border-red-200">
                <span className="font-bold text-red-700">1. ជូត (Rat)</span> - ក្រហម, តូច, សេស
              </div>
              <div className="p-2 rounded bg-green-50 border border-green-200">
                <span className="font-bold text-green-700">2. ឆ្លូវ (Ox)</span> - បៃតង, តូច, គូ
              </div>
              <div className="p-2 rounded bg-blue-50 border border-blue-200">
                <span className="font-bold text-blue-700">3. ខាល (Tiger)</span> - ខៀវ, តូច, សេស
              </div>
              <div className="p-2 rounded bg-red-50 border border-red-200">
                <span className="font-bold text-red-700">4. ថោះ (Rabbit)</span> - ក្រហម, តូច, គូ
              </div>
              <div className="p-2 rounded bg-green-50 border border-green-200">
                <span className="font-bold text-green-700">5. រោង (Dragon)</span> - បៃតង, តូច, សេស
              </div>
              <div className="p-2 rounded bg-blue-50 border border-blue-200">
                <span className="font-bold text-blue-700">6. ម្សាញ់ (Snake)</span> - ខៀវ, តូច, គូ
              </div>
              <div className="p-2 rounded bg-red-50 border border-red-200">
                <span className="font-bold text-red-700">7. មមី (Horse)</span> - ក្រហម, ធំ, សេស
              </div>
              <div className="p-2 rounded bg-green-50 border border-green-200">
                <span className="font-bold text-green-700">8. មមែ (Goat)</span> - បៃតង, ធំ, គូ
              </div>
              <div className="p-2 rounded bg-blue-50 border border-blue-200">
                <span className="font-bold text-blue-700">9. វក (Monkey)</span> - ខៀវ, ធំ, សេស
              </div>
              <div className="p-2 rounded bg-red-50 border border-red-200">
                <span className="font-bold text-red-700">10. រកា (Rooster)</span> - ក្រហម, ធំ, គូ
              </div>
              <div className="p-2 rounded bg-green-50 border border-green-200">
                <span className="font-bold text-green-700">11. ច (Dog)</span> - បៃតង, ធំ, សេស
              </div>
              <div className="p-2 rounded bg-blue-50 border border-blue-200">
                <span className="font-bold text-blue-700">12. កុរ (Pig)</span> - ខៀវ, ធំ, គូ
              </div>
            </div>
          </div>
          <div className="bg-amber-50/70 border border-amber-200 p-3.5 rounded-lg space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-amber-700" />
                <h4 className="font-bold text-amber-950 text-xs sm:text-sm">
                  សាកល្បងសំឡេងខ្មែរពិតប្រាកដ (Preview Native Khmer Human Voice)
                </h4>
              </div>
              <span className="text-[11px] bg-amber-200/80 text-amber-900 font-semibold px-2 py-0.5 rounded">
                100% Khmer Human Voice
              </span>
            </div>
            <p className="text-[11px] text-amber-900/80">
              ចុចប៊ូតុងខាងក្រោមដើម្បីស្តាប់សំឡេងរាប់ថយក្រោយ (១០ ដល់ ១) និងពាក្យជូនពរសំណាងល្អ ជាភាសាខ្មែរសុទ្ធសាធពីមនុស្សពិត៖
            </p>

            <div className="flex flex-wrap gap-1.5 pt-1">
              {[10, 9, 8, 7, 6, 5, 4, 3, 2, 1].map((n) => {
                const info = KHMER_COUNTDOWN_WORDS[n];
                return (
                  <button
                    key={n}
                    type="button"
                    onClick={() => playKhmerVoiceAudio(n)}
                    className="flex items-center gap-1 bg-white hover:bg-amber-100 active:scale-95 text-slate-800 border border-amber-300 font-medium px-2 py-1 rounded text-xs shadow-2xs transition-all cursor-pointer"
                  >
                    <span className="font-black text-amber-700">{n}:</span>
                    <span className="font-bold text-slate-900">«{info?.text}»</span>
                  </button>
                );
              })}
              <button
                type="button"
                onClick={() => playKhmerVoiceAudio('blessing')}
                className="flex items-center gap-1.5 bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-700 hover:to-yellow-700 active:scale-95 text-white font-bold px-3 py-1 rounded text-xs shadow-xs transition-all cursor-pointer ml-auto"
              >
                <span>✨ ជូនពរ:</span>
                <span>«{KHMER_BLESSING.text}»</span>
              </button>
            </div>
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
            យល់ព្រម (Got it)
          </button>
        </div>
      </div>
    </div>
  );
};
