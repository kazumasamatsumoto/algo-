import { Component, Input, Output, EventEmitter, OnDestroy } from '@angular/core';
import { AlgorithmType, AlgorithmSettings, ExecutionStats, AlgorithmComponent } from '../interfaces/algorithm.interface';

@Component({
  template: ''
})
export abstract class BaseAlgorithmComponent implements AlgorithmComponent, OnDestroy {
  @Input() algorithmType!: AlgorithmType;
  @Input() settings!: AlgorithmSettings;
  @Output() statsChange = new EventEmitter<ExecutionStats>();
  @Output() runningChange = new EventEmitter<boolean>();

  isRunning = false;
  stats: ExecutionStats = {
    steps: 0,
    swaps: 0,
    comparisons: 0,
    timeMs: 0
  };

  protected startTime = 0;

  ngOnDestroy(): void {
    this.stop();
  }

  abstract run(): Promise<void>;
  abstract reset(): void;

  stop(): void {
    this.isRunning = false;
    this.emitRunningChange();
  }

  protected startExecution(): void {
    this.isRunning = true;
    this.resetStats();
    this.startTime = Date.now();
    this.emitRunningChange();
  }

  protected endExecution(): void {
    this.isRunning = false;
    this.stats.timeMs = Date.now() - this.startTime;
    this.emitStatsChange();
    this.emitRunningChange();
  }

  protected resetStats(): void {
    this.stats = {
      steps: 0,
      swaps: 0,
      comparisons: 0,
      timeMs: 0
    };
    this.emitStatsChange();
  }

  protected incrementStep(): void {
    this.stats.steps++;
    this.emitStatsChange();
  }

  protected incrementSwap(): void {
    this.stats.swaps++;
    this.emitStatsChange();
  }

  protected incrementComparison(): void {
    this.stats.comparisons++;
    this.emitStatsChange();
  }

  protected delay(ms: number): Promise<void> {
    return new Promise(resolve => {
      if (ms === 0) {
        resolve();
      } else {
        setTimeout(resolve, ms);
      }
    });
  }

  private emitStatsChange(): void {
    this.statsChange.emit({ ...this.stats });
  }

  private emitRunningChange(): void {
    this.runningChange.emit(this.isRunning);
  }
}