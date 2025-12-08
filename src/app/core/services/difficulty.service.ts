import { Injectable } from '@angular/core';
import { MotifDefinition } from '../models/motif.model';
import { motifLibrary } from './motif-library';

@Injectable({ providedIn: 'root' })
export class DifficultyService {
  motifsForTier(tier: number): MotifDefinition[] {
    return motifLibrary.filter((motif) => motif.difficultyWeight <= tier + 1);
  }

  /**
   * Returns the number of properties allowed to change for this tier.
   */
  propertyBudget(tier: number): number {
    if (tier < 2) return 1;
    if (tier < 4) return 2;
    if (tier < 6) return 3;
    return 4;
  }
}
