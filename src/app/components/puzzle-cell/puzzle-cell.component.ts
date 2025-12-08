import { AfterViewInit, Component, ElementRef, Input, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CellConfig } from '../../core/models/puzzle.model';
import { MotifRendererService } from '../../core/services/motif-renderer.service';

@Component({
  selector: 'app-puzzle-cell',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './puzzle-cell.component.html',
  styleUrl: './puzzle-cell.component.css',
})
export class PuzzleCellComponent implements AfterViewInit {
  @Input() cell: CellConfig | null = null;
  @Input() selectable = false;
  @Input() selected = false;
  @Input() label?: string;

  @ViewChild('canvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;

  constructor(private renderer: MotifRendererService) {}

  ngAfterViewInit(): void {
    this.render();
  }

  ngOnChanges(): void {
    this.render();
  }

  private render(): void {
    if (!this.canvasRef) return;
    this.renderer.render(this.canvasRef.nativeElement, this.cell);
  }
}
