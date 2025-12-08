import { MotifDefinition, MotifUnlockCondition } from '../models/motif.model';

export const motifLibrary: MotifDefinition[] = [
  {
    id: 'barStack',
    displayName: 'Bar Stack',
    rotationSymmetry: 2,
    allowedParams: ['count', 'shadeIndex', 'size'],
    difficultyWeight: 1,
  },
  {
    id: 'staircase',
    displayName: 'Staircase',
    rotationSymmetry: 4,
    allowedParams: ['count', 'rotation', 'shadeIndex'],
    difficultyWeight: 2,
  },
  {
    id: 'doubleFrame',
    displayName: 'Double Frame',
    rotationSymmetry: 4,
    allowedParams: ['shadeIndex', 'borderThickness', 'size'],
    difficultyWeight: 2,
  },
  {
    id: 'dotGrid',
    displayName: 'Dot Grid',
    rotationSymmetry: 4,
    allowedParams: ['count', 'shadeIndex'],
    difficultyWeight: 1,
  },
  {
    id: 'isoCube',
    displayName: 'Isometric Cube',
    // Hexagonal symmetry; ensure literal type satisfies MotifDefinition so invalid values like 3 are rejected.
    rotationSymmetry: 6 satisfies MotifDefinition['rotationSymmetry'],
    allowedParams: ['shadeIndex', 'size'],
    difficultyWeight: 4,
    locked: true,
  },
  {
    id: 'arrowRing',
    displayName: 'Arrow Ring',
    rotationSymmetry: 4,
    allowedParams: ['shadeIndex', 'rotation', 'count'],
    difficultyWeight: 3,
  },
];

export const motifUnlocks: MotifUnlockCondition[] = [
  {
    motifId: 'isoCube',
    requiredRank: 'Cognitive Strategist',
    minDifficultPuzzlesSolved: 10,
  },
];
