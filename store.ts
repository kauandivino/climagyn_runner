/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/


import { create } from 'zustand';
import { GameStatus, RUN_SPEED_BASE } from './types';
import { audio } from './components/System/Audio';

interface GameState {
  status: GameStatus;
  score: number;
  lives: number;
  maxLives: number;
  speed: number;
  collectedLetters: number[]; 
  level: number;
  laneCount: number;
  gemsCollected: number;
  distance: number;
  victoryInsight: string;
  
  // Actions
  startGame: () => void;
  restartGame: () => void;
  takeDamage: () => void;
  addScore: (amount: number) => void;
  collectGem: (value: number) => void;
  collectLetter: (index: number) => void;
  setStatus: (status: GameStatus) => void;
  setDistance: (dist: number) => void;
  setVictoryInsight: (insight: string) => void;
  
  advanceLevel: () => void;
}

const GEMINI_TARGET = ['C', 'L', 'I', 'M', 'A', 'G', 'Y', 'N'];
const MAX_LEVEL = 3;

export const useStore = create<GameState>((set, get) => ({
  status: GameStatus.MENU,
  score: 0,
  lives: 3,
  maxLives: 3,
  speed: 0,
  collectedLetters: [],
  level: 1,
  laneCount: 3,
  gemsCollected: 0,
  distance: 0,
  victoryInsight: '',
  
  startGame: () => set({ 
    status: GameStatus.PLAYING, 
    score: 0, 
    lives: 3, 
    maxLives: 3,
    speed: RUN_SPEED_BASE,
    collectedLetters: [],
    level: 1,
    laneCount: 3,
    gemsCollected: 0,
    distance: 0,
    victoryInsight: '',
  }),

  restartGame: () => set({ 
    status: GameStatus.PLAYING, 
    score: 0, 
    lives: 3, 
    maxLives: 3,
    speed: RUN_SPEED_BASE,
    collectedLetters: [],
    level: 1,
    laneCount: 3,
    gemsCollected: 0,
    distance: 0,
    victoryInsight: '',
  }),

  takeDamage: () => {
    const { lives } = get();

    if (lives > 1) {
      set({ lives: lives - 1 });
    } else {
      set({ lives: 0, status: GameStatus.GAME_OVER, speed: 0 });
    }
  },

  addScore: (amount) => set((state) => ({ score: state.score + amount })),
  
  collectGem: (value) => set((state) => ({ 
    score: state.score + value, 
    gemsCollected: state.gemsCollected + 1 
  })),

  setDistance: (dist) => set({ distance: dist }),
  setVictoryInsight: (insight) => set({ victoryInsight: insight }),

  collectLetter: (index) => {
    const { collectedLetters, level, speed } = get();
    
    if (!collectedLetters.includes(index)) {
      const newLetters = [...collectedLetters, index];
      
      // LINEAR SPEED INCREASE: Add 10% of BASE speed per letter
      // This ensures 110% -> 120% -> 130% consistent steps
      const speedIncrease = RUN_SPEED_BASE * 0.10;
      const nextSpeed = speed + speedIncrease;

      set({ 
        collectedLetters: newLetters,
        speed: nextSpeed
      });

      // Check if full word collected
      if (newLetters.length === GEMINI_TARGET.length) {
        if (level < MAX_LEVEL) {
            // Immediately advance level
            // The Shop Portal will be spawned by LevelManager at the start of the new level
            get().advanceLevel();
        } else {
            // Victory Condition
            set({
                status: GameStatus.VICTORY,
                score: get().score + 5000
            });
        }
      }
    }
  },

  advanceLevel: () => {
      const { level, laneCount, speed } = get();
      const nextLevel = level + 1;
      
      // LINEAR LEVEL INCREASE: Add 40% of BASE speed per level
      // Combined with the 6 letters (60%), this totals +100% speed per full level cycle
      const speedIncrease = RUN_SPEED_BASE * 0.40;
      const newSpeed = speed + speedIncrease;

      set({
          level: nextLevel,
          laneCount: Math.min(laneCount + 2, 9), // Expand lanes
          status: GameStatus.PLAYING,
          speed: newSpeed,
          collectedLetters: [] // Reset letters
      });
  },

  setStatus: (status) => set({ status }),
  increaseLevel: () => set((state) => ({ level: state.level + 1 })),
}));
