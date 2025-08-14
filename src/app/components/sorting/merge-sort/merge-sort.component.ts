import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseAlgorithmComponent } from '../../../shared/base/base-algorithm.component';
import { DataGeneratorService } from '../../../shared/services/data-generator.service';

@Component({
  selector: 'app-merge-sort',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './merge-sort.component.html',
  styleUrls: ['./merge-sort.component.css']
})
export class MergeSortComponent extends BaseAlgorithmComponent implements OnInit {
  data: number[] = [];
  highlightedIndices: number[] = [];
  comparingIndices: number[] = [];
  mergeIndices: number[] = [];

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
    this.mergeIndices = [];
    this.resetStats();
  }

  async run(): Promise<void> {
    if (this.isRunning) return;

    this.startExecution();
    const arr = [...this.data];
    await this.mergeSort(arr, 0, arr.length - 1);
    this.data = arr;
    this.endExecution();
  }

  private async mergeSort(arr: number[], left: number, right: number): Promise<void> {
    if (left < right && this.isRunning) {
      const middle = Math.floor((left + right) / 2);

      await this.mergeSort(arr, left, middle);
      if (this.isRunning) {
        await this.mergeSort(arr, middle + 1, right);
      }
      if (this.isRunning) {
        await this.merge(arr, left, middle, right);
      }
    }
  }

  private async merge(arr: number[], left: number, middle: number, right: number): Promise<void> {
    const leftArray = arr.slice(left, middle + 1);
    const rightArray = arr.slice(middle + 1, right + 1);

    let i = 0, j = 0, k = left;

    this.mergeIndices = Array.from({ length: right - left + 1 }, (_, idx) => left + idx);

    while (i < leftArray.length && j < rightArray.length && this.isRunning) {
      if (!this.isRunning) break;

      this.comparingIndices = [left + i, middle + 1 + j];
      this.incrementComparison();
      await this.delay(this.settings.speed);

      if (!this.isRunning) break;

      if (leftArray[i] <= rightArray[j]) {
        arr[k] = leftArray[i];
        i++;
      } else {
        arr[k] = rightArray[j];
        j++;
      }

      this.data = [...arr];
      this.highlightedIndices = [k];
      this.incrementStep();
      await this.delay(this.settings.speed);
      k++;
    }

    while (i < leftArray.length && this.isRunning) {
      arr[k] = leftArray[i];
      this.data = [...arr];
      this.highlightedIndices = [k];
      this.incrementStep();
      await this.delay(this.settings.speed);
      i++;
      k++;
    }

    while (j < rightArray.length && this.isRunning) {
      arr[k] = rightArray[j];
      this.data = [...arr];
      this.highlightedIndices = [k];
      this.incrementStep();
      await this.delay(this.settings.speed);
      j++;
      k++;
    }

    if (this.isRunning) {
      this.mergeIndices = [];
    }
  }
}