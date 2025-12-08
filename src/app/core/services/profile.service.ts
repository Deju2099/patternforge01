import { Injectable } from '@angular/core';
import { motifUnlocks } from './motif-library';
import { StatsService } from './stats.service';

@Injectable({ providedIn: 'root' })
export class ProfileService {
  constructor(private stats: StatsService) {}

  rankTitle(): string {
    const { totalCorrect, bestStreak } = this.stats.snapshot;
    if (bestStreak >= 12 || totalCorrect > 150) return 'Master of Patterns';
    if (totalCorrect > 120) return 'Cognitive Strategist';
    if (totalCorrect > 90) return 'NVR Analyst';
    if (totalCorrect > 60) return 'Rotation Adept';
    if (totalCorrect > 40) return 'Symmetry Scout';
    if (totalCorrect > 20) return 'Shape Seeker';
    return 'Pattern Initiate';
  }

  isMotifUnlocked(motifId: string): boolean {
    const rank = this.rankTitle();
    const stats = this.stats.snapshot;
    const unlock = motifUnlocks.find((m) => m.motifId === motifId);
    if (!unlock) return true;
    if (unlock.requiredRank && this.rankOrder(rank) < this.rankOrder(unlock.requiredRank)) {
      return false;
    }
    if (unlock.minDifficultPuzzlesSolved && stats.difficultSolved < unlock.minDifficultPuzzlesSolved) {
      return false;
    }
    if (unlock.minEndlessSurvivalTime && stats.longestSurvivalSeconds < unlock.minEndlessSurvivalTime) {
      return false;
    }
    return true;
  }

  private rankOrder(rank: string): number {
    const order = [
      'Pattern Initiate',
      'Shape Seeker',
      'Symmetry Scout',
      'Rotation Adept',
      'NVR Analyst',
      'Cognitive Strategist',
      'Master of Patterns',
    ];
    const idx = order.indexOf(rank);
    return idx >= 0 ? idx : 0;
  }
}
