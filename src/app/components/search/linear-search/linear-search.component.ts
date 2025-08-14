import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseAlgorithmComponent } from '../../../shared/base/base-algorithm.component';
import { DataGeneratorService } from '../../../shared/services/data-generator.service';

@Component({
  selector: 'app-linear-search',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './linear-search.component.html',
  styleUrls: ['./linear-search.component.css']
})
export class LinearSearchComponent extends BaseAlgorithmComponent implements OnInit {
  data: number[] = [];
  target: number = 0;
  currentIndex: number = -1;
  foundIndex: number = -1;
  searchComplete: boolean = false;

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
    // ターゲットは配列内のランダムな値を選択
    this.target = this.data[Math.floor(Math.random() * this.data.length)];
    this.currentIndex = -1;
    this.foundIndex = -1;
    this.searchComplete = false;
    this.resetStats();
  }

  async run(): Promise<void> {
    if (this.isRunning) return;

    this.startExecution();
    await this.linearSearch();
    this.endExecution();
  }

  private async linearSearch(): Promise<void> {
    this.searchComplete = false;
    
    for (let i = 0; i < this.data.length && this.isRunning; i++) {
      if (!this.isRunning) break;

      this.currentIndex = i;
      this.incrementComparison();
      this.incrementStep();
      await this.delay(this.settings.speed);

      if (!this.isRunning) break;

      if (this.data[i] === this.target) {
        this.foundIndex = i;
        this.searchComplete = true;
        await this.delay(this.settings.speed);
        break;
      }
    }

    if (this.isRunning && this.foundIndex === -1) {
      this.searchComplete = true;
    }

    if (this.isRunning) {
      this.currentIndex = -1;
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
}