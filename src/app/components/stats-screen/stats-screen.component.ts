import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StatsService } from '../../core/services/stats.service';

@Component({
  selector: 'app-stats-screen',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './stats-screen.component.html',
  styleUrl: './stats-screen.component.css',
})
export class StatsScreenComponent {
  constructor(public stats: StatsService) {}
}
