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
      params: this.composeParams(propertyPatterns, motif, idx),
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
      values: this.samplePattern(prop, motif, length, idx),
    }));
  }

  private samplePattern(
    property: keyof MotifParams,
    motif: MotifDefinition,
    length: number,
    variant: number,
  ): number[] {
    const domain = this.domainForProperty(property, motif);
    if (domain.length <= 1) return Array.from({ length }, () => domain[0] ?? 0);
    const start = Math.floor(Math.random() * domain.length);
    const choice = variant % 4;

    const wrap = (offset: number): number => domain[(start + offset + domain.length) % domain.length];
    const bounce = (idx: number): number => {
      const period = domain.length * 2 - 2;
      const pos = idx % period;
      const mirrored = pos >= domain.length ? period - pos : pos;
      return domain[mirrored];
    };

    return Array.from({ length }, (_, i) => {
      switch (choice) {
        case 0:
          return wrap(i); // monotonic walk across the domain
        case 1:
          return wrap(i * 2); // skipping every other entry
        case 2:
          return bounce(i); // ping-pong between extremes
        default:
          return wrap(Math.floor(i / 2)); // linger on each value before stepping
      }
    });
  }

  private composeParams(patterns: PropertyPattern[], motif: MotifDefinition, index: number): MotifParams {
    const params: MotifParams = {};
    patterns.forEach((pat) => {
      const value = pat.values[index % pat.values.length];
      (params as Record<string, number | ShadeIndex | undefined>)[pat.property] = this.normalizeParam(
        pat.property,
        value,
        motif,
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
      const current =
        (tweaked[property] as number | undefined) ?? this.defaultForProperty(property, motif.id);
      const domain = this.domainForProperty(property, motif).filter((v) => v !== current);
      if (domain.length === 0) continue;
      const nextValue = this.pick(domain);

      tweaked[property] = nextValue as any;
      const candidate = { motifId: motif.id, params: tweaked };
      if (answers.some((a) => this.isSameCell(a, candidate))) continue;
      answers.push(candidate);
    }
    return this.shuffle(answers);
  }

  private normalizeParam(property: keyof MotifParams, raw: number, motif?: MotifDefinition): number | ShadeIndex {
    switch (property) {
      case 'shadeIndex':
        return this.clampShade(raw);
      case 'rotation':
        return ((Math.round(raw) % (motif?.rotationSymmetry ?? 4)) + (motif?.rotationSymmetry ?? 4)) %
          (motif?.rotationSymmetry ?? 4);
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

  private defaultForProperty(property: keyof MotifParams, motifId?: MotifDefinition['id']): number | ShadeIndex {
    const motifDefaults = this.motifDefaults(motifId);
    const specific = motifDefaults[property];
    if (specific !== undefined) return specific;

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

  private domainForProperty(property: keyof MotifParams, motif: MotifDefinition): number[] {
    switch (property) {
      case 'shadeIndex':
        return [0, 1, 2, 3];
      case 'rotation': {
        const max = motif.rotationSymmetry ?? 4;
        return Array.from({ length: max }, (_, i) => i);
      }
      case 'size':
        return [0, 1, 2];
      case 'borderThickness':
        return [1, 2, 3, 4, 5, 6];
      case 'count':
        return [2, 3, 4, 5, 6];
      case 'posX':
      case 'posY':
        return [0, 1, 2, 3, 4];
      default:
        return [0, 1, 2, 3];
    }
  }

  private isSameCell(a: CellConfig, b: CellConfig): boolean {
    if (a.motifId !== b.motifId) return false;
    const left = this.canonicalizeParams(a);
    const right = this.canonicalizeParams(b);
    const keys = new Set([...Object.keys(left), ...Object.keys(right)]);
    for (const key of keys) {
      if ((left as any)[key] !== (right as any)[key]) return false;
    }
    return true;
  }

  /**
   * Normalizes params that have no visible effect for a motif so visual duplicates are
   * treated as equal. Example: arrow rings look identical regardless of rotation.
   */
  private canonicalizeParams(cell: CellConfig): MotifParams {
    const motif = motifLibrary.find((m) => m.id === cell.motifId);
    const defaults = this.motifDefaults(cell.motifId);
    const keys = new Set<keyof MotifParams>([
      ...(motif?.allowedParams ?? []),
      ...Object.keys(cell.params),
    ] as (keyof MotifParams)[]);

    const normalized: MotifParams = {};
    keys.forEach((property) => {
      const raw = (cell.params as any)[property] ?? (defaults as any)[property];
      if (raw === undefined) return;
      (normalized as any)[property] = this.normalizeParam(property, raw, motif);
    });

    if (cell.motifId === 'arrowRing') {
      const { count, shadeIndex } = normalized;
      return { count, shadeIndex } as MotifParams;
    }

    return normalized;
  }

  private motifDefaults(motifId?: MotifDefinition['id']): Partial<MotifParams> {
    switch (motifId) {
      case 'barStack':
        return { shadeIndex: 2, size: 1, count: 3 };
      case 'staircase':
        return { shadeIndex: 1, rotation: 0, count: 4 };
      case 'doubleFrame':
        return { shadeIndex: 0, borderThickness: 2, size: 1 };
      case 'dotGrid':
        return { shadeIndex: 3, count: 3 };
      case 'isoCube':
        return { shadeIndex: 2, size: 1 };
      case 'arrowRing':
        return { shadeIndex: 1, rotation: 0, count: 3 };
      default:
        return {};
    }
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
