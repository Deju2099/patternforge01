import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CellConfig } from '../../core/models/puzzle.model';
import { PuzzleCellComponent } from '../puzzle-cell/puzzle-cell.component';

@Component({
  selector: 'app-answer-grid',
  standalone: true,
  imports: [CommonModule, PuzzleCellComponent],
  templateUrl: './answer-grid.component.html',
  styleUrl: './answer-grid.component.css',
})
export class AnswerGridComponent {
  @Input() answers: CellConfig[] = [];
  @Input() selectedIndex = -1;
  @Output() selected = new EventEmitter<number>();

  pick(index: number): void {
    this.selected.emit(index);
  }
}
