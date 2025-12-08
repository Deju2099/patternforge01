export type GameMode =
  | 'classicTimed'
  | 'perPuzzleTimer'
  | 'survival'
  | 'patternMastery'
  | 'puzzleLabs';

export interface SessionState {
  mode: GameMode;
  difficultyTier: number;
  currentScore: number;
  streak: number;
  lives: number;
  timeRemaining?: number;
  totalTime?: number;
}
