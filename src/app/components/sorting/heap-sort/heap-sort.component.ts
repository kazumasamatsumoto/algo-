import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseAlgorithmComponent } from '../../../shared/base/base-algorithm.component';
import { DataGeneratorService } from '../../../shared/services/data-generator.service';

@Component({
  selector: 'app-heap-sort',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './heap-sort.component.html',
  styleUrls: ['./heap-sort.component.css']
})
export class HeapSortComponent extends BaseAlgorithmComponent implements OnInit {
  data: number[] = [];
  highlightedIndices: number[] = [];
  comparingIndices: number[] = [];
  heapIndices: number[] = [];

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
    this.heapIndices = [];
    this.resetStats();
  }

  async run(): Promise<void> {
    if (this.isRunning) return;

    this.startExecution();
    await this.heapSort();
    this.endExecution();
  }

  private async heapSort(): Promise<void> {
    const arr = [...this.data];
    const n = arr.length;

    // ヒープを構築
    for (let i = Math.floor(n / 2) - 1; i >= 0 && this.isRunning; i--) {
      await this.heapify(arr, n, i);
    }

    // ヒープから要素を一つずつ取り出してソート
    for (let i = n - 1; i > 0 && this.isRunning; i--) {
      if (!this.isRunning) break;

      // 根（最大値）を現在の最後の要素と交換
      [arr[0], arr[i]] = [arr[i], arr[0]];
      this.data = [...arr];
      this.highlightedIndices = [0, i];
      this.incrementSwap();
      this.incrementStep();
      await this.delay(this.settings.speed);

      if (!this.isRunning) break;

      // 縮小したヒープを再ヒープ化
      await this.heapify(arr, i, 0);
    }

    if (this.isRunning) {
      this.highlightedIndices = [];
      this.comparingIndices = [];
      this.heapIndices = [];
    }
  }

  private async heapify(arr: number[], n: number, i: number): Promise<void> {
    let largest = i;
    const left = 2 * i + 1;
    const right = 2 * i + 2;

    this.heapIndices = [i];
    if (left < n) this.heapIndices.push(left);
    if (right < n) this.heapIndices.push(right);

    await this.delay(this.settings.speed);

    if (left < n && this.isRunning) {
      this.comparingIndices = [left, largest];
      this.incrementComparison();
      await this.delay(this.settings.speed);

      if (arr[left] > arr[largest]) {
        largest = left;
      }
    }

    if (right < n && this.isRunning) {
      this.comparingIndices = [right, largest];
      this.incrementComparison();
      await this.delay(this.settings.speed);

      if (arr[right] > arr[largest]) {
        largest = right;
      }
    }

    if (largest !== i && this.isRunning) {
      [arr[i], arr[largest]] = [arr[largest], arr[i]];
      this.data = [...arr];
      this.highlightedIndices = [i, largest];
      this.incrementSwap();
      this.incrementStep();
      await this.delay(this.settings.speed);

      if (this.isRunning) {
        await this.heapify(arr, n, largest);
      }
    }
  }
}