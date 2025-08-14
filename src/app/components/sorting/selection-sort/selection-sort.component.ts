import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseAlgorithmComponent } from '../../../shared/base/base-algorithm.component';
import { DataGeneratorService } from '../../../shared/services/data-generator.service';

@Component({
  selector: 'app-selection-sort',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './selection-sort.component.html',
  styleUrls: ['./selection-sort.component.css']
})
export class SelectionSortComponent extends BaseAlgorithmComponent implements OnInit {
  data: number[] = [];
  highlightedIndices: number[] = [];
  comparingIndices: number[] = [];
  minIndex: number = -1;

  constructor(private dataGenerator: DataGeneratorService) {
    super();
  }

  ngOnInit(): void {
    this.reset();
  }

  reset(): void {
    this.data = this.dataGenerator.generateArrayData(
      this.settings.arraySize,
      this.settings.dataType
    );
    this.highlightedIndices = [];
    this.comparingIndices = [];
    this.minIndex = -1;
    this.resetStats();
  }

  async run(): Promise<void> {
    if (this.isRunning) return;

    this.startExecution();
    await this.selectionSort();
    this.endExecution();
  }

  private async selectionSort(): Promise<void> {
    const arr = [...this.data];
    const n = arr.length;

    for (let i = 0; i < n - 1 && this.isRunning; i++) {
      let minIdx = i;
      this.minIndex = minIdx;

      for (let j = i + 1; j < n && this.isRunning; j++) {
        if (!this.isRunning) break;

        this.comparingIndices = [minIdx, j];
        this.incrementComparison();
        await this.delay(this.settings.speed);

        if (!this.isRunning) break;

        if (arr[j] < arr[minIdx]) {
          minIdx = j;
          this.minIndex = minIdx;
        }
      }

      if (this.isRunning && minIdx !== i) {
        [arr[i], arr[minIdx]] = [arr[minIdx], arr[i]];
        this.data = [...arr];
        this.highlightedIndices = [i, minIdx];
        this.incrementSwap();
        this.incrementStep();
        await this.delay(this.settings.speed);
      }
    }

    if (this.isRunning) {
      this.highlightedIndices = [];
      this.comparingIndices = [];
      this.minIndex = -1;
    }
  }
}