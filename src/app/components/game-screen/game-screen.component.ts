import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { GameStateService } from '../../core/services/game-state.service';
import { PuzzleBoardComponent } from '../puzzle-board/puzzle-board.component';
import { AnswerGridComponent } from '../answer-grid/answer-grid.component';
import { GameHudComponent } from '../game-hud/game-hud.component';

@Component({
  selector: 'app-game-screen',
  standalone: true,
  imports: [CommonModule, PuzzleBoardComponent, AnswerGridComponent, GameHudComponent],
  templateUrl: './game-screen.component.html',
  styleUrl: './game-screen.component.css',
})
export class GameScreenComponent implements OnInit, OnDestroy {
  selectedIndex = -1;
  feedback = '';
  timerRef?: any;

  constructor(
    public game: GameStateService,
    private route: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    const tier = Number(this.route.snapshot.queryParamMap.get('tier') ?? 2);
    const mode = (this.route.snapshot.queryParamMap.get('mode') as any) ?? 'classicTimed';
    this.game.start(mode, Number.isFinite(tier) ? tier : 2);
    this.beginTimer();
  }

  ngOnDestroy(): void {
    if (this.timerRef) {
      clearInterval(this.timerRef);
    }
  }

  selectAnswer(index: number): void {
    this.selectedIndex = index;
  }

  submit(): void {
    if (this.selectedIndex < 0) return;
    const correct = this.game.answer(this.selectedIndex);
    this.feedback = correct ? 'Correct – streak +1' : 'Incorrect – try the next puzzle';
    this.selectedIndex = -1;
  }

  private beginTimer(): void {
    this.timerRef = setInterval(() => {
      if (this.game.state.timeRemaining && this.game.state.timeRemaining > 0) {
        this.game.state.timeRemaining -= 1;
      }
    }, 1000);
  }
}
