import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseAlgorithmComponent } from '../../../shared/base/base-algorithm.component';
import { DataGeneratorService } from '../../../shared/services/data-generator.service';

@Component({
  selector: 'app-quick-sort',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './quick-sort.component.html',
  styleUrls: ['./quick-sort.component.css']
})
export class QuickSortComponent extends BaseAlgorithmComponent implements OnInit {
  data: number[] = [];
  highlightedIndices: number[] = [];
  comparingIndices: number[] = [];
  pivotIndex: number = -1;

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
    this.pivotIndex = -1;
    this.resetStats();
  }

  async run(): Promise<void> {
    if (this.isRunning) return;

    this.startExecution();
    const arr = [...this.data];
    await this.quickSort(arr, 0, arr.length - 1);
    this.data = arr;
    this.endExecution();
  }

  private async quickSort(arr: number[], low: number, high: number): Promise<void> {
    if (low < high && this.isRunning) {
      const pi = await this.partition(arr, low, high);
      if (this.isRunning) {
        await this.quickSort(arr, low, pi - 1);
      }
      if (this.isRunning) {
        await this.quickSort(arr, pi + 1, high);
      }
    }
  }

  private async partition(arr: number[], low: number, high: number): Promise<number> {
    const pivot = arr[high];
    this.pivotIndex = high;
    let i = low - 1;

    for (let j = low; j < high && this.isRunning; j++) {
      if (!this.isRunning) break;

      this.comparingIndices = [j, high];
      this.incrementComparison();
      await this.delay(this.settings.speed);

      if (!this.isRunning) break;

      if (arr[j] < pivot) {
        i++;
        [arr[i], arr[j]] = [arr[j], arr[i]];
        this.data = [...arr];
        this.highlightedIndices = [i, j];
        this.incrementSwap();
        this.incrementStep();
        await this.delay(this.settings.speed);
      }
    }

    if (this.isRunning) {
      [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]];
      this.data = [...arr];
      this.incrementSwap();
      this.pivotIndex = -1;
    }
    return i + 1;
  }
}