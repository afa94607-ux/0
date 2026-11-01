/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Animal, BetCategory, PlacedBet, RoundResult, SettledBetRecord } from './types/yuki';
import { ANIMALS, getAnimalByNumber } from './data/animals';
import { Header, ActiveTab } from './components/Header';
import { Language, translations } from './utils/translations';
import { Sidebar } from './components/Sidebar';
import { CenterArena } from './components/CenterArena';
import { BettingBoard } from './components/BettingBoard';
import { RoadmapTable } from './components/RoadmapTable';
import { BetModal } from './components/BetModal';
import { DepositModal } from './components/DepositModal';
import { RulesModal } from './components/RulesModal';
import { WinLossModal } from './components/WinLossModal';
import { ResultsHistoryModal } from './components/ResultsHistoryModal';
import { WinCelebration } from './components/WinCelebration';
import { AdminPanel, RigMode } from './components/AdminPanel';
import { realtimeSync } from './utils/realtime';
import {
  playRevealSound,
  playWinSound,
  playTickSound,
  setSoundMuted,
  playKhmerCountdownSound,
  playKhmerGoodLuckSound,
  KHMER_COUNTDOWN_WORDS,
  KHMER_BLESSING,
} from './utils/audio';

// Exact 27 historical seed numbers matching image_161c79c7.png (Col 0 through Col 14)
const SEED_NUMBERS = [
  2, 1, 11, 7, 11, 9, 7, 4, 6, 8, 6, 10, 6, 10, 8, 8, 5, 7, 9, 5, 9, 12, 4, 10, 9, 5, 1,
];

const INITIAL_HISTORY: RoundResult[] = SEED_NUMBERS.map((num, idx) => {
  const roundNum = 300 + idx;
  const animal = getAnimalByNumber(num);
  const minutesAgo = (SEED_NUMBERS.length - 1 - idx) * 3;
  const totalMins = 18 * 60 + 48 - minutesAgo;
  const h = Math.floor(totalMins / 60);
  const m = totalMins % 60;
  const timeStr = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  return {
    id: `seed-2001#${roundNum}`,
    roundId: `2001#${roundNum}`,
    timestamp: timeStr,
    fullDateTime: `2026-10-29 ${timeStr}:00`,
    number: num,
    animal,
    size: animal.size,
    color: animal.color,
    parity: animal.parity,
  };
}).reverse(); // Most recent first (Round 2001#326: number 1, Rat)

