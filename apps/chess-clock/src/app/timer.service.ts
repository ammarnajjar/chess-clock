import { Injectable } from '@angular/core';
import { interval, Subscription } from 'rxjs';

@Injectable()
export class TimerService {
  // configurable in minutes and seconds
  initialMinutes = 5;
  incrementSeconds = 0;

  times = [this.initialMinutes * 60 * 1000, this.initialMinutes * 60 * 1000];
  remaining = [this.times[0], this.times[1]];
  moveCount = [0, 0];

  activePlayer: number | null = null;
  running = false;

  private tickSub: Subscription | null = null;
  private tick$ = interval(100);

  configure(minutes: number, incrementSec: number) {
    this.initialMinutes = minutes;
    this.incrementSeconds = incrementSec;
    this.times = [minutes * 60 * 1000, minutes * 60 * 1000];
    this.reset();
  }

  start() {
    if (this.running) return;
    this.running = true;
    if (this.activePlayer === null) this.activePlayer = 0;
    this.tickSub = this.tick$.subscribe(() => this.onTick());
  }

  pause() {
    this.running = false;
    this.tickSub?.unsubscribe();
    this.tickSub = null;
  }

  reset() {
    this.pause();
    this.remaining = [this.times[0], this.times[1]];
    this.moveCount = [0, 0];
    this.activePlayer = null;
  }

  // Switches turn and applies per-move increment to the player who just moved
  switch(player: number) {
    if (!this.running) return;
    if (this.activePlayer === player) return;
    const prev = this.activePlayer;
    // apply increment to the player who just played (prev)
    if (prev !== null) {
      this.remaining[prev] += this.incrementSeconds * 1000;
      this.moveCount[prev]++;
    }
    this.activePlayer = player;
  }

  private onTick() {
    if (this.activePlayer === null) return;
    this.remaining[this.activePlayer] -= 100;
    if (this.remaining[this.activePlayer] <= 0) {
      this.remaining[this.activePlayer] = 0;
      this.pause();
    }
  }

  displayTime(player: number) {
    const ms = Math.max(0, this.remaining[player]);
    const s = Math.floor(ms / 1000);
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  }
}
