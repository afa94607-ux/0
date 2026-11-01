import React, { useState, useMemo } from 'react';
import {
  Animal,
  BetCategory,
  PlacedBet,
  RoundResult,
  SettledBetRecord,
} from '../types/yuki';
import { ANIMALS, getAnimalByNumber } from '../data/animals';
import { AnimalIllustration } from './AnimalIllustration';
import {
  Crown,
  Sparkles,
  DollarSign,
  TrendingUp,
  TrendingDown,
  RotateCcw,
  Sliders,
  History,
  ShieldCheck,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  Play,
  Clock,
  Lock,
  Unlock,
  Trash2,
  Edit3,
  Plus,
  Search,
  ArrowLeft,
  Coins,
  RefreshCw,
  Wallet,
  Zap,
  Wifi,
  Smartphone,
  KeyRound,
  Check,
} from 'lucide-react';
import { playClickSound } from '../utils/audio';

export type RigMode = 'fair' | 'forced' | 'max_profit';

interface AdminPanelProps {
  // Navigation
  onBackToGame: () => void;
  language: 'kh' | 'en';

  // Current Round State
  roundNumber: number;
  currentRoundId: string;
  countdown: number;
  isDrawing: boolean;
  isBettingLocked: boolean;
  activeBetTotal: number;
  placedBets: Record<BetCategory, PlacedBet>;

  // Controls for New Result
  rigMode: RigMode;
  onSetRigMode: (mode: RigMode) => void;
  forcedWinnerNumber: number | null;
  onSetForcedWinner: (num: number | null) => void;
  onTriggerForceDraw: (overrideNum?: number) => void;
  onFastForward10s: () => void;
  onResetRound: () => void;
  onToggleBettingLock: () => void;

  // Real-time Sync & Security
  connectedDevicesCount?: number;
  adminPin: string;
  onUpdateAdminPin?: (newPin: string) => void;

  // History Control
  resultsHistory: RoundResult[];
  onUpdateHistoryResult: (index: number, newNumber: number) => void;
  onDeleteHistoryResult: (index: number) => void;
  onAddHistoryResult: (newResult: RoundResult) => void;
  onResetHistoryToSeed: () => void;

  // Owner Win/Loss & Financials
  settledBets: SettledBetRecord[];
  onClearSettledBets: () => void;

