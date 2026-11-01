import express from 'express';
import { createServer } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import path from 'path';
import { fileURLToPath } from 'url';
import { ANIMALS, getAnimalByNumber } from './src/data/animals.js';
import { Animal, RoundResult } from './src/types/yuki.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initial 27 historical seed numbers
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
}).reverse();

// Helper to generate 12 animals with specific forced winner at position 11 (Line 3, 12th bowl)
function generateRoundAnimals(forcedNumber?: number | null): Animal[] {
  const nums = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
  for (let i = nums.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [nums[i], nums[j]] = [nums[j], nums[i]];
  }
  if (forcedNumber && forcedNumber >= 1 && forcedNumber <= 12) {
    const currentIdx = nums.indexOf(forcedNumber);
    if (currentIdx !== -1 && currentIdx !== 11) {
      [nums[currentIdx], nums[11]] = [nums[11], nums[currentIdx]];
    }
  }
  return nums.map((n) => getAnimalByNumber(n));
}

// Server Authoritative Game State
interface ServerGameState {
  roundNumber: number;
  currentRoundId: string;
  countdown: number;
  status: 'betting' | 'drawing' | 'celebrating';
  isDrawing: boolean;
  revealedStep: number;
  revealedWinner: Animal | null;
  forcedWinnerNumber: number | null;
  rigMode: 'fair' | 'forced' | 'max_profit';
  currentRoundAnimals: Animal[];
  history: RoundResult[];
  lastUpdate: number;
}

const DEFAULT_ADMIN_PIN = '8888';

const gameState: ServerGameState = {
  roundNumber: 327,
  currentRoundId: '2001#327',
  countdown: 180,
  status: 'betting',
  isDrawing: false,
  revealedStep: 0,
  revealedWinner: null,
  forcedWinnerNumber: null,
  rigMode: 'fair',
  currentRoundAnimals: generateRoundAnimals(null),
  history: INITIAL_HISTORY,
  lastUpdate: Date.now(),
};

let activeDrawTimeouts: NodeJS.Timeout[] = [];

