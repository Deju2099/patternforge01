import { Injectable } from '@angular/core';
import { PuzzleEngineService } from './puzzle-engine.service';
import { StatsService } from './stats.service';
import { GameMode, SessionState } from '../models/session.model';
import { PuzzleInstance } from '../models/puzzle.model';

function fallbackId(): string {
  return 'xxxx-xxxx'.replace(/[x]/g, () => (Math.random() * 16).toString(16));
}

@Injectable({ providedIn: 'root' })
export class GameStateService {
  state: SessionState = {
    mode: 'classicTimed',
    difficultyTier: 2,
    currentScore: 0,
    streak: 0,
    lives: 3,
    totalTime: 12 * 60,
    timeRemaining: 12 * 60,
  };

  currentPuzzle: PuzzleInstance | null = null;

  constructor(
    private puzzleEngine: PuzzleEngineService,
    private stats: StatsService,
  ) {}

  start(mode: GameMode, difficultyTier: number): void {
    this.state = {
      mode,
      difficultyTier,
      currentScore: 0,
      streak: 0,
      lives: 3,
      totalTime: mode === 'classicTimed' ? 12 * 60 : 30,
      timeRemaining: mode === 'classicTimed' ? 12 * 60 : 30,
    };
    this.nextPuzzle();
  }

  nextPuzzle(): void {
    const id = fallbackId();
    this.currentPuzzle = this.puzzleEngine.generateBestFitPuzzle(
      this.state.difficultyTier,
      this.state.mode,
      id,
    );
  }

  answer(index: number): boolean {
    if (!this.currentPuzzle) return false;
    const correct = index === this.currentPuzzle.correctAnswerIndex;
    if (correct) {
      this.state.streak += 1;
      const base = 100 * this.currentPuzzle.difficultyTier;
      const streakMultiplier = 1 + Math.min(this.state.streak, 10) * 0.05;
      const timeFactor = 0.5 + 0.5 * ((this.state.timeRemaining ?? 0) / (this.state.totalTime || 1));
      this.state.currentScore += Math.floor(base * streakMultiplier * timeFactor);
    } else {
      this.state.streak = 0;
      if (this.state.mode === 'survival') {
        this.state.lives -= 1;
      }
    }
    this.stats.recordPuzzle(correct, this.currentPuzzle.difficultyTier, this.state.streak);
    this.nextPuzzle();
    return correct;
  }
}
