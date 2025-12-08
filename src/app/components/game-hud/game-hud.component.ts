import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SessionState } from '../../core/models/session.model';

@Component({
  selector: 'app-game-hud',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './game-hud.component.html',
  styleUrl: './game-hud.component.css',
})
export class GameHudComponent {
  @Input() state!: SessionState;
}
