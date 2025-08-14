import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseAlgorithmComponent } from '../../../shared/base/base-algorithm.component';
import { DataGeneratorService } from '../../../shared/services/data-generator.service';

@Component({
  selector: 'app-bubble-sort',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './bubble-sort.component.html',
  styleUrls: ['./bubble-sort.component.css']
})
export class BubbleSortComponent extends BaseAlgorithmComponent implements OnInit {
  data: number[] = [];
  highlightedIndices: number[] = [];
  comparingIndices: number[] = [];

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
    this.resetStats();
  }

  async run(): Promise<void> {
    if (this.isRunning) return;

    this.startExecution();
    await this.bubbleSort();
    this.endExecution();
  }

  private async bubbleSort(): Promise<void> {
    const arr = [...this.data];
    const n = arr.length;

    for (let i = 0; i < n - 1 && this.isRunning; i++) {
      for (let j = 0; j < n - i - 1 && this.isRunning; j++) {
        if (!this.isRunning) break;

        // 比較する要素をハイライト
        this.comparingIndices = [j, j + 1];
        this.incrementComparison();
        await this.delay(this.settings.speed);

        if (!this.isRunning) break;

        if (arr[j] > arr[j + 1]) {
          // 交換
          [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
          this.data = [...arr];
          this.highlightedIndices = [j, j + 1];
          this.incrementSwap();
          this.incrementStep();
          await this.delay(this.settings.speed);
        }
      }
    }

    // 完了時のクリーンアップ
    if (this.isRunning) {
      this.highlightedIndices = [];
      this.comparingIndices = [];
    }
  }
}