import { Injectable } from '@angular/core';
import { PlayerStats } from '../models/stats.model';

const STORAGE_KEY = 'patternforge_stats_v1';

@Injectable({ providedIn: 'root' })
export class StatsService {
  private stats: PlayerStats = this.load();

  get snapshot(): PlayerStats {
    return { ...this.stats };
  }

  recordPuzzle(correct: boolean, difficultyTier: number, streak: number): void {
    this.stats.totalPuzzles += 1;
    if (correct) {
      this.stats.totalCorrect += 1;
      if (difficultyTier >= 5) {
        this.stats.difficultSolved += 1;
      }
    }
    this.stats.bestStreak = Math.max(this.stats.bestStreak, streak);
    this.persist();
  }

  updateSurvival(seconds: number): void {
    this.stats.longestSurvivalSeconds = Math.max(this.stats.longestSurvivalSeconds, seconds);
    this.persist();
  }

  reset(): void {
    this.stats = this.defaultStats();
    this.persist();
  }

  private load(): PlayerStats {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        return { ...this.defaultStats(), ...JSON.parse(raw) } as PlayerStats;
      } catch (e) {
        console.warn('Failed to parse stats, resetting', e);
      }
    }
    return this.defaultStats();
  }

  private persist(): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.stats));
  }

  private defaultStats(): PlayerStats {
    return {
      totalPuzzles: 0,
      totalCorrect: 0,
      bestStreak: 0,
      difficultSolved: 0,
      longestSurvivalSeconds: 0,
    };
  }
}
