import { CommonModule } from '@angular/common';
import { Component, HostListener, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TimerService } from './timer.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  providers: [TimerService],
})
export class AppComponent {
  minutes = 5;
  increment = 0;

  timer = inject(TimerService) as TimerService;
  showSettings = false;

  constructor() {
    // initial configuration
    this.timer.configure(this.minutes, this.increment);
  }

  applySettings() {
    this.timer.configure(this.minutes, this.increment);
  }

  toggleStartPause() {
    if (this.timer.running) this.timer.pause();
    else this.timer.start();
  }

  playerClick(index: number) {
    // If not running, allow starting by clicking a player
    if (!this.timer.running) {
      this.timer.start();
      this.timer.activePlayer = index === 0 ? 1 : 0; // start the other player so click switches
      this.timer.switch(index);
      return;
    }
    this.timer.switch(index);
  }

  @HostListener('window:keydown', ['$event'])
  onKeydown(event: KeyboardEvent) {
    if (event.code === 'Space') {
      event.preventDefault();
      // spacebar switches player
      const next = this.timer.activePlayer === 0 ? 1 : 0;
      if (this.timer.running) this.timer.switch(next);
      else this.toggleStartPause();
    }
  }
}
