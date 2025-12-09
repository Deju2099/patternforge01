import { Injectable } from '@angular/core';
import { DifficultyService } from './difficulty.service';
import { ProfileService } from './profile.service';
import { CellConfig, PuzzleInstance } from '../models/puzzle.model';
import { GameMode } from '../models/session.model';
import { MotifDefinition, MotifParams, ShadeIndex } from '../models/motif.model';
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

    console.log('[PuzzleEngine] Question patterns', {
      id,
      motif: motif.id,
      propertyPatterns,
      cells: cells.map((c) => c.params),
      visibleCells: visibleCells.map((c) => c?.params ?? null),
    });

    console.log('[PuzzleEngine] Answer set', {
      id,
      motif: motif.id,
      answers: answers.map((a) => a.params),
      correctAnswerIndex,
    });

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
    const start = Math.floor(Math.random() * 4);
    const arr: number[] = [];
    const choice = variant % 4;
    for (let i = 0; i < length; i++) {
      switch (choice) {
        case 0:
          arr.push((start + i) % 4);
          break;
        case 1:
          arr.push(((start + (i % 3) - 1 + 4) % 4));
          break;
        case 2:
          arr.push((start + [0, 1, 2, 1, 0][i % 5]) % 4);
          break;
        default:
          arr.push((start + (i % 2 === 0 ? 0 : 2)) % 4);
          break;
      }
    }
    return arr;
  }

  private composeParams(patterns: PropertyPattern[], index: number): MotifParams {
    const params: MotifParams = {};
    patterns.forEach((pat) => {
      const value = pat.values[index % pat.values.length];
      (params as Record<string, number | ShadeIndex | undefined>)[pat.property] = this.normalizeParam(
        pat.property,
        value,
      ) as any;
    });
    return params;
  }

  private buildAnswers(correct: CellConfig, motif: MotifDefinition): CellConfig[] {
    const answers: CellConfig[] = [correct];
    let guard = 0;
    while (answers.length < 4 && guard < 50) {
      guard++;
      const tweaked: MotifParams = { ...correct.params };
      const property = this.pick(motif.allowedParams);
      const current = (tweaked[property] as number | undefined) ?? this.defaultForProperty(property);
      const delta = Math.random() > 0.5 ? 1 : -1;
      const nextValue = this.normalizeParam(property, current + delta);
      if (nextValue === current) continue;

      tweaked[property] = nextValue as any;
      const candidate = { motifId: motif.id, params: tweaked };
      if (answers.some((a) => this.isSameCell(a, candidate))) continue;
      answers.push(candidate);
    }
    return this.shuffle(answers);
  }

  private normalizeParam(property: keyof MotifParams, raw: number): number | ShadeIndex {
    switch (property) {
      case 'shadeIndex':
        return this.clampShade(raw);
      case 'rotation':
        return ((Math.round(raw) % 4) + 4) % 4;
      case 'size':
        return Math.max(0, Math.min(2, Math.round(raw)));
      case 'borderThickness':
        return Math.max(1, Math.min(6, Math.round(raw)));
      case 'count':
        return Math.max(2, Math.min(6, Math.round(raw)));
      case 'posX':
      case 'posY':
        return Math.max(0, Math.min(4, Math.round(raw)));
      default:
        return Math.round(raw);
    }
  }

  private defaultForProperty(property: keyof MotifParams): number | ShadeIndex {
    switch (property) {
      case 'shadeIndex':
        return 1;
      case 'rotation':
        return 0;
      case 'size':
        return 1;
      case 'borderThickness':
        return 2;
      case 'count':
        return 3;
      case 'posX':
      case 'posY':
        return 2;
      default:
        return 0;
    }
  }

  private clampShade(value: number): ShadeIndex {
    const clamped = Math.max(0, Math.min(3, Math.round(value)));
    return clamped as ShadeIndex;
  }

  private isSameCell(a: CellConfig, b: CellConfig): boolean {
    if (a.motifId !== b.motifId) return false;
    const keys = new Set([...Object.keys(a.params), ...Object.keys(b.params)]);
    for (const key of keys) {
      if ((a.params as any)[key] !== (b.params as any)[key]) return false;
    }
    return true;
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
