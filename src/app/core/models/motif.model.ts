/**
 * Represents the four discrete greyscale shades used by the puzzle renderer.
 */
export type ShadeIndex = 0 | 1 | 2 | 3;

/**
 * Discrete parameter set a motif may use.
 */
export interface MotifParams {
  shadeIndex?: ShadeIndex;
  size?: number; // 0..2 bucket
  rotation?: number; // 0..3 quarter turns
  posX?: number; // 0..4 bucketed position
  posY?: number; // 0..4 bucketed position
  borderThickness?: number;
  count?: number; // repeated elements count
}

export interface MotifDefinition {
  id: string;
  displayName: string;
  rotationSymmetry: 1 | 2 | 4 | 6;
  allowedParams: (keyof MotifParams)[];
  difficultyWeight: number;
  locked?: boolean;
}

export interface MotifUnlockCondition {
  motifId: string;
  requiredRank?: string;
  minDifficultPuzzlesSolved?: number;
  minEndlessSurvivalTime?: number;
}
