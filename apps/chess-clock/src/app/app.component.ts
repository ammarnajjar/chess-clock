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
    this.timer.configure(this.minutes, this.increment);
    this.setVh();
    // run after initial render so DOM measurements are accurate
    setTimeout(() => this.adjustPlayerHeights(), 0);
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

  @HostListener('window:resize')
  @HostListener('window:orientationchange')
  onViewportChange() {
    this.setVh();
    this.adjustPlayerHeights();
  }

  private setVh() {
    // Set a CSS variable to the actual viewport height in px to work around mobile browser UI chrome
    try {
      const vh = window.innerHeight;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    } catch {
      // ignore during server-side rendering or tests
    }
  }

  private adjustPlayerHeights() {
    try {
      const board = document.querySelector('.board') as HTMLElement | null;
      const topbar = document.querySelector('.topbar') as HTMLElement | null;
      if (!board || !topbar) return;
      const w = window.innerWidth;
      if (w > 700) {
        document.documentElement.style.removeProperty('--player-height');
        // remove any inline heights we may have set previously
        const p1r = document.querySelector('.player.white') as HTMLElement | null;
        const p2r = document.querySelector('.player.black') as HTMLElement | null;
        if (p1r) p1r.style.height = '';
        if (p2r) p2r.style.height = '';
        return;
      }
      const styles = getComputedStyle(board);
      // try grid row gap then fallback to 8px
      const rowGap = parseFloat(styles.rowGap || styles.gap || '8') || 8;
      const headerHeight = topbar.getBoundingClientRect().height || 64;
      const available = Math.max(0, Math.floor(window.innerHeight - headerHeight - rowGap));
      const playerHeight = Math.floor(available / 2);
      document.documentElement.style.setProperty('--player-height', `${playerHeight}px`);
      // Also measure actual rendered heights and force both players to the same max height
      const p1 = document.querySelector('.player.white') as HTMLElement | null;
      const p2 = document.querySelector('.player.black') as HTMLElement | null;
      if (p1 && p2) {
        const h1 = p1.getBoundingClientRect().height;
        const h2 = p2.getBoundingClientRect().height;
        const final = Math.max(playerHeight, Math.ceil(Math.max(h1, h2)));
        p1.style.height = `${final}px`;
        p2.style.height = `${final}px`;
        // ensure min-height isn't preventing shrinking
        p1.style.minHeight = `${final}px`;
        p2.style.minHeight = `${final}px`;
      }
    } catch {
      // ignore in non-browser environments
    }
  }
}
