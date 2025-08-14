import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseAlgorithmComponent } from '../../../shared/base/base-algorithm.component';
import { DataGeneratorService } from '../../../shared/services/data-generator.service';

@Component({
  selector: 'app-insertion-sort',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './insertion-sort.component.html',
  styleUrls: ['./insertion-sort.component.css']
})
export class InsertionSortComponent extends BaseAlgorithmComponent implements OnInit {
  data: number[] = [];
  highlightedIndices: number[] = [];
  comparingIndices: number[] = [];
  currentIndex: number = -1;
  sortedIndices: number[] = [];

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
    this.currentIndex = -1;
    this.sortedIndices = [];
    this.resetStats();
  }

  async run(): Promise<void> {
    if (this.isRunning) return;

    this.startExecution();
    await this.insertionSort();
    this.endExecution();
  }

  private async insertionSort(): Promise<void> {
    const arr = [...this.data];
    const n = arr.length;
    
    // 最初の要素はソート済みとして開始
    this.sortedIndices = [0];

    for (let i = 1; i < n && this.isRunning; i++) {
      const key = arr[i];
      this.currentIndex = i;
      let j = i - 1;

      this.highlightedIndices = [i];
      await this.delay(this.settings.speed);

      while (j >= 0 && this.isRunning) {
        if (!this.isRunning) break;

        this.comparingIndices = [j, i];
        this.incrementComparison();
        await this.delay(this.settings.speed);

        if (arr[j] > key) {
          arr[j + 1] = arr[j];
          this.data = [...arr];
          this.incrementStep();
          await this.delay(this.settings.speed);
          j--;
        } else {
          break;
        }
      }

      if (this.isRunning) {
        arr[j + 1] = key;
        this.data = [...arr];
        this.sortedIndices = Array.from({ length: i + 1 }, (_, idx) => idx);
        this.incrementStep();
        await this.delay(this.settings.speed);
      }
    }

    if (this.isRunning) {
      this.highlightedIndices = [];
      this.comparingIndices = [];
      this.currentIndex = -1;
      this.sortedIndices = Array.from({ length: n }, (_, idx) => idx);
    }
  }
}