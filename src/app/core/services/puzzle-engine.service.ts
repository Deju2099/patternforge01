import { Injectable } from '@angular/core';
import { DifficultyService } from './difficulty.service';
import { ProfileService } from './profile.service';
import { CellConfig, PuzzleInstance } from '../models/puzzle.model';
import { GameMode } from '../models/session.model';
import { MotifDefinition, MotifParams } from '../models/motif.model';
import { PropertyPattern } from '../models/pattern.model';
import { motifLibrary } from './motif-library';

@Injectable({ providedIn: 'root' })
export class PuzzleEngineService {
  constructor(
    private difficulty: DifficultyService,
    private profile: ProfileService,
  ) {}

  generateBestFitPuzzle(tier: number, mode: GameMode, id: string): PuzzleInstance {
    const motifs = this.difficulty
      .motifsForTier(tier)
      .filter((m) => this.profile.isMotifUnlocked(m.id));
    const motif = this.pick(motifs);
    const numCells = 5;
    const propertyPatterns = this.buildPatterns(motif, numCells, tier);
    const cells: CellConfig[] = Array.from({ length: numCells }, (_, idx) => ({
      motifId: motif.id,
      params: this.composeParams(propertyPatterns, idx),
    }));

    const missingIndex = 2;
    const visibleCells = cells.map((cell, idx) => (idx === missingIndex ? null : cell));

    const correctCell = cells[missingIndex];
    const answers = this.buildAnswers(correctCell, motif);
    const correctAnswerIndex = answers.findIndex((a) => this.isSameCell(a, correctCell));

    return {
      id,
      mode,
      difficultyTier: tier,
      cells,
      visibleCells,
      correctAnswerIndex,
      answers,
      explanationMeta: { motif: motif.id, patterns: propertyPatterns },
    };
  }

  private buildPatterns(motif: MotifDefinition, length: number, tier: number): PropertyPattern[] {
    const budget = this.difficulty.propertyBudget(tier);
    const properties = [...motif.allowedParams].sort(() => 0.5 - Math.random()).slice(0, budget);
    return properties.map((prop, idx) => ({
      property: prop,
      values: this.samplePattern(length, idx),
    }));
  }

  private samplePattern(length: number, variant: number): number[] {
    const start = Math.floor(Math.random() * 3);
    const arr: number[] = [];
    for (let i = 0; i < length; i++) {
      switch (variant % 3) {
        case 0:
          arr.push((start + i) % 4);
          break;
        case 1:
          arr.push(Math.abs(((i % 2) * 2 - 1)) + start);
          break;
        default:
          arr.push([0, 1, 2, 1, 0][i % 5]);
          break;
      }
    }
    return arr;
  }

  private composeParams(patterns: PropertyPattern[], index: number): MotifParams {
    const params: MotifParams = {};
    patterns.forEach((pat) => {
      params[pat.property] = pat.values[index % pat.values.length];
    });
    return params;
  }

  private buildAnswers(correct: CellConfig, motif: MotifDefinition): CellConfig[] {
    const answers: CellConfig[] = [];
    answers.push(correct);
    while (answers.length < 4) {
      const tweaked: MotifParams = { ...correct.params };
      const property = this.pick(motif.allowedParams);
      const delta = Math.random() > 0.5 ? 1 : -1;
      const nextValue = ((tweaked[property] as number | undefined) ?? 0) + delta;
      tweaked[property] = Math.max(0, Math.min(4, nextValue));
      answers.push({ motifId: motif.id, params: tweaked });
    }
    return this.shuffle(answers);
  }

  private isSameCell(a: CellConfig, b: CellConfig): boolean {
    return a.motifId === b.motifId && Object.keys(a.params).every((key) => (a.params as any)[key] === (b.params as any)[key]);
  }

  private shuffle<T>(items: T[]): T[] {
    return items
      .map((item) => ({ sort: Math.random(), value: item }))
      .sort((a, b) => a.sort - b.sort)
      .map((entry) => entry.value);
  }

  private pick<T>(items: T[] | readonly T[]): T {
    return items[Math.floor(Math.random() * items.length)];
  }
}
