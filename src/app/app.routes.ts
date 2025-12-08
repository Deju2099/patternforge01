import { Routes } from '@angular/router';
import { MainMenuComponent } from './components/main-menu/main-menu.component';
import { GameScreenComponent } from './components/game-screen/game-screen.component';
import { StatsScreenComponent } from './components/stats-screen/stats-screen.component';
import { PuzzleLabsComponent } from './components/puzzle-labs/puzzle-labs.component';

export const appRoutes: Routes = [
  { path: '', component: MainMenuComponent },
  { path: 'game', component: GameScreenComponent },
  { path: 'stats', component: StatsScreenComponent },
  { path: 'labs', component: PuzzleLabsComponent },
  { path: '**', redirectTo: '' },
];
