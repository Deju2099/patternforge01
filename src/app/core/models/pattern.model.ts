import { MotifParams } from './motif.model';

type PatternArray = number[];

export interface PropertyPattern {
  property: keyof MotifParams;
  values: PatternArray;
}

export interface PuzzlePattern {
  motifId: string;
  numCells: number;
  propertyPatterns: PropertyPattern[];
}
