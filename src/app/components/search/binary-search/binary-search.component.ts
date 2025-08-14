import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseAlgorithmComponent } from '../../../shared/base/base-algorithm.component';
import { DataGeneratorService } from '../../../shared/services/data-generator.service';

@Component({
  selector: 'app-binary-search',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './binary-search.component.html',
  styleUrls: ['./binary-search.component.css']
})
export class BinarySearchComponent extends BaseAlgorithmComponent implements OnInit {
  data: number[] = [];
  target: number = 0;
  left: number = 0;
  right: number = 0;
  mid: number = -1;
  foundIndex: number = -1;
  searchComplete: boolean = false;
  excludedIndices: Set<number> = new Set();

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
    // ソートしてからターゲットを選択
    this.data.sort((a, b) => a - b);
    this.target = this.data[Math.floor(Math.random() * this.data.length)];
    
    this.left = 0;
    this.right = this.data.length - 1;
    this.mid = -1;
    this.foundIndex = -1;
    this.searchComplete = false;
    this.excludedIndices = new Set();
    this.resetStats();
  }

  async run(): Promise<void> {
    if (this.isRunning) return;

    this.startExecution();
    await this.binarySearch();
    this.endExecution();
  }

  private async binarySearch(): Promise<void> {
    this.searchComplete = false;
    
    while (this.left <= this.right && this.isRunning) {
      if (!this.isRunning) break;

      this.mid = Math.floor((this.left + this.right) / 2);
      this.incrementStep();
      await this.delay(this.settings.speed);

      if (!this.isRunning) break;

      this.incrementComparison();
      await this.delay(this.settings.speed);

      if (this.data[this.mid] === this.target) {
        this.foundIndex = this.mid;
        this.searchComplete = true;
        await this.delay(this.settings.speed);
        break;
      } else if (this.data[this.mid] < this.target) {
        // 左半分を除外
        for (let i = this.left; i <= this.mid; i++) {
          this.excludedIndices.add(i);
        }
        this.left = this.mid + 1;
      } else {
        // 右半分を除外
        for (let i = this.mid; i <= this.right; i++) {
          this.excludedIndices.add(i);
        }
        this.right = this.mid - 1;
      }
      
      await this.delay(this.settings.speed);
    }

    if (this.isRunning && this.foundIndex === -1) {
      this.searchComplete = true;
    }

    if (this.isRunning) {
      this.mid = -1;
    }
  }

  getResultMessage(): string {
    if (!this.searchComplete) {
      return '検索中...';
    }
    if (this.foundIndex !== -1) {
      return `ターゲット ${this.target} をインデックス ${this.foundIndex} で発見！`;
    }
    return `ターゲット ${this.target} は見つかりませんでした。`;
  }

  getRangeText(): string {
    if (this.searchComplete) {
      return '検索完了';
    }
    return `検索範囲: [${this.left}, ${this.right}]`;
  }
}