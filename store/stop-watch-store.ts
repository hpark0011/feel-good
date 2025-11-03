import { create } from "zustand";

export enum StopWatchState {
  Stopped = "stopped",
  Running = "running",
  Paused = "paused",
}

interface StopWatchStore {
  // State
  stopWatchState: StopWatchState;

  // Actions
  startTimer: () => void;
  stopTimer: () => void;
  pauseTimer: () => void;
  resetTimer: () => void;
}

export const useStopWatchStore = create<StopWatchStore>((set) => ({
  // State
  stopWatchState: StopWatchState.Stopped,

  // Actions
  startTimer: () => set({ stopWatchState: StopWatchState.Running }),
  stopTimer: () => set({ stopWatchState: StopWatchState.Stopped }),
  pauseTimer: () => set({ stopWatchState: StopWatchState.Paused }),
  resetTimer: () => set({ stopWatchState: StopWatchState.Stopped }),

  // Computed
}));
