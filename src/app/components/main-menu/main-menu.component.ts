import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-main-menu',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './main-menu.component.html',
  styleUrl: './main-menu.component.css',
})
export class MainMenuComponent {
  constructor(private router: Router) {}

  startClassic(): void {
    this.router.navigate(['/game'], { queryParams: { mode: 'classicTimed' } });
  }
}