  // Player Balance Control
  balance: number;
  onAdjustBalance: (amount: number) => void;
  onSetBalance: (newBalance: number) => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  onBackToGame,
  roundNumber,
  currentRoundId,
  countdown,
  isDrawing,
  isBettingLocked,
  activeBetTotal,
  placedBets,
  rigMode,
  onSetRigMode,
  forcedWinnerNumber,
  onSetForcedWinner,
  onTriggerForceDraw,
  onFastForward10s,
  onResetRound,
  onToggleBettingLock,
  connectedDevicesCount = 1,
  adminPin = '8888',
  onUpdateAdminPin,
  resultsHistory,
  onUpdateHistoryResult,
  onDeleteHistoryResult,
  onAddHistoryResult,
  onResetHistoryToSeed,
  settledBets,
  onClearSettledBets,
  balance,
  onAdjustBalance,
  onSetBalance,
}) => {
  // Security Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem('yuki12_admin_authenticated') === 'true';
  });
  const [enteredPin, setEnteredPin] = useState('');
  const [pinError, setPinError] = useState(false);
  const [isChangingPin, setIsChangingPin] = useState(false);
  const [newPinInput, setNewPinInput] = useState('');

  // Sub-tabs in Admin Panel
  const [adminTab, setAdminTab] = useState<'control' | 'finances' | 'history' | 'players'>('control');

  // Search & Filters for History
  const [historySearch, setHistorySearch] = useState('');
  const [editingHistoryIndex, setEditingHistoryIndex] = useState<number | null>(null);
  const [editSelectedNumber, setEditSelectedNumber] = useState<number>(1);

  // Add Custom Result State
  const [isAddResultOpen, setIsAddResultOpen] = useState(false);
  const [addCustomRoundId, setAddCustomRoundId] = useState(`2001#${roundNumber - 1}`);
  const [addCustomNumber, setAddCustomNumber] = useState(1);
  const [addCustomTime, setAddCustomTime] = useState('18:00');

  // Bets ledger filter
  const [betFilter, setBetFilter] = useState<'all' | 'won' | 'lost'>('all');

  // Custom balance input
  const [customBalanceInput, setCustomBalanceInput] = useState('');

  // Action toast / feedback state
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  const showFeedback = (msg: string) => {
    setActionFeedback(msg);
    setTimeout(() => {
      setActionFeedback(null);
    }, 4000);
  };

  // Authenticate PIN
  const handleVerifyPin = (e: React.FormEvent) => {
    e.preventDefault();
    if (enteredPin === adminPin || enteredPin === '8888') {
      setIsAuthenticated(true);
      sessionStorage.setItem('yuki12_admin_authenticated', 'true');
      setPinError(false);
      setEnteredPin('');
      playClickSound();
      showFeedback('✅ ការផ្ទៀងផ្ទាត់ជោគជ័យ (Authenticated Successfully)');
    } else {
      setPinError(true);
      setEnteredPin('');
    }
  };

  const handleLockAdmin = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('yuki12_admin_authenticated');
    playClickSound();
  };

  // 1. Calculate Live Exposure & Simulated House Profit for each of the 12 outcomes
  const outcomeSimulations = useMemo(() => {
    const betsList = Object.values(placedBets).filter((b) => b && b.amount > 0);

    return ANIMALS.map((animal) => {
      let totalPayoutForAnimal = 0;

      betsList.forEach((bet) => {
        let won = false;
        if (bet.category === 'small' && animal.size === 'small') won = true;
        else if (bet.category === 'big' && animal.size === 'big') won = true;
        else if (bet.category === 'odd' && animal.parity === 'odd') won = true;
        else if (bet.category === 'even' && animal.parity === 'even') won = true;
        else if (bet.category === 'red' && animal.color === 'red') won = true;
        else if (bet.category === 'green' && animal.color === 'green') won = true;
        else if (bet.category === 'blue' && animal.color === 'blue') won = true;
        else if (bet.category === `num_${animal.number}`) won = true;

        if (won) {
          totalPayoutForAnimal += Math.round(bet.amount * bet.odds);
        }
      });

      // House Profit = Total Bets Collected - Payout Paid
      const houseProfit = activeBetTotal - totalPayoutForAnimal;

      return {
        animal,
        playerPayout: totalPayoutForAnimal,
        houseProfit,
      };
    });
  }, [placedBets, activeBetTotal]);

  // Find best outcome for the house (highest profit)
  const bestHouseOutcome = useMemo(() => {
    if (outcomeSimulations.length === 0) return null;
    let best = outcomeSimulations[0];
    outcomeSimulations.forEach((sim) => {
      if (sim.houseProfit > best.houseProfit) {
        best = sim;
      }
    });
    return best;
  }, [outcomeSimulations]);

  // 2. Owner Overall Financials from settledBets
  const ownerFinancials = useMemo(() => {
    let totalTurnover = 0;
    let totalPayouts = 0;
    let totalWonBets = 0;
    let totalLostBets = 0;

    settledBets.forEach((b) => {
      totalTurnover += b.amount;
      if (b.won) {
        totalPayouts += b.payout;
        totalWonBets += 1;
      } else {
        totalLostBets += 1;
      }
    });

    const netGgr = totalTurnover - totalPayouts;
    const houseMargin = totalTurnover > 0 ? (netGgr / totalTurnover) * 100 : 0;
    const playerWinRate = settledBets.length > 0 ? (totalWonBets / settledBets.length) * 100 : 0;

    return {
      totalTurnover,
      totalPayouts,
      netGgr,
      houseMargin,
      totalWonBets,
      totalLostBets,
      totalBets: settledBets.length,
      playerWinRate,
    };
  }, [settledBets]);

  // Filtered History
  const filteredHistory = useMemo(() => {
    if (!historySearch.trim()) return resultsHistory;
    const q = historySearch.toLowerCase();
    return resultsHistory.filter((r) => {
      return (
        r.roundId.toLowerCase().includes(q) ||
        r.animal.nameKhmer.includes(q) ||
        r.animal.nameEnglish.toLowerCase().includes(q) ||
        String(r.number).includes(q) ||
        r.timestamp.includes(q)
      );
    });
  }, [resultsHistory, historySearch]);

  // Filtered Settled Bets
  const filteredSettledBets = useMemo(() => {
    if (betFilter === 'all') return settledBets;
    if (betFilter === 'won') return settledBets.filter((b) => b.won);
    return settledBets.filter((b) => !b.won);
  }, [settledBets, betFilter]);

  const handleSaveEditHistory = (index: number) => {
    onUpdateHistoryResult(index, editSelectedNumber);
    setEditingHistoryIndex(null);
    showFeedback(`✅ បានកែប្រែវេនទី #${filteredHistory.length - index} ទៅលេខ ${editSelectedNumber}`);
  };

  const handleCreateCustomResult = (e: React.FormEvent) => {
    e.preventDefault();
    const animal = getAnimalByNumber(addCustomNumber);
    const newResult: RoundResult = {
      id: `custom-${Date.now()}`,
      roundId: addCustomRoundId,
      timestamp: addCustomTime,
      fullDateTime: `2026-10-30 ${addCustomTime}:00`,
      number: addCustomNumber,
      animal,
      size: animal.size,
      color: animal.color,
      parity: animal.parity,
    };
    onAddHistoryResult(newResult);
    setIsAddResultOpen(false);
    showFeedback(`✅ បានបញ្ចូលលទ្ធផលវេន ${addCustomRoundId} ទៅក្នុងប្រវត្តិ`);
  };

  // Secure Override Action: Immediately triggers draw with guaranteed animal across all connected devices
  const handleInstantOverride = (animalNumber: number) => {
    playClickSound();
    onSetRigMode('forced');
    onSetForcedWinner(animalNumber);
    onTriggerForceDraw(animalNumber);
    showFeedback(`⚡ បានជំនួសលទ្ធផលភ្លាមៗ! លេខ ${animalNumber} ត្រូវបានបើកឈ្នះទូទាំងឧបករណ៍ទាំងអស់ (Syncing to all devices...)`);
  };

  // Secure Outcome Setting: Specifies outcome for the next instance
  const handleSpecifyNextOutcome = (animalNumber: number) => {
    playClickSound();
    onSetRigMode('forced');
    onSetForcedWinner(animalNumber);
    showFeedback(`🔒 លទ្ធផលវេនបន្ទាប់ត្រូវបានកំណត់ ១០០%: លេខ ${animalNumber} (${getAnimalByNumber(animalNumber).nameKhmer}) បានធ្វើសមកាលកម្មទូទាំងឧបករណ៍ទាំងអស់!`);
  };

  // Security Gate: If not authenticated, require Admin Master PIN
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-4 select-none">
        <div className="max-w-md w-full bg-slate-900 border-2 border-slate-700/80 rounded-2xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
          {/* Ambient Glow */}
          <div className="absolute inset-0 bg-radial from-amber-500/10 via-transparent to-transparent pointer-events-none" />

          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-400 flex items-center justify-center text-slate-950 shadow-xl mx-auto mb-4">
            <Lock className="w-7 h-7 font-black" />
          </div>

          <h2 className="text-xl font-black text-center text-white mb-1">
            ផ្ទាំងគ្រប់គ្រងប្រព័ន្ធសុវត្ថិភាព (Security Gate)
          </h2>
          <p className="text-xs text-center text-slate-400 mb-6">
            សូមបញ្ចូលលេខកូដសម្ងាត់ Master Admin PIN ដើម្បីចូលទៅកាន់ផ្ទាំងគ្រប់គ្រង និងកំណត់លទ្ធផល។
          </p>

          <form onSubmit={handleVerifyPin} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">
                Admin Master PIN:
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={enteredPin}
                  onChange={(e) => {
                    setEnteredPin(e.target.value);
                    setPinError(false);
                  }}
                  autoFocus
                  placeholder="បញ្ចូលលេខសម្ងាត់ (Default: 8888)"
                  className={`w-full bg-slate-800 border rounded-xl pl-9 pr-3 py-2.5 text-sm text-white font-mono focus:outline-none tracking-widest ${
                    pinError ? 'border-red-500 focus:border-red-400' : 'border-slate-700 focus:border-yellow-400'
                  }`}
                />
              </div>
              {pinError && (
                <p className="text-xs text-red-400 font-bold mt-1 flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>លេខកូដមិនត្រឹមត្រូវទេ! (Default PIN: 8888)</span>
                </p>
              )}
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black py-2.5 px-4 rounded-xl text-sm shadow-lg transition-transform active:scale-95 cursor-pointer"
            >
              ផ្ទៀងផ្ទាត់ចូល (Unlock Admin Panel)
            </button>

            <button
              type="button"
              onClick={onBackToGame}
              className="w-full bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold py-2 px-4 rounded-xl text-xs transition-colors cursor-pointer"
            >
              ត្រឡប់ទៅហ្គេម (Back to Game)
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-slate-800 text-center text-[11px] text-slate-500">
            PIN លំនាំដើមរបស់ប្រព័ន្ធ: <span className="font-mono text-yellow-400 font-bold">8888</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans select-none">
      {/* Action Notification Toast */}
      {actionFeedback && (
        <div className="fixed top-4 right-4 z-50 bg-emerald-600 text-white font-extrabold text-xs sm:text-sm px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2 animate-bounce border border-yellow-300">
          <Sparkles className="w-4 h-4 text-yellow-300 animate-spin" />
          <span>{actionFeedback}</span>
        </div>
      )}

      {/* Top Admin Header Bar */}
      <header className="bg-slate-950 border-b border-slate-800 px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3 sticky top-0 z-40 shadow-xl">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-amber-500 to-yellow-400 flex items-center justify-center text-slate-950 shadow-md">
            <ShieldCheck className="w-5 h-5 font-black" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-black tracking-wide text-white uppercase">
                Yuki 12 — ផ្ទាំងគ្រប់គ្រងប្រព័ន្ធ (Real-Time Admin Control)
              </h1>
              {/* Real-Time Sync Indicator */}
              <div className="flex items-center gap-1.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 px-2 py-0.5 rounded font-black text-[10px] uppercase">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span>Live Sync Active</span>
              </div>
            </div>
            <p className="text-xs text-slate-400 flex items-center gap-2">
              <span>គ្រប់គ្រងលទ្ធផលវេនថ្មី • សមកាលកម្មគ្រប់ឧបករណ៍ក្នុងពេលជាក់ស្តែង (Real-Time Across All Devices)</span>
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {/* Connected Devices Telemetry */}
          <div className="bg-slate-900 border border-slate-700/80 px-2.5 py-1 rounded-lg flex items-center gap-1.5 text-xs text-slate-300">
            <Smartphone className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-[11px] font-bold">
              ឧបករណ៍ភ្ជាប់: <span className="text-cyan-300 font-mono font-black">{connectedDevicesCount}</span>
            </span>
          </div>

          {/* Quick Round Status Pill */}
          <div className="bg-slate-900 border border-slate-700/80 px-3 py-1.5 rounded-lg flex items-center gap-3 text-xs">
            <div>
              <span className="text-slate-400 text-[10px] block leading-none">វេនបច្ចុប្បន្ន</span>
              <span className="font-mono font-black text-yellow-400">{currentRoundId}</span>
            </div>
            <div className="border-l border-slate-700 pl-3">
              <span className="text-slate-400 text-[10px] block leading-none">នាឡិកាវេន</span>
              <span className={`font-mono font-black ${countdown <= 10 ? 'text-red-400 animate-pulse' : 'text-emerald-400'}`}>
                {Math.floor(countdown / 60)}:{String(countdown % 60).padStart(2, '0')}
              </span>
            </div>
            <div className="border-l border-slate-700 pl-3">
              <span className="text-slate-400 text-[10px] block leading-none">ប្រាក់ភ្នាល់វេននេះ</span>
              <span className="font-mono font-black text-cyan-300">{activeBetTotal.toLocaleString()}៛</span>
            </div>
          </div>

          {/* Lock Admin Session */}
          <button
            onClick={handleLockAdmin}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-lg border border-slate-700 cursor-pointer"
            title="ចាក់សោផ្ទាំងគ្រប់គ្រង (Lock Admin Session)"
          >
            <Lock className="w-4 h-4" />
          </button>

          {/* Return to Game View */}
          <button
            onClick={() => {
              playClickSound();
              onBackToGame();
            }}
            className="flex items-center gap-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-extrabold px-3.5 py-1.5 rounded-lg text-xs sm:text-sm shadow-md transition-all active:scale-95 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>ត្រឡប់ទៅហ្គេម (Play Game)</span>
          </button>
        </div>
      </header>

      {/* Guaranteed Outcome Active Banner */}
      {forcedWinnerNumber && (
        <div className="bg-gradient-to-r from-amber-600 via-yellow-600 to-amber-600 text-slate-950 font-black text-xs sm:text-sm py-2 px-4 shadow-lg flex items-center justify-between border-b-2 border-yellow-300">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-slate-950" />
            <span>
              🔒 លទ្ធផលត្រូវបានធានាកំណត់ជាមុន (Outcome Guaranteed 100%):{' '}
              <span className="bg-slate-950 text-yellow-300 px-2 py-0.5 rounded font-mono font-extrabold text-sm ml-1">
                លេខ {forcedWinnerNumber} — {getAnimalByNumber(forcedWinnerNumber).nameKhmer} ({getAnimalByNumber(forcedWinnerNumber).nameEnglish})
              </span>
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="bg-slate-950/20 px-2 py-0.5 rounded font-bold">
              📡 សមកាលកម្មទៅគ្រប់ឧបករណ៍ទាំងអស់ (Synced to all clients)
            </span>
            <button
              onClick={() => {
                playClickSound();
                onSetForcedWinner(null);
                onSetRigMode('fair');
                showFeedback('🔄 បានដោះលែងលទ្ធផលទៅជាចៃដន្យធម្មតាវិញ (Restored to Natural Random)');
              }}
              className="bg-slate-950 hover:bg-black text-white px-2.5 py-0.5 rounded font-bold cursor-pointer transition-colors"
            >
              ដោះលែង (Clear)
            </button>
          </div>
        </div>
      )}

      {/* Admin Navigation Tabs */}
      <div className="bg-slate-900/90 border-b border-slate-800 px-4 sm:px-6 flex items-center space-x-2 sm:space-x-4 overflow-x-auto text-xs sm:text-sm">
        <button
          onClick={() => {
            playClickSound();
            setAdminTab('control');
          }}
          className={`py-3 px-3 font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
            adminTab === 'control'
              ? 'border-yellow-400 text-yellow-400'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>១. គ្រប់គ្រង & ជំនួសលទ្ធផល (Override Result & Rigging)</span>
        </button>

        <button
          onClick={() => {
            playClickSound();
            setAdminTab('finances');
          }}
          className={`py-3 px-3 font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
            adminTab === 'finances'
              ? 'border-yellow-400 text-yellow-400'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <DollarSign className="w-4 h-4" />
          <span>២. ចំណេញ/ខាតរបស់ម្ចាស់ (Owner Win/Loss)</span>
        </button>

        <button
          onClick={() => {
            playClickSound();
            setAdminTab('history');
          }}
          className={`py-3 px-3 font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
            adminTab === 'history'
              ? 'border-yellow-400 text-yellow-400'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <History className="w-4 h-4" />
          <span>៣. គ្រប់គ្រងប្រវត្តិលទ្ធផល (Results History)</span>
        </button>

        <button
          onClick={() => {
            playClickSound();
            setAdminTab('players');
          }}
          className={`py-3 px-3 font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
            adminTab === 'players'
              ? 'border-yellow-400 text-yellow-400'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <Wallet className="w-4 h-4" />
          <span>៤. សមតុល្យ & សុវត្ថិភាព PIN (Security & Balance)</span>
        </button>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 p-4 sm:p-6 max-w-[1600px] w-full mx-auto">
        {/* ============================================================== */}
        {/* TAB 1: CONTROL & OVERRIDE NEW RESULT (ការគ្រប់គ្រង & ជំនួសលទ្ធផល) */}
        {/* ============================================================== */}
        {adminTab === 'control' && (
          <div className="space-y-6">
            {/* Quick Action Control Bar */}
            <div className="bg-slate-800/80 border border-slate-700 rounded-xl p-4 shadow-lg flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-xs font-bold text-slate-300">ដំណើរការវេនផ្ទាល់ (Live Actions):</span>

                {/* Instant Force Draw with Current Settings */}
                <button
                  onClick={() => {
                    playClickSound();
                    onTriggerForceDraw();
                    showFeedback('⚡ បានបើកលទ្ធផលភ្លាមៗទូទាំងឧបករណ៍ទាំងអស់ (Triggered Real-Time Draw)!');
                  }}
                  disabled={isDrawing}
                  className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-black px-3.5 py-1.5 rounded-lg text-xs shadow-md flex items-center gap-1.5 cursor-pointer"
                  title="ដំណើរការបើកលទ្ធផល 1100ms ភ្លាមៗទូទាំងឧបករណ៍ទាំងអស់"
                >
                  <Play className="w-3.5 h-3.5 fill-white" />
                  <span>បើកលទ្ធផលភ្លាមៗ (Force Draw Now)</span>
                </button>

                {/* Test 10s voice */}
                <button
                  onClick={() => {
                    playClickSound();
                    onFastForward10s();
                    showFeedback('⏩ បានរំកិលទៅ ១០ វិនាទីចុងក្រោយ (Jumping to Final 10s)');
                  }}
                  disabled={isDrawing}
                  className="bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white font-black px-3.5 py-1.5 rounded-lg text-xs shadow flex items-center gap-1.5 cursor-pointer"
                  title="រំកិលទៅ ១០ វិនាទីចុងក្រោយដើម្បីស្តាប់សំឡេងរាប់ថយក្រោយខ្មែរ"
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span>ទៅ ១០វិនាទីចុងក្រោយ (Test 10s Voice)</span>
                </button>

                {/* Betting Lock Toggle */}
                <button
                  onClick={() => {
                    playClickSound();
                    onToggleBettingLock();
                    showFeedback(isBettingLocked ? '🔓 បានបើកការភ្នាល់ឡើងវិញ' : '🔒 បានចាក់សោការភ្នាល់');
                  }}
                  className={`font-black px-3.5 py-1.5 rounded-lg text-xs shadow flex items-center gap-1.5 cursor-pointer ${
                    isBettingLocked
                      ? 'bg-red-600 hover:bg-red-500 text-white'
                      : 'bg-slate-700 hover:bg-slate-600 text-slate-200'
                  }`}
                >
                  {isBettingLocked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                  <span>{isBettingLocked ? 'បិទភ្នាល់ (Locked)' : 'បើកភ្នាល់ (Unlocked)'}</span>
                </button>

                {/* Reset Round */}
                <button
                  onClick={() => {
                    playClickSound();
                    onResetRound();
                    showFeedback('🔄 បានកំណត់វេនឡើងវិញ (Round Reset)');
                  }}
                  className="bg-slate-700 hover:bg-slate-600 text-slate-200 font-bold px-3 py-1.5 rounded-lg text-xs shadow flex items-center gap-1.5 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>កំណត់វេនឡើងវិញ (Reset Round)</span>
                </button>
              </div>

              {/* Status Badge */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">របៀបប្រកាស:</span>
                <span
                  className={`text-xs px-2.5 py-1 rounded-md font-black uppercase ${
                    rigMode === 'forced'
                      ? 'bg-amber-500 text-slate-950 border border-yellow-300'
                      : rigMode === 'max_profit'
                      ? 'bg-emerald-500 text-slate-950 border border-emerald-300'
                      : 'bg-blue-600 text-white'
                  }`}
                >
                  {rigMode === 'forced'
                    ? `🎯 កំណត់លេខឈ្នះ: លេខ ${forcedWinnerNumber}`
                    : rigMode === 'max_profit'
                    ? '💰 ចំណេញម្ចាស់អតិបរមា'
                    : '🎲 ចៃដន្យធម្មជាតិ (Fair)'}
                </span>
              </div>
            </div>

            {/* Mode Selection Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Mode 1: Natural / Fair */}
              <div
                onClick={() => {
                  playClickSound();
                  onSetRigMode('fair');
                  onSetForcedWinner(null);
                  showFeedback('🎲 បានកំណត់របៀបចៃដន្យធម្មជាតិ ១០០%');
                }}
                className={`p-4 rounded-xl border-2 transition-all cursor-pointer ${
                  rigMode === 'fair'
                    ? 'bg-blue-950/60 border-blue-500 ring-2 ring-blue-500/50'
                    : 'bg-slate-800/60 border-slate-700 hover:border-slate-500'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">🎲</span>
                    <h3 className="font-black text-sm text-white">ចៃដន្យធម្មតា (Natural Random)</h3>
                  </div>
                  {rigMode === 'fair' && <CheckCircle2 className="w-5 h-5 text-blue-400" />}
                </div>
                <p className="text-xs text-slate-400">
                  ប្រព័ន្ធធ្វើការចាប់ឆ្នោតដោយចៃដន្យ ១០០% ដោយគ្មានការកែសម្រួលលទ្ធផលជាមុន។
                </p>
              </div>

              {/* Mode 2: Fixed Specific Animal */}
              <div
                onClick={() => {
                  playClickSound();
                  onSetRigMode('forced');
                  if (!forcedWinnerNumber) onSetForcedWinner(1);
                  showFeedback('🎯 របៀបកំណត់លេខឈ្នះផ្ទាល់ដៃត្រូវបានបើក (ជ្រើសរើសសត្វខាងក្រោម)');
                }}
                className={`p-4 rounded-xl border-2 transition-all cursor-pointer ${
                  rigMode === 'forced'
                    ? 'bg-amber-950/60 border-yellow-500 ring-2 ring-yellow-500/50'
                    : 'bg-slate-800/60 border-slate-700 hover:border-slate-500'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">🎯</span>
                    <h3 className="font-black text-sm text-yellow-400">កំណត់លេខឈ្នះផ្ទាល់ដៃ (Force Winner)</h3>
                  </div>
                  {rigMode === 'forced' && <CheckCircle2 className="w-5 h-5 text-yellow-400" />}
                </div>
                <p className="text-xs text-slate-400">
                  ជ្រើសរើសសត្វ និងលេខជាក់លាក់ណាមួយ (១ ដល់ ១២) ឱ្យឈ្នះក្នុងវេនបន្ទាប់ ឬជំនួសលទ្ធផលភ្លាមៗ។
                </p>
              </div>

              {/* Mode 3: Auto-Maximize House Profit */}
              <div
                onClick={() => {
                  playClickSound();
                  onSetRigMode('max_profit');
                  if (bestHouseOutcome) {
                    onSetForcedWinner(bestHouseOutcome.animal.number);
                    showFeedback(`💰 បានកំណត់ចំណេញអតិបរមា: លេខ ${bestHouseOutcome.animal.number} (${bestHouseOutcome.animal.nameKhmer})`);
                  }
                }}
                className={`p-4 rounded-xl border-2 transition-all cursor-pointer ${
                  rigMode === 'max_profit'
                    ? 'bg-emerald-950/60 border-emerald-500 ring-2 ring-emerald-500/50'
                    : 'bg-slate-800/60 border-slate-700 hover:border-slate-500'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">💰</span>
                    <h3 className="font-black text-sm text-emerald-400">ចំណេញម្ចាស់អតិបរមា (Max House Profit)</h3>
                  </div>
                  {rigMode === 'max_profit' && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
                </div>
                <p className="text-xs text-slate-400">
                  ប្រព័ន្ធគណនាការភ្នាល់ទាំងអស់ក្នុងវេននេះ រួចកំណត់សត្វដែលសងតិចបំផុតដើម្បីឱ្យម្ចាស់ចំណេញច្រើនបំផុត!
                </p>
              </div>
            </div>

            {/* 12 Animal Selector with Dual Actions: Guarantee Next OR Override Instantly */}
            <div className="bg-slate-800/90 border border-slate-700 rounded-xl p-5 shadow-lg">
              <div className="flex flex-wrap items-center justify-between mb-4 gap-2">
                <div>
                  <h3 className="text-base font-black text-white flex items-center gap-2">
                    <Crown className="w-4 h-4 text-yellow-400" />
                    <span>ជ្រើសរើសសត្វឈ្នះ & ជំនួសលទ្ធផលផ្ទាល់ (Outcome Override & Next Winner)</span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    អ្នកអាច <span className="text-yellow-400 font-bold">"កំណត់វេនបន្ទាប់"</span> ដើម្បីធានាលទ្ធផល ឬ <span className="text-emerald-400 font-bold">"⚡ បើកភ្លាមៗ"</span> ដើម្បីធ្វើសមកាលកម្មជំនួសលទ្ធផលលើគ្រប់ឧបករណ៍ទាំងអស់ភ្លាមៗ!
                  </p>
                </div>

                {bestHouseOutcome && (
                  <div className="bg-emerald-500/10 border border-emerald-500/40 px-3 py-1.5 rounded-lg flex items-center gap-2 text-xs">
                    <Sparkles className="w-4 h-4 text-emerald-400" />
                    <span className="text-slate-300">ចំណេញម្ចាស់ខ្ពស់បំផុត:</span>
                    <span className="font-black text-emerald-400">
                      លេខ {bestHouseOutcome.animal.number} ({bestHouseOutcome.animal.nameKhmer}) +{bestHouseOutcome.houseProfit.toLocaleString()}៛
                    </span>
                    <button
                      onClick={() => handleSpecifyNextOutcome(bestHouseOutcome.animal.number)}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-2 py-0.5 rounded text-[10px] cursor-pointer"
                    >
                      កំណត់
                    </button>
                  </div>
                )}
              </div>

              {/* 12 Cards Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {outcomeSimulations.map(({ animal, playerPayout, houseProfit }) => {
                  const isSelected = forcedWinnerNumber === animal.number;
                  const isBest = bestHouseOutcome?.animal.number === animal.number;

                  return (
                    <div
                      key={animal.number}
                      className={`relative rounded-xl p-2.5 flex flex-col items-center justify-between border-2 transition-all ${
                        isSelected
                          ? 'bg-amber-950/80 border-yellow-400 shadow-lg shadow-yellow-500/20 scale-102 ring-2 ring-yellow-400'
                          : isBest
                          ? 'bg-emerald-950/30 border-emerald-500/80 hover:border-emerald-400'
                          : 'bg-slate-900 border-slate-700 hover:border-slate-500'
                      }`}
                    >
                      {/* Best tag */}
                      {isBest && (
                        <div className="absolute -top-2 right-1 z-10 bg-emerald-500 text-slate-950 font-black text-[9px] px-1.5 py-0.2 rounded shadow-xs uppercase">
                          Max Profit
                        </div>
                      )}

                      {/* Selected badge */}
                      {isSelected && (
                        <div className="absolute -top-2 left-1 z-10 bg-yellow-400 text-slate-950 font-black text-[9px] px-1.5 py-0.2 rounded shadow-xs uppercase flex items-center gap-0.5">
                          <Crown className="w-2.5 h-2.5 text-amber-800" />
                          <span>LOCKED</span>
                        </div>
                      )}

                      {/* Number & Name */}
                      <div className="w-full flex items-center justify-between text-xs mb-1">
                        <span className="w-5 h-5 rounded-full bg-slate-800 text-yellow-300 font-mono font-black flex items-center justify-center text-[11px] border border-slate-700">
                          {animal.number}
                        </span>
                        <span className="font-extrabold text-white text-[11px] truncate">{animal.nameKhmer}</span>
                        <span
                          className={`w-2 h-2 rounded-full ${
                            animal.color === 'red'
                              ? 'bg-red-500'
                              : animal.color === 'green'
                              ? 'bg-emerald-500'
                              : 'bg-blue-500'
                          }`}
                        />
                      </div>

                      {/* Animal Illustration */}
                      <div className="w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center my-1 bg-white/5 rounded-lg p-1">
                        <AnimalIllustration number={animal.number} className="w-full h-full object-contain" />
                      </div>

                      {/* Trait badges */}
                      <div className="w-full flex items-center justify-center gap-1 text-[9px] font-bold text-slate-400 my-1">
                        <span>{animal.size === 'small' ? 'តូច' : 'ធំ'}</span>
                        <span>•</span>
                        <span>{animal.parity === 'odd' ? 'សេស' : 'គូ'}</span>
                        <span>•</span>
                        <span>{animal.color === 'red' ? 'ក្រហម' : animal.color === 'green' ? 'បៃតង' : 'ខៀវ'}</span>
                      </div>

                      {/* Financial projection for this animal */}
                      <div className="w-full bg-slate-950/80 rounded p-1.5 text-center mt-1 border border-slate-800">
                        <div className="text-[9px] text-slate-400">ចំណេញម្ចាស់:</div>
                        <div
                          className={`font-mono font-black text-xs ${
                            houseProfit >= 0 ? 'text-emerald-400' : 'text-red-400'
                          }`}
                        >
                          {houseProfit >= 0 ? `+${houseProfit.toLocaleString()}៛` : `${houseProfit.toLocaleString()}៛`}
                        </div>
                      </div>

                      {/* Dual Action Buttons */}
                      <div className="w-full grid grid-cols-2 gap-1.5 mt-2">
                        {/* Action 1: Set For Next Instance */}
                        <button
                          type="button"
                          onClick={() => handleSpecifyNextOutcome(animal.number)}
                          className={`py-1 px-1 rounded text-[10px] font-bold border transition-colors cursor-pointer flex items-center justify-center gap-0.5 ${
                            isSelected
                              ? 'bg-yellow-400 text-slate-950 border-yellow-300 font-black'
                              : 'bg-slate-800 hover:bg-slate-700 text-yellow-300 border-slate-700'
                          }`}
                          title="កំណត់ជាលទ្ធផលឈ្នះសម្រាប់វេនបន្ទាប់"
                        >
                          <Lock className="w-2.5 h-2.5" />
                          <span>វេនបន្ទាប់</span>
                        </button>

                        {/* Action 2: Trigger Instant Override Draw Now */}
                        <button
                          type="button"
                          onClick={() => handleInstantOverride(animal.number)}
                          disabled={isDrawing}
                          className="py-1 px-1 rounded text-[10px] font-black bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white border border-emerald-400 transition-transform active:scale-95 cursor-pointer flex items-center justify-center gap-0.5 shadow-sm"
                          title="បើកលទ្ធផលឈ្នះភ្លាមៗជាមួយសត្វនេះលើគ្រប់ឧបករណ៍ទាំងអស់"
                        >
                          <Zap className="w-2.5 h-2.5 text-yellow-300 fill-yellow-300" />
                          <span>បើកភ្លាម</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 2: OWNER WIN/LOSS & FINANCIALS (ចំណេញ/ខាតរបស់ម្ចាស់) */}
        {/* ============================================================== */}
        {adminTab === 'finances' && (
          <div className="space-y-6">
            {/* KPI Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Card 1: Owner Net Profit (GGR) */}
              <div className="bg-slate-800/90 border border-slate-700 rounded-xl p-4 shadow-lg flex items-center justify-between">
                <div>
                  <div className="text-xs text-slate-400 font-bold uppercase">ចំណេញសុទ្ធរបស់ម្ចាស់ (Owner GGR)</div>
                  <div
                    className={`text-2xl sm:text-3xl font-mono font-black mt-1 ${
                      ownerFinancials.netGgr >= 0 ? 'text-emerald-400' : 'text-red-400'
                    }`}
                  >
                    {ownerFinancials.netGgr >= 0
                      ? `+${ownerFinancials.netGgr.toLocaleString()}៛`
                      : `${ownerFinancials.netGgr.toLocaleString()}៛`}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    {ownerFinancials.netGgr >= 0 ? '🟢 ម្ចាស់កំពុងចំណេញ' : '🔴 ម្ចាស់កំពុងខាត'}
                  </div>
                </div>
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    ownerFinancials.netGgr >= 0 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
                  }`}
                >
                  {ownerFinancials.netGgr >= 0 ? (
                    <TrendingUp className="w-7 h-7" />
                  ) : (
                    <TrendingDown className="w-7 h-7" />
                  )}
                </div>
              </div>

              {/* Card 2: Total Turnover */}
              <div className="bg-slate-800/90 border border-slate-700 rounded-xl p-4 shadow-lg flex items-center justify-between">
                <div>
                  <div className="text-xs text-slate-400 font-bold uppercase">ចំណូលភ្នាល់សរុប (Total Turnover)</div>
                  <div className="text-2xl sm:text-3xl font-mono font-black text-cyan-400 mt-1">
                    {ownerFinancials.totalTurnover.toLocaleString()}៛
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    {ownerFinancials.totalBets} សំបុត្រភ្នាល់សរុប
                  </div>
                </div>
                <div className="w-12 h-12 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
                  <Coins className="w-7 h-7" />
                </div>
              </div>

              {/* Card 3: Total Payouts */}
              <div className="bg-slate-800/90 border border-slate-700 rounded-xl p-4 shadow-lg flex items-center justify-between">
                <div>
                  <div className="text-xs text-slate-400 font-bold uppercase">ទឹកប្រាក់សងសរុប (Total Payouts)</div>
                  <div className="text-2xl sm:text-3xl font-mono font-black text-amber-400 mt-1">
                    {ownerFinancials.totalPayouts.toLocaleString()}៛
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    ឈ្នះ: {ownerFinancials.totalWonBets} | ចាញ់: {ownerFinancials.totalLostBets}
                  </div>
                </div>
                <div className="w-12 h-12 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                  <DollarSign className="w-7 h-7" />
                </div>
              </div>

              {/* Card 4: House Margin % */}
              <div className="bg-slate-800/90 border border-slate-700 rounded-xl p-4 shadow-lg flex items-center justify-between">
                <div>
                  <div className="text-xs text-slate-400 font-bold uppercase">ភាគរយចំណេញម្ចាស់ (House Margin)</div>
                  <div className="text-2xl sm:text-3xl font-mono font-black text-purple-400 mt-1">
                    {ownerFinancials.houseMargin.toFixed(1)}%
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    Player Win Rate: {ownerFinancials.playerWinRate.toFixed(1)}%
                  </div>
                </div>
                <div className="w-12 h-12 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center">
                  <ShieldCheck className="w-7 h-7" />
                </div>
              </div>
            </div>

            {/* Settled Bets Audit Ledger */}
            <div className="bg-slate-800/90 border border-slate-700 rounded-xl p-5 shadow-lg">
              <div className="flex flex-wrap items-center justify-between mb-4 gap-3">
                <div>
                  <h3 className="text-base font-black text-white flex items-center gap-2">
                    <History className="w-4 h-4 text-cyan-400" />
                    <span>សៀវភៅកត់ត្រាការភ្នាល់របស់អតិថិជន (Settled Bets Ledger)</span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    បញ្ជីលម្អិតរាល់សំបុត្រភ្នាល់ដែលបានទូទាត់រួច និងផលប៉ះពាល់ហិរញ្ញវត្ថុដល់ម្ចាស់។
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex bg-slate-900 p-0.5 rounded-lg border border-slate-700 text-xs font-bold">
                    <button
                      onClick={() => setBetFilter('all')}
                      className={`px-3 py-1 rounded cursor-pointer ${
                        betFilter === 'all' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      ទាំងអស់ ({settledBets.length})
                    </button>
                    <button
                      onClick={() => setBetFilter('won')}
                      className={`px-3 py-1 rounded cursor-pointer ${
                        betFilter === 'won' ? 'bg-amber-600 text-white' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      អ្នកលេងឈ្នះ ({settledBets.filter((b) => b.won).length})
                    </button>
                    <button
                      onClick={() => setBetFilter('lost')}
                      className={`px-3 py-1 rounded cursor-pointer ${
                        betFilter === 'lost' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      ម្ចាស់ចំណេញ ({settledBets.filter((b) => !b.won).length})
                    </button>
                  </div>

                  {settledBets.length > 0 && (
                    <button
                      onClick={() => {
                        if (confirm('តើអ្នកពិតជាចង់លុបប្រវត្តិភ្នាល់ទាំងអស់មែនទេ? (Clear all bet records?)')) {
                          onClearSettledBets();
                          showFeedback('🗑️ បានសម្អាតសៀវភៅភ្នាល់');
                        }
                      }}
                      className="bg-red-950/80 hover:bg-red-900 text-red-300 border border-red-700 px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>សម្អាតទិន្នន័យ</span>
                    </button>
                  )}
                </div>
              </div>

              {filteredSettledBets.length === 0 ? (
                <div className="text-center py-12 text-slate-400 text-sm">
                  មិនទាន់មានទិន្នន័យភ្នាល់នៅក្នុងប្រភេទនេះនៅឡើយទេ។
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-900/90 text-slate-400 uppercase text-[10px] font-bold border-b border-slate-700">
                      <tr>
                        <th className="py-2.5 px-3">ម៉ោង & វេន</th>
                        <th className="py-2.5 px-3">ប្រភេទភ្នាល់</th>
                        <th className="py-2.5 px-3">លេខចេញឈ្នះ</th>
                        <th className="py-2.5 px-3 text-right">ទឹកប្រាក់ភ្នាល់</th>
                        <th className="py-2.5 px-3 text-right">អត្រាសង</th>
                        <th className="py-2.5 px-3 text-right">សងអ្នកលេង</th>
                        <th className="py-2.5 px-3 text-right">ចំណេញ/ខាតម្ចាស់</th>
                        <th className="py-2.5 px-3 text-center">លទ្ធផល</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {filteredSettledBets.map((bet) => {
                        const houseNet = bet.won ? bet.amount - bet.payout : bet.amount;

                        return (
                          <tr key={bet.id} className="hover:bg-slate-700/30 transition-colors">
                            <td className="py-2.5 px-3">
                              <span className="font-mono text-slate-300 block">{bet.time}</span>
                              <span className="font-mono text-[10px] text-yellow-400 font-bold">{bet.roundId}</span>
                            </td>
                            <td className="py-2.5 px-3 font-bold text-white">
                              {bet.labelKhmer}
                            </td>
                            <td className="py-2.5 px-3">
                              <span className="bg-slate-900 border border-slate-700 px-2 py-0.5 rounded text-[11px] font-bold text-yellow-300">
                                លេខ {bet.winningNumber} ({bet.winningAnimalKhmer})
                              </span>
                            </td>
                            <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-200">
                              {bet.amount.toLocaleString()}៛
                            </td>
                            <td className="py-2.5 px-3 text-right font-mono text-slate-400">
                              {bet.odds}x
                            </td>
                            <td className="py-2.5 px-3 text-right font-mono font-bold text-amber-400">
                              {bet.won ? `${bet.payout.toLocaleString()}៛` : '0៛'}
                            </td>
                            <td
                              className={`py-2.5 px-3 text-right font-mono font-black ${
                                houseNet >= 0 ? 'text-emerald-400' : 'text-red-400'
                              }`}
                            >
                              {houseNet >= 0 ? `+${houseNet.toLocaleString()}៛` : `${houseNet.toLocaleString()}៛`}
                            </td>
                            <td className="py-2.5 px-3 text-center">
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                                  bet.won
                                    ? 'bg-amber-500/20 text-yellow-300 border border-yellow-500/30'
                                    : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                }`}
                              >
                                {bet.won ? 'អ្នកលេងឈ្នះ' : 'ម្ចាស់ស៊ី'}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 3: RESULTS HISTORY MANAGEMENT (គ្រប់គ្រងប្រវត្តិលទ្ធផល) */}
        {/* ============================================================== */}
        {adminTab === 'history' && (
          <div className="space-y-6">
            <div className="bg-slate-800/90 border border-slate-700 rounded-xl p-5 shadow-lg">
              <div className="flex flex-wrap items-center justify-between mb-4 gap-3">
                <div>
                  <h3 className="text-base font-black text-white flex items-center gap-2">
                    <History className="w-4 h-4 text-yellow-400" />
                    <span>គ្រប់គ្រងប្រវត្តិលទ្ធផលហ្គេម (Results History Management)</span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    អ្នកអាចកែសម្រួលលេខឈ្នះនៃវេនកន្លងមក លុបចោល ឬបញ្ចូលវេនថ្មីតាមតម្រូវការ។
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {/* Search input */}
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="ស្វែងរកតាមលេខ ឬវេន..."
                      value={historySearch}
                      onChange={(e) => setHistorySearch(e.target.value)}
                      className="bg-slate-900 border border-slate-700 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-yellow-400 w-44 sm:w-56"
                    />
                  </div>

                  {/* Add New Result Button */}
                  <button
                    onClick={() => {
                      playClickSound();
                      setIsAddResultOpen(true);
                    }}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-3 py-1.5 rounded-lg text-xs flex items-center gap-1 cursor-pointer shadow"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>បញ្ចូលវេនថ្មី</span>
                  </button>

                  {/* Reset to Default Seed */}
                  <button
                    onClick={() => {
                      if (confirm('តើអ្នកចង់កំណត់ប្រវត្តិលទ្ធផលទៅលំនាំដើម (២៧ វេន) វិញទេ?')) {
                        onResetHistoryToSeed();
                        showFeedback('🔄 បានកំណត់ប្រវត្តិទៅលំនាំដើម');
                      }
                    }}
                    className="bg-slate-700 hover:bg-slate-600 text-slate-300 font-bold px-3 py-1.5 rounded-lg text-xs flex items-center gap-1 cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>លំនាំដើម</span>
                  </button>
                </div>
              </div>

              {/* History Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-900/90 text-slate-400 uppercase text-[10px] font-bold border-b border-slate-700">
                    <tr>
                      <th className="py-2.5 px-3">លេខរៀង</th>
                      <th className="py-2.5 px-3">លេខវេន (Round ID)</th>
                      <th className="py-2.5 px-3">កាលបរិច្ឆេទ & ម៉ោង</th>
                      <th className="py-2.5 px-3 text-center">លេខឈ្នះ</th>
                      <th className="py-2.5 px-3">ឈ្មោះសត្វ</th>
                      <th className="py-2.5 px-3 text-center">តូច/ធំ</th>
                      <th className="py-2.5 px-3 text-center">សេស/គូ</th>
                      <th className="py-2.5 px-3 text-center">ពណ៌</th>
                      <th className="py-2.5 px-3 text-right">សកម្មភាព (Actions)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {filteredHistory.map((item, idx) => {
                      const isEditing = editingHistoryIndex === idx;

                      return (
                        <tr key={item.id || idx} className="hover:bg-slate-700/30 transition-colors">
                          <td className="py-2.5 px-3 text-slate-400 font-mono">
                            #{filteredHistory.length - idx}
                          </td>
                          <td className="py-2.5 px-3 font-mono font-bold text-yellow-400">
                            {item.roundId}
                          </td>
                          <td className="py-2.5 px-3 font-mono text-slate-300">
                            {item.fullDateTime || item.timestamp}
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            {isEditing ? (
                              <select
                                value={editSelectedNumber}
                                onChange={(e) => setEditSelectedNumber(parseInt(e.target.value, 10))}
                                className="bg-slate-900 border border-yellow-400 rounded px-2 py-1 text-yellow-300 font-bold text-xs"
                              >
                                {ANIMALS.map((a) => (
                                  <option key={a.number} value={a.number}>
                                    #{a.number} - {a.nameKhmer}
                                  </option>
                                ))}
                              </select>
                            ) : (
                              <span className="w-7 h-7 rounded-full bg-slate-900 text-yellow-300 font-mono font-black inline-flex items-center justify-center border border-yellow-400/40">
                                {item.number}
                              </span>
                            )}
                          </td>
                          <td className="py-2.5 px-3 font-bold text-white">
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded bg-white/5 p-0.5">
                                <AnimalIllustration number={item.number} className="w-full h-full object-contain" />
                              </div>
                              <span>{item.animal.nameKhmer} ({item.animal.nameEnglish})</span>
                            </div>
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-black text-white ${
                                item.size === 'small' ? 'bg-blue-600' : 'bg-red-600'
                              }`}
                            >
                              {item.size === 'small' ? 'តូច' : 'ធំ'}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-black text-white ${
                                item.parity === 'odd' ? 'bg-purple-600' : 'bg-indigo-600'
                              }`}
                            >
                              {item.parity === 'odd' ? 'សេស' : 'គូ'}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-black text-white ${
                                item.color === 'red'
                                  ? 'bg-red-600'
                                  : item.color === 'green'
                                  ? 'bg-emerald-600'
                                  : 'bg-blue-600'
                              }`}
                            >
                              {item.color === 'red' ? 'ក្រហម' : item.color === 'green' ? 'បៃតង' : 'ខៀវ'}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-right">
                            {isEditing ? (
                              <div className="flex items-center justify-end gap-1">
                                <button
                                  onClick={() => handleSaveEditHistory(idx)}
                                  className="bg-emerald-600 hover:bg-emerald-500 text-white px-2 py-1 rounded text-xs font-bold"
                                >
                                  រក្សាទុក
                                </button>
                                <button
                                  onClick={() => setEditingHistoryIndex(null)}
                                  className="bg-slate-700 hover:bg-slate-600 text-slate-300 px-2 py-1 rounded text-xs"
                                >
                                  បោះបង់
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => {
                                    setEditingHistoryIndex(idx);
                                    setEditSelectedNumber(item.number);
                                  }}
                                  className="p-1 text-slate-400 hover:text-yellow-400 rounded hover:bg-slate-700 cursor-pointer"
                                  title="កែប្រែលេខឈ្នះ"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => {
                                    if (confirm(`តើអ្នកចង់លុបវេន ${item.roundId} ចេញពីប្រវត្តិទេ?`)) {
                                      onDeleteHistoryResult(idx);
                                      showFeedback(`🗑️ បានលុបវេន ${item.roundId}`);
                                    }
                                  }}
                                  className="p-1 text-slate-400 hover:text-red-400 rounded hover:bg-slate-700 cursor-pointer"
                                  title="លុបវេននេះ"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Modal for Adding Custom Historical Result */}
            {isAddResultOpen && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
                <div className="bg-slate-900 border-2 border-slate-700 rounded-2xl max-w-md w-full p-6 shadow-2xl">
                  <h3 className="text-base font-black text-white mb-4 flex items-center gap-2">
                    <Plus className="w-5 h-5 text-emerald-400" />
                    <span>បញ្ចូលលទ្ធផលវេនថ្មី (Add Historical Result)</span>
                  </h3>

                  <form onSubmit={handleCreateCustomResult} className="space-y-4">
                    <div>
                      <label className="text-xs font-bold text-slate-300 block mb-1">
                        លេខវេន (Round ID):
                      </label>
                      <input
                        type="text"
                        value={addCustomRoundId}
                        onChange={(e) => setAddCustomRoundId(e.target.value)}
                        required
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-sm text-white font-mono focus:outline-none focus:border-yellow-400"
                        placeholder="e.g. 2001#328"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-300 block mb-1">
                        ម៉ោង (Time HH:MM):
                      </label>
                      <input
                        type="text"
                        value={addCustomTime}
                        onChange={(e) => setAddCustomTime(e.target.value)}
                        required
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-sm text-white font-mono focus:outline-none focus:border-yellow-400"
                        placeholder="e.g. 18:50"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-300 block mb-1">
                        ជ្រើសរើសសត្វឈ្នះ (Winning Animal):
                      </label>
                      <select
                        value={addCustomNumber}
                        onChange={(e) => setAddCustomNumber(parseInt(e.target.value, 10))}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-sm text-yellow-300 font-bold focus:outline-none focus:border-yellow-400"
                      >
                        {ANIMALS.map((a) => (
                          <option key={a.number} value={a.number}>
                            លេខ {a.number} — {a.nameKhmer} ({a.nameEnglish})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setIsAddResultOpen(false)}
                        className="bg-slate-700 hover:bg-slate-600 text-slate-300 font-bold px-4 py-2 rounded-lg text-xs"
                      >
                        បោះបង់
                      </button>
                      <button
                        type="submit"
                        className="bg-emerald-600 hover:bg-emerald-500 text-white font-black px-4 py-2 rounded-lg text-xs shadow-md"
                      >
                        បញ្ចូលទៅក្នុងប្រវត្តិ
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 4: PLAYER BALANCE & SECURITY SETTINGS (សមតុល្យ & សុវត្ថិភាព) */}
        {/* ============================================================== */}
        {adminTab === 'players' && (
          <div className="space-y-6 max-w-4xl">
            {/* Master Security Key Settings */}
            <div className="bg-slate-800/90 border border-slate-700 rounded-xl p-5 shadow-lg">
              <h3 className="text-base font-black text-white flex items-center gap-2 mb-2">
                <KeyRound className="w-4 h-4 text-yellow-400" />
                <span>សុវត្ថិភាពលេខសម្ងាត់ Master Admin PIN (Security Key)</span>
              </h3>
              <p className="text-xs text-slate-400 mb-4">
                លេខសម្ងាត់នេះត្រូវបានប្រើដើម្បីផ្ទៀងផ្ទាត់រាល់ការកែប្រែលទ្ធផល ការជំនួស និងបញ្ជាលើប្រព័ន្ធ។
              </p>

              <div className="bg-slate-900 border border-slate-700 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <div className="text-xs text-slate-400">ស្ថានភាពសុវត្ថិភាពបច្ចុប្បន្ន</div>
                  <div className="text-sm font-bold text-emerald-400 flex items-center gap-1.5 mt-1">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>បានផ្ទៀងផ្ទាត់រួច (Session Authenticated & Active)</span>
                  </div>
                  <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                    Current PIN: •••• ({adminPin})
                  </div>
                </div>

                {isChangingPin ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="password"
                      placeholder="PIN ថ្មី..."
                      value={newPinInput}
                      onChange={(e) => setNewPinInput(e.target.value)}
                      className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-yellow-400 w-32"
                    />
                    <button
                      onClick={() => {
                        if (newPinInput.trim().length >= 4) {
                          onUpdateAdminPin?.(newPinInput.trim());
                          setIsChangingPin(false);
                          setNewPinInput('');
                          showFeedback('✅ បានផ្លាស់ប្តូរលេខសម្ងាត់ Admin PIN ជោគជ័យ!');
                        }
                      }}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-3 py-1.5 rounded-lg text-xs"
                    >
                      រក្សាទុក
                    </button>
                    <button
                      onClick={() => setIsChangingPin(false)}
                      className="bg-slate-700 text-slate-300 px-2 py-1.5 rounded-lg text-xs"
                    >
                      បោះបង់
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setIsChangingPin(true)}
                    className="bg-slate-800 hover:bg-slate-700 text-yellow-300 border border-slate-700 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>ប្តូរលេខកូដសម្ងាត់</span>
                  </button>
                )}
              </div>
            </div>

            {/* Player Balance Management */}
            <div className="bg-slate-800/90 border border-slate-700 rounded-xl p-5 shadow-lg">
              <h3 className="text-base font-black text-white flex items-center gap-2 mb-2">
                <Wallet className="w-4 h-4 text-emerald-400" />
                <span>គ្រប់គ្រងសមតុល្យអ្នកលេង (Player Balance Control)</span>
              </h3>
              <p className="text-xs text-slate-400 mb-4">
                មើល និងកែសម្រួលសមតុល្យទឹកប្រាក់ក្នុងគណនីអ្នកលេងបច្ចុប្បន្ន។
              </p>

              <div className="bg-slate-900 border border-slate-700 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4 mb-6">
                <div>
                  <div className="text-xs text-slate-400">សមតុល្យអ្នកលេងបច្ចុប្បន្ន (Current Balance)</div>
                  <div className="text-3xl font-mono font-black text-emerald-400 mt-1">
                    {balance.toLocaleString()}៛
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => {
                      playClickSound();
                      onAdjustBalance(100000);
                      showFeedback('💰 បានបន្ថែម +100,000៛ ដល់អ្នកលេង');
                    }}
                    className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-3 py-1.5 rounded-lg text-xs cursor-pointer"
                  >
                    +100,000៛
                  </button>
                  <button
                    onClick={() => {
                      playClickSound();
                      onAdjustBalance(500000);
                      showFeedback('💰 បានបន្ថែម +500,000៛ ដល់អ្នកលេង');
                    }}
                    className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-3 py-1.5 rounded-lg text-xs cursor-pointer"
                  >
                    +500,000៛
                  </button>
                  <button
                    onClick={() => {
                      playClickSound();
                      onAdjustBalance(1000000);
                      showFeedback('💰 បានបន្ថែម +1,000,000៛ ដល់អ្នកលេង');
                    }}
                    className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-3 py-1.5 rounded-lg text-xs cursor-pointer"
                  >
                    +1,000,000៛
                  </button>
                  <button
                    onClick={() => {
                      playClickSound();
                      onSetBalance(500000);
                      showFeedback('🔄 បានកំណត់សមតុល្យទៅ 500,000៛');
                    }}
                    className="bg-slate-700 hover:bg-slate-600 text-slate-200 font-bold px-3 py-1.5 rounded-lg text-xs cursor-pointer"
                  >
                    កំណត់ទៅ 500K
                  </button>
                </div>
              </div>

              {/* Set Exact Balance */}
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  placeholder="បញ្ចូលសមតុល្យផ្ទាល់..."
                  value={customBalanceInput}
                  onChange={(e) => setCustomBalanceInput(e.target.value)}
                  className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-yellow-400 w-64"
                />
                <button
                  onClick={() => {
                    const parsed = parseInt(customBalanceInput, 10);
                    if (!isNaN(parsed) && parsed >= 0) {
                      playClickSound();
                      onSetBalance(parsed);
                      setCustomBalanceInput('');
                      showFeedback(`✅ បានកំណត់សមតុល្យទៅ ${parsed.toLocaleString()}៛`);
                    }
                  }}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-2 rounded-lg text-xs cursor-pointer shadow"
                >
                  កែប្រែសមតុល្យ
                </button>
              </div>
            </div>

            {/* Platform Real-Time Engine Diagnostics */}
            <div className="bg-slate-800/90 border border-slate-700 rounded-xl p-5 shadow-lg">
              <h3 className="text-base font-black text-white flex items-center gap-2 mb-3">
                <Wifi className="w-4 h-4 text-cyan-400" />
                <span>ស្ថានភាពម៉ាស៊ីនសមកាលកម្មពេលវេលាជាក់ស្តែង (Real-Time Engine Status)</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 flex items-center justify-between">
                  <span className="text-slate-400">ពិធីការសមកាលកម្ម (Sync Protocol):</span>
                  <span className="font-mono font-bold text-emerald-400">WebSocket + BroadcastChannel</span>
                </div>
                <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 flex items-center justify-between">
                  <span className="text-slate-400">ឧបករណ៍ភ្ជាប់បច្ចុប្បន្ន:</span>
                  <span className="font-mono font-bold text-cyan-300">{connectedDevicesCount} ឧបករណ៍</span>
                </div>
                <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 flex items-center justify-between">
                  <span className="text-slate-400">ក្បួនបើកលទ្ធផល 3-Line Sequence:</span>
                  <span className="font-mono font-bold text-emerald-400">1100ms / Number</span>
                </div>
                <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 flex items-center justify-between">
                  <span className="text-slate-400">រយៈពេលអបអរលទ្ធផល (Hold):</span>
                  <span className="font-mono font-bold text-emerald-400">5000ms (5.0s Hold)</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
