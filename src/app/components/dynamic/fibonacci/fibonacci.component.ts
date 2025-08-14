import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseAlgorithmComponent } from '../../../shared/base/base-algorithm.component';

@Component({
  selector: 'app-fibonacci',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './fibonacci.component.html',
  styleUrls: ['./fibonacci.component.css']
})
export class FibonacciComponent extends BaseAlgorithmComponent implements OnInit {
  n: number = 10;
  fibValues: number[] = [];
  memo: Map<number, number> = new Map();
  currentIndex: number = -1;
  calculatingIndices: number[] = [];
  memoized: Set<number> = new Set();

  ngOnInit(): void {
    this.reset();
  }

  reset(): void {
    this.n = Math.min(this.settings.arraySize, 20); // フィボナッチは20以下に制限
    this.fibValues = new Array(this.n + 1).fill(-1);
    this.memo = new Map();
    this.currentIndex = -1;
    this.calculatingIndices = [];
    this.memoized = new Set();
    this.resetStats();
  }

  async run(): Promise<void> {
    if (this.isRunning) return;

    this.startExecution();
    await this.fibonacciWithMemo(this.n);
    this.endExecution();
  }

  private async fibonacciWithMemo(n: number): Promise<number> {
    if (!this.isRunning) return 0;

    this.currentIndex = n;
    this.calculatingIndices.push(n);
    this.incrementStep();
    await this.delay(this.settings.speed);

    // メモ化チェック
    if (this.memo.has(n)) {
      this.memoized.add(n);
      this.calculatingIndices = this.calculatingIndices.filter(i => i !== n);
      await this.delay(this.settings.speed);
      return this.memo.get(n)!;
    }

    let result: number;

    // ベースケース
    if (n <= 1) {
      result = n;
      this.fibValues[n] = result;
      this.memo.set(n, result);
      this.incrementComparison();
    } else {
      // 再帰計算
      this.incrementComparison();
      await this.delay(this.settings.speed);
      
      const fib1 = await this.fibonacciWithMemo(n - 1);
      if (!this.isRunning) return 0;
      
      const fib2 = await this.fibonacciWithMemo(n - 2);
      if (!this.isRunning) return 0;
      
      result = fib1 + fib2;
      this.fibValues[n] = result;
      this.memo.set(n, result);
      this.incrementStep();
    }

    this.calculatingIndices = this.calculatingIndices.filter(i => i !== n);
    await this.delay(this.settings.speed);

    return result;
  }

  getFibonacciSequence(): string {
    const validValues = this.fibValues.filter(v => v !== -1);
    return validValues.join(', ');
  }

  getMemoizedCount(): number {
    return this.memo.size;
  }
}