async function startServer() {
  const app = express();
  const server = createServer(app);
  const wss = new WebSocketServer({ server });

  app.use(express.json());

  const connectedSockets = new Set<WebSocket>();

  // Broadcast helper
  function broadcast(event: { type: string; payload: unknown }) {
    const msg = JSON.stringify(event);
    connectedSockets.forEach((ws) => {
      if (ws.readyState === WebSocket.OPEN) {
        try {
          ws.send(msg);
        } catch {
          // Ignore send failures on stale sockets
        }
      }
    });
  }

  function broadcastFullState() {
    broadcast({
      type: 'SYNC_GAME_STATE',
      payload: {
        ...gameState,
        connectedDevices: connectedSockets.size,
      },
    });
  }

  // Draw Sequence Engine: Line 1 (1-6 at 1100ms), Line 2 (7-11 at 1100ms), Line 3 (12 at 1100ms), 5000ms Hold
  function startDrawSequence(overrideNum?: number | null) {
    if (gameState.isDrawing) return;

    activeDrawTimeouts.forEach(clearTimeout);
    activeDrawTimeouts = [];

    const finalWinningNumber =
      overrideNum && overrideNum >= 1 && overrideNum <= 12
        ? overrideNum
        : gameState.forcedWinnerNumber && gameState.forcedWinnerNumber >= 1 && gameState.forcedWinnerNumber <= 12
        ? gameState.forcedWinnerNumber
        : gameState.currentRoundAnimals[11]?.number || 1;

    // Ensure position 11 is strictly the forced winning animal
    gameState.currentRoundAnimals = generateRoundAnimals(finalWinningNumber);
    const winnerAnimal = gameState.currentRoundAnimals[11];

    gameState.isDrawing = true;
    gameState.status = 'drawing';
    gameState.revealedStep = 0;
    gameState.revealedWinner = null;
    gameState.lastUpdate = Date.now();

    broadcast({
      type: 'DRAW_STARTED',
      payload: {
        roundId: gameState.currentRoundId,
        roundAnimals: gameState.currentRoundAnimals,
      },
    });

    const INTERVAL_MS = 1100;
    const CELEBRATION_HOLD_MS = 5000;

    const stepDelays = [
      1 * INTERVAL_MS,  // Step 1  (Line 1, #1)  -> 1100ms
      2 * INTERVAL_MS,  // Step 2  (Line 1, #2)  -> 2200ms
      3 * INTERVAL_MS,  // Step 3  (Line 1, #3)  -> 3300ms
      4 * INTERVAL_MS,  // Step 4  (Line 1, #4)  -> 4400ms
      5 * INTERVAL_MS,  // Step 5  (Line 1, #5)  -> 5500ms
      6 * INTERVAL_MS,  // Step 6  (Line 1, #6)  -> 6600ms
      7 * INTERVAL_MS,  // Step 7  (Line 2, #7)  -> 7700ms
      8 * INTERVAL_MS,  // Step 8  (Line 2, #8)  -> 8800ms
      9 * INTERVAL_MS,  // Step 9  (Line 2, #9)  -> 9900ms
      10 * INTERVAL_MS, // Step 10 (Line 2, #10) -> 11000ms
      11 * INTERVAL_MS, // Step 11 (Line 2, #11) -> 12100ms
      12 * INTERVAL_MS, // Step 12 (Line 3, #12) -> 13200ms (1100ms after Line 2)
    ];

    stepDelays.forEach((delay, idx) => {
      const t = setTimeout(() => {
        const stepNum = idx + 1;
        gameState.revealedStep = stepNum;

        if (stepNum < 12) {
          broadcast({
            type: 'DRAW_STEP',
            payload: {
              step: stepNum,
              animal: gameState.currentRoundAnimals[stepNum - 1],
            },
          });
        } else {
          // Line 3 revealed! Winner decided!
          gameState.revealedWinner = winnerAnimal;
          gameState.status = 'celebrating';

          // Record new result into history
          const now = new Date();
          const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
          const fullDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(
            now.getDate()
          ).padStart(2, '0')} ${timeStr}:${String(now.getSeconds()).padStart(2, '0')}`;

          const newResult: RoundResult = {
            id: `res-${gameState.currentRoundId}-${Date.now()}-${winnerAnimal.number}`,
            roundId: gameState.currentRoundId,
            timestamp: timeStr,
            fullDateTime: fullDate,
            number: winnerAnimal.number,
            animal: winnerAnimal,
            size: winnerAnimal.size,
            color: winnerAnimal.color,
            parity: winnerAnimal.parity,
          };

          gameState.history = [newResult, ...gameState.history.filter((h) => h.roundId !== gameState.currentRoundId)];

          broadcast({
            type: 'DRAW_COMPLETED',
            payload: {
              step: 12,
              winningAnimal: winnerAnimal,
              result: newResult,
            },
          });

          // Reset forced winner after execution
          gameState.forcedWinnerNumber = null;
          gameState.rigMode = 'fair';

          // Celebration hold: 5000ms hold on screen before resetting for next round
          const holdTimeout = setTimeout(() => {
            gameState.isDrawing = false;
            gameState.status = 'betting';
            gameState.revealedWinner = null;
            gameState.revealedStep = 0;
            gameState.roundNumber += 1;
            gameState.currentRoundId = `2001#${gameState.roundNumber}`;
            gameState.countdown = 180;
            gameState.currentRoundAnimals = generateRoundAnimals(null);
            gameState.lastUpdate = Date.now();

            broadcast({
              type: 'ROUND_RESET',
              payload: {
                roundNumber: gameState.roundNumber,
                currentRoundId: gameState.currentRoundId,
                countdown: gameState.countdown,
                currentRoundAnimals: gameState.currentRoundAnimals,
              },
            });
          }, CELEBRATION_HOLD_MS);

          activeDrawTimeouts.push(holdTimeout);
        }
      }, delay);

      activeDrawTimeouts.push(t);
    });
  }

  // 1-second Server Clock Loop
  setInterval(() => {
    if (gameState.isDrawing) return;

    if (gameState.countdown > 0) {
      gameState.countdown -= 1;

      // Broadcast countdown tick every second
      broadcast({
        type: 'COUNTDOWN_TICK',
        payload: {
          countdown: gameState.countdown,
          roundId: gameState.currentRoundId,
        },
      });

      // When countdown hits 0, trigger draw sequence!
      if (gameState.countdown === 0) {
        startDrawSequence();
      }
    }
  }, 1000);

  // WebSocket Connection Management
  wss.on('connection', (ws) => {
    connectedSockets.add(ws);

    // Send full state to newly connected client
    ws.send(
      JSON.stringify({
        type: 'INIT_STATE',
        payload: {
          ...gameState,
          connectedDevices: connectedSockets.size,
        },
      })
    );

    // Broadcast connected devices count to everyone
    broadcast({
      type: 'CLIENT_COUNT',
      payload: { count: connectedSockets.size },
    });

    ws.on('message', (data) => {
      try {
        const message = JSON.parse(data.toString());

        // Secure Admin Command: Verify PIN
        if (message.type === 'ADMIN_VERIFY_PIN') {
          const isValid = message.pin === DEFAULT_ADMIN_PIN;
          ws.send(
            JSON.stringify({
              type: 'ADMIN_VERIFY_RESULT',
              payload: { success: isValid },
            })
          );
        }

        // Secure Admin Command: Set Guaranteed Outcome
        if (message.type === 'ADMIN_SET_OUTCOME') {
          if (message.pin !== DEFAULT_ADMIN_PIN) {
            ws.send(JSON.stringify({ type: 'ERROR', payload: 'Unauthorized: Invalid Admin PIN' }));
            return;
          }

          const targetNum = parseInt(message.number, 10);
          if (targetNum >= 1 && targetNum <= 12) {
            gameState.forcedWinnerNumber = targetNum;
            gameState.rigMode = 'forced';
            // Pre-place forced winner into current round animals at position 11
            gameState.currentRoundAnimals = generateRoundAnimals(targetNum);
            gameState.lastUpdate = Date.now();

            broadcast({
              type: 'ADMIN_OUTCOME_SET',
              payload: {
                forcedWinnerNumber: targetNum,
                animal: getAnimalByNumber(targetNum),
                roundId: gameState.currentRoundId,
                message: `Guaranteed outcome set to #${targetNum} for next instance`,
              },
            });
          }
        }

        // Secure Admin Command: Override / Trigger Current Draw Immediately
        if (message.type === 'ADMIN_TRIGGER_DRAW') {
          if (message.pin !== DEFAULT_ADMIN_PIN) {
            ws.send(JSON.stringify({ type: 'ERROR', payload: 'Unauthorized: Invalid Admin PIN' }));
            return;
          }

          const overrideNum = message.number ? parseInt(message.number, 10) : undefined;
          startDrawSequence(overrideNum);
        }

        // Secure Admin Command: Fast forward to final 10 seconds
        if (message.type === 'ADMIN_FAST_FORWARD_10S') {
          if (message.pin !== DEFAULT_ADMIN_PIN) return;
          gameState.countdown = 12;
          broadcast({
            type: 'COUNTDOWN_TICK',
            payload: { countdown: 12, roundId: gameState.currentRoundId },
          });
        }

        // Secure Admin Command: Reset Round
        if (message.type === 'ADMIN_RESET_ROUND') {
          if (message.pin !== DEFAULT_ADMIN_PIN) return;
          activeDrawTimeouts.forEach(clearTimeout);
          activeDrawTimeouts = [];
          gameState.isDrawing = false;
          gameState.status = 'betting';
          gameState.revealedWinner = null;
          gameState.revealedStep = 0;
          gameState.countdown = 180;
          gameState.currentRoundAnimals = generateRoundAnimals(gameState.forcedWinnerNumber);
          broadcastFullState();
        }
      } catch (err) {
        console.error('Error handling ws message:', err);
      }
    });

    ws.on('close', () => {
      connectedSockets.delete(ws);
      broadcast({
        type: 'CLIENT_COUNT',
        payload: { count: connectedSockets.size },
      });
    });
  });

  // REST API Endpoints
  app.get('/api/game/state', (_req, res) => {
    res.json({
      ...gameState,
      connectedDevices: connectedSockets.size,
    });
  });

  app.post('/api/admin/verify', (req, res) => {
    const { pin } = req.body;
    if (pin === DEFAULT_ADMIN_PIN) {
      res.json({ success: true, token: 'auth-admin-session-valid' });
    } else {
      res.status(401).json({ success: false, message: 'Invalid Admin PIN' });
    }
  });

  app.post('/api/admin/set-outcome', (req, res) => {
    const { pin, number } = req.body;
    if (pin !== DEFAULT_ADMIN_PIN) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }
    const targetNum = parseInt(number, 10);
    if (targetNum >= 1 && targetNum <= 12) {
      gameState.forcedWinnerNumber = targetNum;
      gameState.rigMode = 'forced';
      gameState.currentRoundAnimals = generateRoundAnimals(targetNum);
      broadcast({
        type: 'ADMIN_OUTCOME_SET',
        payload: {
          forcedWinnerNumber: targetNum,
          animal: getAnimalByNumber(targetNum),
          roundId: gameState.currentRoundId,
        },
      });
      res.json({ success: true, forcedWinnerNumber: targetNum });
    } else {
      res.status(400).json({ success: false, message: 'Invalid animal number (1-12)' });
    }
  });

  app.post('/api/admin/trigger-draw', (req, res) => {
    const { pin, number } = req.body;
    if (pin !== DEFAULT_ADMIN_PIN) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }
    const overrideNum = number ? parseInt(number, 10) : undefined;
    startDrawSequence(overrideNum);
    res.json({ success: true, message: 'Draw triggered across all connected devices' });
  });

  // Mount Vite middleware in development or serve static in production
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  const PORT = 3000;
  server.listen(PORT, '0.0.0.0', () => {
    console.log(`[Yuki 12 Full-Stack Server] Running on http://0.0.0.0:${PORT} with WebSocket sync`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
