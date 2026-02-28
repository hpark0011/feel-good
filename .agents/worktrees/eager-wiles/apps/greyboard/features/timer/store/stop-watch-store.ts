import { create } from "zustand";
import { getStorageKey } from "@/lib/storage-keys";

export enum StopWatchState {
  Stopped = "stopped",
  Running = "running",
  Paused = "paused",
}

export interface TicketTimerState {
  startTime: number | null; // Timestamp when timer started/resumed
  accumulatedTime: number; // Seconds accumulated before pause
  state: StopWatchState;
}

export interface TimerState {
  timers: Record<string, TicketTimerState>;
}

export interface StopWatchStore extends TimerState {
  _hasHydrated: boolean;

  // Actions
  startTimer: (ticketId: string) => void;
  pauseTimer: (ticketId: string) => void;
  stopTimer: (ticketId: string) => void;
  stopAllTimers: () => void;
  resetTimer: (ticketId: string) => void;

  // Selectors
  getElapsedTime: (ticketId: string) => number;
  isTimerActive: (ticketId: string) => boolean;
  getTimerState: (ticketId: string) => StopWatchState;

  // Hydration
  _hydrate: () => void;

  // Internal
  _persistState: () => void;
}

function isStopWatchState(value: unknown): value is StopWatchState {
  return (
    value === StopWatchState.Stopped ||
    value === StopWatchState.Running ||
    value === StopWatchState.Paused
  );
}

/**
 * Loads timer state from localStorage
 */
function loadPersistedState(): Partial<TimerState> {
  if (typeof window === "undefined") return {};

  try {
    const key = getStorageKey("TASKS", "TIMER_STATE");
    const stored = localStorage.getItem(key);
    if (!stored) return {};

    const parsed: unknown = JSON.parse(stored);
    if (!parsed || typeof parsed !== "object") return {};
    const timerState = parsed as { timers?: unknown };
    if (!timerState.timers || typeof timerState.timers !== "object") {
      return {};
    }

    const timers: Record<string, TicketTimerState> = {};
    const now = Date.now();

    for (const [ticketId, rawTimer] of Object.entries(timerState.timers)) {
      if (!rawTimer || typeof rawTimer !== "object") continue;

      const maybeTimer = rawTimer as {
        startTime?: unknown;
        accumulatedTime?: unknown;
        state?: unknown;
      };

      if (
        typeof maybeTimer.accumulatedTime !== "number" ||
        !isStopWatchState(maybeTimer.state)
      ) {
        continue;
      }

      const startTime =
        typeof maybeTimer.startTime === "number" ? maybeTimer.startTime : null;
      let accumulatedTime = Math.max(0, maybeTimer.accumulatedTime);
      let state = maybeTimer.state;

      // Reset running timers on page load while keeping elapsed progress
      if (state === StopWatchState.Running) {
        const elapsedSinceStart = startTime
          ? Math.max(0, Math.floor((now - startTime) / 1000))
          : 0;
        accumulatedTime += elapsedSinceStart;
        state = StopWatchState.Stopped;
      }

      timers[ticketId] = {
        startTime: null,
        accumulatedTime,
        state,
      };
    }

    return { timers };
  } catch (error) {
    console.error("Error loading timer state:", error);
    return {};
  }
}

/**
 * Saves timer state to localStorage
 */
function persistState(state: TimerState): void {
  if (typeof window === "undefined") return;

  try {
    const key = getStorageKey("TASKS", "TIMER_STATE");
    localStorage.setItem(key, JSON.stringify(state));
  } catch (error) {
    console.error("Error persisting timer state:", error);
  }
}

export const useStopWatchStore = create<StopWatchStore>((set, get) => ({
  // Initial state (same on server and client for hydration)
  timers: {},
  _hasHydrated: false,

  // Actions
  startTimer: (ticketId: string) => {
    const state = get();
    const timer = state.timers[ticketId];
    if (timer?.state === StopWatchState.Running) return;

    const now = Date.now();
    set((current) => ({
      timers: {
        ...current.timers,
        [ticketId]: {
          startTime: now,
          accumulatedTime: timer?.accumulatedTime ?? 0,
          state: StopWatchState.Running,
        },
      },
    }));

    get()._persistState();
  },

  pauseTimer: (ticketId: string) => {
    const state = get();
    const timer = state.timers[ticketId];
    if (!timer || timer.state !== StopWatchState.Running) return;

    const now = Date.now();
    const elapsedSinceStart = timer.startTime
      ? Math.floor((now - timer.startTime) / 1000)
      : 0;
    set((current) => ({
      timers: {
        ...current.timers,
        [ticketId]: {
          startTime: null,
          accumulatedTime: timer.accumulatedTime + elapsedSinceStart,
          state: StopWatchState.Paused,
        },
      },
    }));
    get()._persistState();
  },

  stopTimer: (ticketId: string) => {
    set((current) => {
      if (!current.timers[ticketId]) return current;
      const timers = { ...current.timers };
      delete timers[ticketId];
      return { timers };
    });
    get()._persistState();
  },

  stopAllTimers: () => {
    set({ timers: {} });
    get()._persistState();
  },

  resetTimer: (ticketId: string) => {
    get().stopTimer(ticketId);
  },

  // Selectors
  getElapsedTime: (ticketId: string) => {
    const timer = get().timers[ticketId];
    if (!timer) return 0;

    if (timer.state === StopWatchState.Running && timer.startTime) {
      const now = Date.now();
      const elapsedSinceStart = Math.floor((now - timer.startTime) / 1000);
      return timer.accumulatedTime + elapsedSinceStart;
    }

    return timer.accumulatedTime;
  },

  isTimerActive: (ticketId: string) => {
    return !!get().timers[ticketId];
  },

  getTimerState: (ticketId: string) => {
    return get().timers[ticketId]?.state ?? StopWatchState.Stopped;
  },

  _persistState: () => {
    persistState({ timers: get().timers });
  },

  _hydrate: () => {
    if (get()._hasHydrated) return;

    const loaded = loadPersistedState();
    set({ ...loaded, _hasHydrated: true });
  },
}));
