import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CellConfig } from '../../core/models/puzzle.model';
import { PuzzleCellComponent } from '../puzzle-cell/puzzle-cell.component';

@Component({
  selector: 'app-puzzle-board',
  standalone: true,
  imports: [CommonModule, PuzzleCellComponent],
  templateUrl: './puzzle-board.component.html',
  styleUrl: './puzzle-board.component.css',
})
export class PuzzleBoardComponent {
  @Input() cells: Array<CellConfig | null> = [];
}
