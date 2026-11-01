/**
 * Real-time synchronization service across all connected client devices and browser tabs.
 * Uses WebSockets with BroadcastChannel fallback for zero-latency cross-tab coordination.
 */

import { Animal, RoundResult } from '../types/yuki';

export interface SyncGameStatePayload {
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
  connectedDevices?: number;
}

export type RealtimeEvent =
  | { type: 'INIT_STATE'; payload: SyncGameStatePayload }
  | { type: 'SYNC_GAME_STATE'; payload: SyncGameStatePayload }
  | { type: 'COUNTDOWN_TICK'; payload: { countdown: number; roundId: string } }
  | { type: 'DRAW_STARTED'; payload: { roundId: string; roundAnimals: Animal[] } }
  | { type: 'DRAW_STEP'; payload: { step: number; animal?: Animal } }
  | { type: 'DRAW_COMPLETED'; payload: { step: number; winningAnimal: Animal; result: RoundResult } }
  | { type: 'ROUND_RESET'; payload: { roundNumber: number; currentRoundId: string; countdown: number; currentRoundAnimals: Animal[] } }
  | { type: 'ADMIN_OUTCOME_SET'; payload: { forcedWinnerNumber: number; animal: Animal; roundId: string; message?: string } }
  | { type: 'CLIENT_COUNT'; payload: { count: number } }
  | { type: 'ADMIN_VERIFY_RESULT'; payload: { success: boolean } }
  | { type: 'ERROR'; payload: string };

type Listener = (event: RealtimeEvent) => void;

class RealtimeSyncManager {
  private socket: WebSocket | null = null;
  private broadcastChannel: BroadcastChannel | null = null;
  private listeners: Set<Listener> = new Set();
  private isConnected = false;
  private reconnectAttempts = 0;
  private reconnectTimer: NodeJS.Timeout | null = null;
  public connectedDevicesCount = 1;

  constructor() {
    if (typeof window !== 'undefined') {
      try {
        this.broadcastChannel = new BroadcastChannel('yuki12_realtime_sync');
        this.broadcastChannel.onmessage = (e) => {
          if (e.data) {
            this.notifyListeners(e.data);
          }
        };
      } catch (e) {
        console.warn('BroadcastChannel not supported in this environment', e);
      }
      this.connectWebSocket();
    }
  }

  private connectWebSocket() {
    if (typeof window === 'undefined') return;

    try {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}`;

      this.socket = new WebSocket(wsUrl);

      this.socket.onopen = () => {
        this.isConnected = true;
        this.reconnectAttempts = 0;
      };

      this.socket.onmessage = (event) => {
        try {
          const parsed: RealtimeEvent = JSON.parse(event.data);
          if (parsed.type === 'CLIENT_COUNT') {
            this.connectedDevicesCount = parsed.payload.count;
          } else if (parsed.type === 'INIT_STATE' || parsed.type === 'SYNC_GAME_STATE') {
            if (parsed.payload.connectedDevices) {
              this.connectedDevicesCount = parsed.payload.connectedDevices;
            }
          }
          this.notifyListeners(parsed);
          // Broadcast to other tabs on same device as well
          if (this.broadcastChannel) {
            try {
              this.broadcastChannel.postMessage(parsed);
            } catch {
              // Ignore channel post errors
            }
          }
        } catch (err) {
          console.error('Failed to parse realtime message', err);
        }
      };

      this.socket.onclose = () => {
        this.isConnected = false;
        this.scheduleReconnect();
      };

      this.socket.onerror = () => {
        this.isConnected = false;
      };
    } catch (err) {
      console.warn('WebSocket connection error, falling back to local channel', err);
      this.scheduleReconnect();
    }
  }

  private scheduleReconnect() {
    if (this.reconnectTimer) return;
    const delay = Math.min(1000 * Math.pow(1.5, this.reconnectAttempts), 8000);
    this.reconnectAttempts++;
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      this.connectWebSocket();
    }, delay);
  }

  private notifyListeners(event: RealtimeEvent) {
    this.listeners.forEach((listener) => {
      try {
        listener(event);
      } catch (err) {
        console.error('Error in realtime event listener', err);
      }
    });
  }

  public subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  public send(data: unknown) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      try {
        this.socket.send(JSON.stringify(data));
      } catch (err) {
        console.error('Failed to send WebSocket message', err);
      }
    }
    // Also post through local BroadcastChannel for instant same-browser reaction
    if (this.broadcastChannel) {
      try {
        this.broadcastChannel.postMessage(data);
      } catch {
        // Ignore
      }
    }
  }

  // Admin Actions
  public adminSetOutcome(animalNumber: number, pin: string) {
    this.send({
      type: 'ADMIN_SET_OUTCOME',
      number: animalNumber,
      pin,
    });
  }

  public adminTriggerDraw(overrideNumber?: number, pin?: string) {
    this.send({
      type: 'ADMIN_TRIGGER_DRAW',
      number: overrideNumber,
      pin: pin || '8888',
    });
  }

  public adminFastForward10s(pin?: string) {
    this.send({
      type: 'ADMIN_FAST_FORWARD_10S',
      pin: pin || '8888',
    });
  }

  public adminResetRound(pin?: string) {
    this.send({
      type: 'ADMIN_RESET_ROUND',
      pin: pin || '8888',
    });
  }

  public adminVerifyPin(pin: string) {
    this.send({
      type: 'ADMIN_VERIFY_PIN',
      pin,
    });
  }
}

export const realtimeSync = new RealtimeSyncManager();