export default function App() {
  // Navigation
  const [activeTab, setActiveTab] = useState<ActiveTab>('bet');

  // Language state (1. Khmer, 2. English)
  const [language, setLanguage] = useState<Language>(() => {
    return (localStorage.getItem('yuki12_lang') as Language) || 'kh';
  });

  const handleLanguageChange = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('yuki12_lang', lang);
  };

  // Modals
  const [isDepositOpen, setIsDepositOpen] = useState(false);
  const [isRulesOpen, setIsRulesOpen] = useState(false);
  const [isWinLossOpen, setIsWinLossOpen] = useState(false);
  const [isResultsOpen, setIsResultsOpen] = useState(false);
  const [isWinCelebrationOpen, setIsWinCelebrationOpen] = useState(false);
  const [winAmount, setWinAmount] = useState(0);
  const [winningWinnerSummary, setWinningWinnerSummary] = useState<{ animalKhmer: string; number: number }>({
    animalKhmer: '',
    number: 1,
  });

  // Bet Slip Modal (Image 2de7a49d)
  const [isBetModalOpen, setIsBetModalOpen] = useState(false);
  const [activeBetCategory, setActiveBetCategory] = useState<BetCategory | null>(null);
  const [activeBetLabel, setActiveBetLabel] = useState<string>('');
  const [activeBetOdds, setActiveBetOdds] = useState<number>(1.95);

  const handleOpenBetModal = (category: BetCategory, odds: number, labelKhmer: string) => {
    setActiveBetCategory(category);
    setActiveBetOdds(odds);
    setActiveBetLabel(labelKhmer);
    setIsBetModalOpen(true);
  };

  // Sound
  const [isMuted, setIsMuted] = useState<boolean>(() => {
    return localStorage.getItem('yuki12_muted') === 'true';
  });

  const handleToggleMute = () => {
    const next = !isMuted;
    setIsMuted(next);
    setSoundMuted(next);
    localStorage.setItem('yuki12_muted', String(next));
  };

  // Balance (KHR)
  const [balance, setBalance] = useState<number>(() => {
    const saved = localStorage.getItem('yuki12_balance');
    return saved ? parseInt(saved, 10) : 500000; // 500,000 KHR starter
  });

  useEffect(() => {
    localStorage.setItem('yuki12_balance', String(balance));
  }, [balance]);

  // Admin Rigging & Outcome Controls
  const [rigMode, setRigMode] = useState<RigMode>('fair');
  const [forcedWinnerNumber, setForcedWinnerNumber] = useState<number | null>(null);
  const [isManualBettingLocked, setIsManualBettingLocked] = useState(false);
  const [adminPin, setAdminPin] = useState<string>(() => {
    return localStorage.getItem('yuki12_admin_pin') || '8888';
  });
  const [connectedDevicesCount, setConnectedDevicesCount] = useState<number>(1);

  const handleUpdateAdminPin = (newPin: string) => {
    setAdminPin(newPin);
    localStorage.setItem('yuki12_admin_pin', newPin);
  };

  // Helper to generate 12 animals for 12 bowl positions (Row 1: 1-6, Row 2: 7-11, Row 3: 12)
  const generateRoundAnimals = (overrideWinnerNumber?: number | null): Animal[] => {
    const nums = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
    for (let i = nums.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [nums[i], nums[j]] = [nums[j], nums[i]];
    }

    // Determine target winning animal for Line 3 (index 11)
    const targetWinner = overrideWinnerNumber || (rigMode === 'forced' ? forcedWinnerNumber : null);
    if (targetWinner && targetWinner >= 1 && targetWinner <= 12) {
      const currentIdx = nums.indexOf(targetWinner);
      if (currentIdx !== -1 && currentIdx !== 11) {
        [nums[currentIdx], nums[11]] = [nums[11], nums[currentIdx]];
      }
    }

    return nums.map((n) => getAnimalByNumber(n));
  };

  // Round Info: 3-minute round (180 seconds)
  const [roundNumber, setRoundNumber] = useState(327);
  const currentRoundId = `2001#${roundNumber}`;
  const [countdown, setCountdown] = useState(180); // 3 minutes = 180s betting & reveal cycle
  const [isDrawing, setIsDrawing] = useState(false);
  const [revealedWinner, setRevealedWinner] = useState<Animal | null>(null);
  const [revealedStep, setRevealedStep] = useState<number>(0); // 0 to 12 sequential reveal
  const [currentRoundAnimals, setCurrentRoundAnimals] = useState<Animal[]>(() => generateRoundAnimals());

  // 10-second lockout or manual owner lockout: No bets can be placed
  const isBettingLocked = isManualBettingLocked || countdown <= 10 || isDrawing;

  // Live clock
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const clockTimer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(clockTimer);
  }, []);

  const currentTimeStr = useMemo(() => {
    const h = String(currentTime.getHours()).padStart(2, '0');
    const m = String(currentTime.getMinutes()).padStart(2, '0');
    const s = String(currentTime.getSeconds()).padStart(2, '0');
    return `${h}:${m}:${s}`;
  }, [currentTime]);

  const currentDateStr = useMemo(() => {
    const y = currentTime.getFullYear();
    const m = String(currentTime.getMonth() + 1).padStart(2, '0');
    const d = String(currentTime.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }, [currentTime]);

  const roundEndTime = useMemo(() => {
    // 3 minutes after round start
    const endTarget = new Date(currentTime.getTime() + countdown * 1000);
    const endHour = String(endTarget.getHours()).padStart(2, '0');
    const endMin = String(endTarget.getMinutes()).padStart(2, '0');
    return `${endHour}:${endMin}`;
  }, [roundNumber]);

  // History state
  const [resultsHistory, setResultsHistory] = useState<RoundResult[]>(INITIAL_HISTORY);
  const [settledBets, setSettledBets] = useState<SettledBetRecord[]>(() => {
    try {
      const saved = localStorage.getItem('yuki12_settled_bets');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('yuki12_settled_bets', JSON.stringify(settledBets));
  }, [settledBets]);

  // Betting state
  const [selectedChip, setSelectedChip] = useState<number>(10000); // Default 10K chip
  const [placedBets, setPlacedBets] = useState<Record<BetCategory, PlacedBet>>({} as Record<BetCategory, PlacedBet>);
  const [previousBets, setPreviousBets] = useState<Record<BetCategory, PlacedBet> | null>(null);

  // Calculate active bets total
  const activeBetTotal = useMemo(() => {
    return Object.values(placedBets).reduce((sum, bet) => sum + (bet?.amount || 0), 0);
  }, [placedBets]);

  // Placing a bet: Blocked during final 10 seconds of the round
  const handlePlaceBet = (category: BetCategory, amount: number, odds: number, labelKhmer: string) => {
    if (isBettingLocked) {
      return;
    }

    if (balance < amount) {
      setIsDepositOpen(true);
      return;
    }

    setBalance((prev) => prev - amount);
    setPlacedBets((prev) => {
      const existing = prev[category];
      const newAmount = (existing ? existing.amount : 0) + amount;
      return {
        ...prev,
        [category]: {
          category,
          amount: newAmount,
          odds,
          labelKhmer,
        },
      };
    });
  };

  // Clear bets: Blocked during final 10 seconds
  const handleClearBets = () => {
    if (isBettingLocked) return;
    if (activeBetTotal > 0) {
      setBalance((prev) => prev + activeBetTotal);
      setPlacedBets({} as Record<BetCategory, PlacedBet>);
    }
  };

  // Double bets: Blocked during final 10 seconds
  const handleDoubleBets = () => {
    if (isBettingLocked || activeBetTotal <= 0) return;
    if (balance < activeBetTotal) {
      setIsDepositOpen(true);
      return;
    }

    setBalance((prev) => prev - activeBetTotal);
    setPlacedBets((prev) => {
      const next: Record<BetCategory, PlacedBet> = {} as Record<BetCategory, PlacedBet>;
      Object.entries(prev).forEach(([key, bet]) => {
        if (bet) {
          next[key as BetCategory] = {
            ...bet,
            amount: bet.amount * 2,
          };
        }
      });
      return next;
    });
  };

  // Repeat previous round bets: Blocked during final 10 seconds
  const handleRepeatBets = () => {
    if (isBettingLocked || !previousBets) return;
    const prevTotal = Object.values(previousBets).reduce((s, b) => s + (b?.amount || 0), 0);
    if (prevTotal <= 0) return;
    if (balance < prevTotal) {
      setIsDepositOpen(true);
      return;
    }

    // Refund any current placed bets first
    if (activeBetTotal > 0) {
      setBalance((prev) => prev + activeBetTotal);
    }

    setBalance((prev) => prev - prevTotal);
    setPlacedBets(previousBets);
  };

  // Settlement logic ref
  const placedBetsRef = useRef(placedBets);
  placedBetsRef.current = placedBets;

  const currentRoundIdRef = useRef(currentRoundId);
  currentRoundIdRef.current = currentRoundId;

  const isDrawingRef = useRef(false);
  const blessingTriggeredRef = useRef(false);
  const drawTimeoutsRef = useRef<NodeJS.Timeout[]>([]);

  // Active Khmer countdown voiceover banner & speech sync
  const [khmerVoiceover, setKhmerVoiceover] = useState<{
    number?: number;
    khmer: string;
    english: string;
    type: 'countdown' | 'blessing';
  } | null>(null);

  // Countdown & Drawing Loop: 3 minutes (180s) betting round + voiceover + sequential reveal
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (isDrawingRef.current) {
          return 0;
        }

        const next = prev - 1;

        // Final 10 seconds: voiceover in Khmer (10 down to 1)
        if (next >= 1 && next <= 10) {
          playKhmerCountdownSound(next);
          const word = KHMER_COUNTDOWN_WORDS[next];
          if (word) {
            setKhmerVoiceover({
              number: next,
              khmer: word.text,
              english: word.english,
              type: 'countdown',
            });
          }
        }

        // Countdown hits 0: Play blessing "សូមជូនពរឱ្យសំណាងល្អ", then start sequential reveal!
        if (next <= 0) {
          if (!blessingTriggeredRef.current) {
            blessingTriggeredRef.current = true;
            // 1. Voiceover in Khmer: "សូមជូនពរឱ្យសំណាងល្អ"
            playKhmerGoodLuckSound();
            setKhmerVoiceover({
              khmer: KHMER_BLESSING.text,
              english: KHMER_BLESSING.english,
              type: 'blessing',
            });

            // 2. Then the new result will start coming (Row 1 -> Row 2 -> Row 3 sequential reveal)
            setTimeout(() => {
              setKhmerVoiceover(null);
              startDrawSequence();
            }, 1800);
          }
          return 0;
        }

        return next;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Real-time synchronization across connected client devices
  useEffect(() => {
    const unsubscribe = realtimeSync.subscribe((event) => {
      if (event.type === 'CLIENT_COUNT') {
        setConnectedDevicesCount(event.payload.count);
      } else if (event.type === 'INIT_STATE' || event.type === 'SYNC_GAME_STATE') {
        if (event.payload.connectedDevices) {
          setConnectedDevicesCount(event.payload.connectedDevices);
        }
        if (event.payload.forcedWinnerNumber) {
          setForcedWinnerNumber(event.payload.forcedWinnerNumber);
          setRigMode(event.payload.rigMode);
        }
      } else if (event.type === 'ADMIN_OUTCOME_SET') {
        setForcedWinnerNumber(event.payload.forcedWinnerNumber);
        setRigMode('forced');
      } else if (event.type === 'DRAW_STARTED') {
        if (!isDrawingRef.current) {
          startDrawSequence(event.payload.roundAnimals[11]?.number);
        }
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const startDrawSequence = (overrideNum?: number) => {
    if (isDrawingRef.current) return;
    drawTimeoutsRef.current.forEach(clearTimeout);
    drawTimeoutsRef.current = [];

    isDrawingRef.current = true;
    setIsDrawing(true);
    setRevealedWinner(null);
    setRevealedStep(0);

    // Determine winner animal based on overrideNum or rigMode:
    let chosenWinnerNum: number | null = null;
    if (overrideNum && overrideNum >= 1 && overrideNum <= 12) {
      chosenWinnerNum = overrideNum;
    } else if (rigMode === 'forced' && forcedWinnerNumber) {
      chosenWinnerNum = forcedWinnerNumber;
    } else if (rigMode === 'max_profit') {
      const currentBetsList = Object.values(placedBetsRef.current).filter((b) => b && b.amount > 0);
      let bestNum = 1;
      let minPayout = Infinity;
      ANIMALS.forEach((animal) => {
        let totalPayout = 0;
        currentBetsList.forEach((bet) => {
          let won = false;
          if (bet.category === 'small' && animal.size === 'small') won = true;
          else if (bet.category === 'big' && animal.size === 'big') won = true;
          else if (bet.category === 'odd' && animal.parity === 'odd') won = true;
          else if (bet.category === 'even' && animal.parity === 'even') won = true;
          else if (bet.category === 'red' && animal.color === 'red') won = true;
          else if (bet.category === 'green' && animal.color === 'green') won = true;
          else if (bet.category === 'blue' && animal.color === 'blue') won = true;
          else if (bet.category === `num_${animal.number}`) won = true;

          if (won) totalPayout += Math.round(bet.amount * bet.odds);
        });
        if (totalPayout < minPayout) {
          minPayout = totalPayout;
          bestNum = animal.number;
        }
      });
      chosenWinnerNum = bestNum;
    }

    // 12 figures for 12 positions (Line 1: 1-6, Line 2: 7-11, Line 3: 12)
    const roundAnimals = generateRoundAnimals(chosenWinnerNum);
    setCurrentRoundAnimals(roundAnimals);

    // Winning result is strictly determined by the last figure in Line 3
    const winnerAnimal = roundAnimals[11];
    const winningNum = winnerAnimal.number;
    const roundIdSnapshot = currentRoundIdRef.current;

    // Exact 1100ms reveal intervals as requested:
    // Line 1 (Numbers 1–6): Each number revealed at 1100ms interval (1100ms, 2200ms, 3300ms, 4400ms, 5500ms, 6600ms)
    // Line 2 (Numbers 7–11): Each number revealed at 1100ms interval (7700ms, 8800ms, 9900ms, 11000ms, 12100ms)
    // Line 3 (Final Result/Number 12): Opens exactly 1100ms after Line 2 (13200ms)
    // Celebration Hold: Held on screen for exactly 5000ms before resetting for the next round
    const INTERVAL_MS = 1100;
    const CELEBRATION_HOLD_MS = 5000;

    const stepDelays = [
      1 * INTERVAL_MS,  // Step 1  (Line 1, No. 1) -> 1100ms
      2 * INTERVAL_MS,  // Step 2  (Line 1, No. 2) -> 2200ms
      3 * INTERVAL_MS,  // Step 3  (Line 1, No. 3) -> 3300ms
      4 * INTERVAL_MS,  // Step 4  (Line 1, No. 4) -> 4400ms
      5 * INTERVAL_MS,  // Step 5  (Line 1, No. 5) -> 5500ms
      6 * INTERVAL_MS,  // Step 6  (Line 1, No. 6) -> 6600ms
      7 * INTERVAL_MS,  // Step 7  (Line 2, No. 7) -> 7700ms
      8 * INTERVAL_MS,  // Step 8  (Line 2, No. 8) -> 8800ms
      9 * INTERVAL_MS,  // Step 9  (Line 2, No. 9) -> 9900ms
      10 * INTERVAL_MS, // Step 10 (Line 2, No. 10) -> 11000ms
      11 * INTERVAL_MS, // Step 11 (Line 2, No. 11) -> 12100ms
      12 * INTERVAL_MS, // Step 12 (Line 3, Final Result / No. 12) -> 13200ms (exactly 1100ms after Line 2)
    ];

    stepDelays.forEach((delay, idx) => {
      const timeoutId = setTimeout(() => {
        const stepNum = idx + 1;
        setRevealedStep(stepNum);

        if (stepNum < 12) {
          playTickSound();
        } else {
          // Line 3 final figure revealed! Decisive winner announced!
          playRevealSound();
          setRevealedWinner(winnerAnimal);

          // Create new RoundResult with guaranteed unique id
          const now = new Date();
          const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
          const fullDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(
            now.getDate()
          ).padStart(2, '0')} ${timeStr}:${String(now.getSeconds()).padStart(2, '0')}`;

          const newResult: RoundResult = {
            id: `res-${roundIdSnapshot}-${Date.now()}-${winningNum}`,
            roundId: roundIdSnapshot,
            timestamp: timeStr,
            fullDateTime: fullDate,
            number: winningNum,
            animal: winnerAnimal,
            size: winnerAnimal.size,
            color: winnerAnimal.color,
            parity: winnerAnimal.parity,
          };

          // Calculate settlements for player bets against this final 3rd-row figure
          const currentBets = placedBetsRef.current;
          let totalWon = 0;
          const newSettledRecords: SettledBetRecord[] = [];

          Object.values(currentBets).forEach((bet) => {
            if (!bet || bet.amount <= 0) return;

            let won = false;
            if (bet.category === 'small' && winnerAnimal.size === 'small') won = true;
            else if (bet.category === 'big' && winnerAnimal.size === 'big') won = true;
            else if (bet.category === 'odd' && winnerAnimal.parity === 'odd') won = true;
            else if (bet.category === 'even' && winnerAnimal.parity === 'even') won = true;
            else if (bet.category === 'red' && winnerAnimal.color === 'red') won = true;
            else if (bet.category === 'green' && winnerAnimal.color === 'green') won = true;
            else if (bet.category === 'blue' && winnerAnimal.color === 'blue') won = true;
            else if (bet.category === `num_${winningNum}`) won = true;

            const payout = won ? Math.round(bet.amount * bet.odds) : 0;
            if (won) {
              totalWon += payout;
            }

            newSettledRecords.push({
              id: `${Date.now()}-${bet.category}-${Math.random().toString(36).substring(2, 6)}`,
              roundId: roundIdSnapshot,
              time: timeStr,
              category: bet.category,
              labelKhmer: bet.labelKhmer,
              amount: bet.amount,
              odds: bet.odds,
              won,
              payout,
              winningNumber: winningNum,
              winningAnimalKhmer: winnerAnimal.nameKhmer,
            });
          });

          // Update balance if won
          if (totalWon > 0) {
            setBalance((prev) => prev + totalWon);
            playWinSound();
            setWinAmount(totalWon);
            setWinningWinnerSummary({
              animalKhmer: winnerAnimal.nameKhmer,
              number: winningNum,
            });
            setIsWinCelebrationOpen(true);
          }

          // Record to history with deduplication
          setResultsHistory((prev) => {
            const filtered = prev.filter((item) => item.roundId !== roundIdSnapshot);
            return [newResult, ...filtered];
          });

          if (newSettledRecords.length > 0) {
            setSettledBets((prev) => [...newSettledRecords, ...prev]);
          }

          // Store previous bets for repeat button
          setPreviousBets(currentBets);
          setPlacedBets({} as Record<BetCategory, PlacedBet>);

          // Celebration Hold: Once the final winning result is revealed, it is held on screen for exactly 5000ms (5 seconds) before resetting for the next round
          const holdTimeoutId = setTimeout(() => {
            setIsDrawing(false);
            isDrawingRef.current = false;
            blessingTriggeredRef.current = false;
            setKhmerVoiceover(null);
            setRevealedWinner(null);
            setRevealedStep(0);
            setCurrentRoundAnimals(generateRoundAnimals());
            setRoundNumber((r) => r + 1);
            setCountdown(180);
          }, CELEBRATION_HOLD_MS);
          drawTimeoutsRef.current.push(holdTimeoutId);
        }
      }, delay);
      drawTimeoutsRef.current.push(timeoutId);
    });
  };

  // Tab switching handles
  const handleTabChange = (tab: ActiveTab) => {
    setActiveTab(tab);
    if (tab === 'statement') {
      setIsWinLossOpen(true);
    } else if (tab === 'results') {
      setIsResultsOpen(true);
    }
  };

  return (
    <div className="min-h-screen bg-[#edf2f7] flex flex-col font-sans select-none text-slate-800">
      {/* Top Navigation Bar */}
      <Header
        activeTab={activeTab}
        onTabChange={handleTabChange}
        language={language}
        onLanguageChange={handleLanguageChange}
        isMuted={isMuted}
        onToggleMute={handleToggleMute}
        onOpenDeposit={() => setIsDepositOpen(true)}
        onOpenRules={() => setIsRulesOpen(true)}
        balance={balance}
      />

      {/* Main Content: Admin Panel Page or Gaming Terminal */}
      {activeTab === 'admin' ? (
        <AdminPanel
          onBackToGame={() => setActiveTab('bet')}
          language={language}
          roundNumber={roundNumber}
          currentRoundId={currentRoundId}
          countdown={countdown}
          isDrawing={isDrawing}
          isBettingLocked={isBettingLocked}
          activeBetTotal={activeBetTotal}
          placedBets={placedBets}
          rigMode={rigMode}
          onSetRigMode={(mode) => {
            setRigMode(mode);
          }}
          forcedWinnerNumber={forcedWinnerNumber}
          onSetForcedWinner={(num) => {
            setForcedWinnerNumber(num);
            if (num) {
              setRigMode('forced');
              realtimeSync.adminSetOutcome(num, adminPin);
            }
          }}
          onTriggerForceDraw={(overrideNum) => {
            if (isDrawingRef.current) return;
            blessingTriggeredRef.current = false;
            setKhmerVoiceover(null);
            const target = overrideNum || forcedWinnerNumber || undefined;
            if (overrideNum) {
              setForcedWinnerNumber(overrideNum);
              setRigMode('forced');
            }
            realtimeSync.adminTriggerDraw(target, adminPin);
            startDrawSequence(target);
          }}
          onFastForward10s={() => {
            blessingTriggeredRef.current = false;
            setCountdown(12);
            realtimeSync.adminFastForward10s(adminPin);
          }}
          onResetRound={() => {
            drawTimeoutsRef.current.forEach(clearTimeout);
            drawTimeoutsRef.current = [];
            setIsDrawing(false);
            isDrawingRef.current = false;
            blessingTriggeredRef.current = false;
            setKhmerVoiceover(null);
            setRevealedWinner(null);
            setRevealedStep(0);
            setCurrentRoundAnimals(generateRoundAnimals());
            setCountdown(180);
            realtimeSync.adminResetRound(adminPin);
          }}
          onToggleBettingLock={() => {
            setIsManualBettingLocked((prev) => !prev);
          }}
          connectedDevicesCount={connectedDevicesCount}
          adminPin={adminPin}
          onUpdateAdminPin={handleUpdateAdminPin}
          resultsHistory={resultsHistory}
          onUpdateHistoryResult={(index, newNumber) => {
            setResultsHistory((prev) => {
              const next = [...prev];
              const animal = getAnimalByNumber(newNumber);
              next[index] = {
                ...next[index],
                number: newNumber,
                animal,
                size: animal.size,
                color: animal.color,
                parity: animal.parity,
              };
              return next;
            });
          }}
          onDeleteHistoryResult={(index) => {
            setResultsHistory((prev) => prev.filter((_, i) => i !== index));
          }}
          onAddHistoryResult={(newRes) => {
            setResultsHistory((prev) => [newRes, ...prev]);
          }}
          onResetHistoryToSeed={() => {
            setResultsHistory(INITIAL_HISTORY);
          }}
          settledBets={settledBets}
          onClearSettledBets={() => {
            setSettledBets([]);
          }}
          balance={balance}
          onAdjustBalance={(amt) => {
            setBalance((prev) => Math.max(0, prev + amt));
          }}
          onSetBalance={(newBal) => {
            setBalance(Math.max(0, newBal));
          }}
        />
      ) : (
        /* Main Terminal Frame */
        <main className="flex-1 flex flex-col max-w-[1600px] w-full mx-auto shadow-sm">
          {/* Upper Stage: Left Sidebar + Center Bowls Arena + Right Betting Board */}
          <div className="flex flex-col lg:flex-row border-b border-[#cbd5e1] bg-white">
            {/* Left Column: Account Details & Recent Results */}
            <Sidebar
              balance={balance}
              activeBetTotal={activeBetTotal}
              recentResults={resultsHistory}
              recentBets={settledBets}
              currentDateStr={currentDateStr}
              language={language}
              onOpenDeposit={() => setIsDepositOpen(true)}
              onClearBets={handleClearBets}
              onDoubleBets={handleDoubleBets}
              isBettingLocked={isBettingLocked}
              onRefresh={() => {
                if (countdown > 15) {
                  setCountdown(12); // Fast forward to test final 10s lockout and reveal
                } else {
                  setCountdown(180);
                }
              }}
            />

            {/* Center Column: The 12 Gold Bowls Arena with Sequential 3-Row Reveal */}
            <CenterArena
              countdown={countdown}
              isDrawing={isDrawing}
              revealedWinner={revealedWinner}
              revealedStep={revealedStep}
              currentRoundAnimals={currentRoundAnimals}
              isBettingLocked={isBettingLocked}
              language={language}
              khmerVoiceover={khmerVoiceover}
              onTestCountdown={() => {
                blessingTriggeredRef.current = false;
                setCountdown(12);
              }}
              onTestReveal={() => {
                if (isDrawingRef.current) return;
                blessingTriggeredRef.current = false;
                setKhmerVoiceover(null);
                startDrawSequence();
              }}
            />

            {/* Right Column: Betting Board & Zodiac Animal Cards */}
            <BettingBoard
              countdown={countdown}
              currentRoundId={currentRoundId}
              roundEndTime={roundEndTime}
              currentTimeStr={currentTimeStr}
              selectedChip={selectedChip}
              placedBets={placedBets}
              onPlaceBet={handlePlaceBet}
              onOpenBetModal={handleOpenBetModal}
              isDrawing={isDrawing}
              winningAnimal={revealedWinner}
              khmerVoiceover={khmerVoiceover}
              onRefreshRound={() => {
                if (countdown > 15) {
                  blessingTriggeredRef.current = false;
                  setCountdown(12); // Fast forward to test final 10s lockout, Khmer voiceover, and reveal
                } else {
                  blessingTriggeredRef.current = false;
                  setCountdown(180);
                }
              }}
            />
          </div>

          {/* Bottom Section: Dual Bead Plate Roadmaps (លេខ / តូចធំ & ពណ៌ / សេសគូ) */}
          <RoadmapTable history={resultsHistory} language={language} />
        </main>
      )}

      {/* Bet Slip Modal (Image 2de7a49d) */}
      <BetModal
        isOpen={isBetModalOpen}
        onClose={() => setIsBetModalOpen(false)}
        roundId={currentRoundId}
        roundEndTime={roundEndTime}
        category={activeBetCategory}
        categoryLabel={activeBetLabel}
        odds={activeBetOdds}
        currentTimeStr={currentTimeStr}
        onConfirmBet={handlePlaceBet}
        userBalance={balance}
        onOpenDeposit={() => setIsDepositOpen(true)}
        isBettingLocked={isBettingLocked}
      />

      {/* Modals & Dialogs */}
      <DepositModal
        isOpen={isDepositOpen}
        onClose={() => setIsDepositOpen(false)}
        currentBalance={balance}
        onAddBalance={(amt) => setBalance((prev) => prev + amt)}
        onResetBalance={() => setBalance(500000)}
      />

      <RulesModal
        isOpen={isRulesOpen}
        onClose={() => setIsRulesOpen(false)}
      />

      <WinLossModal
        isOpen={isWinLossOpen}
        onClose={() => {
          setIsWinLossOpen(false);
          setActiveTab('bet');
        }}
        settledBets={settledBets}
      />

      <ResultsHistoryModal
        isOpen={isResultsOpen}
        onClose={() => {
          setIsResultsOpen(false);
          setActiveTab('bet');
        }}
        results={resultsHistory}
      />

      <WinCelebration
        isOpen={isWinCelebrationOpen}
        onClose={() => setIsWinCelebrationOpen(false)}
        winAmount={winAmount}
        winningAnimalKhmer={winningWinnerSummary.animalKhmer}
        winningNumber={winningWinnerSummary.number}
      />
    </div>
  );
}
