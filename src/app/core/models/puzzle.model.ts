import { GameMode } from './session.model';
import { MotifParams } from './motif.model';

export interface CellConfig {
  motifId: string;
  params: MotifParams;
}

export interface PuzzleInstance {
  id: string;
  mode: GameMode;
  difficultyTier: number;
  cells: CellConfig[];
  visibleCells: Array<CellConfig | null>;
  correctAnswerIndex: number;
  answers: CellConfig[];
  explanationMeta?: any;
}
