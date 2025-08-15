import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseAlgorithmComponent } from '../../../shared/base/base-algorithm.component';

interface GcdStep {
  a: number;
  b: number;
  quotient: number;
  remainder: number;
  step: number;
  operation: string;
}

@Component({
  selector: 'app-euclidean-gcd',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './euclidean-gcd.component.html',
  styleUrls: ['./euclidean-gcd.component.css']
})
export class EuclideanGcdComponent extends BaseAlgorithmComponent implements OnInit {
  protected Math = Math;
  originalA: number = 0;
  originalB: number = 0;
  currentA: number = 0;
  currentB: number = 0;
  gcdResult: number = 0;
  steps: GcdStep[] = [];
  currentStepIndex: number = -1;
  isComplete: boolean = false;
  
  // 拡張ユークリッド互除法用
  extendedMode: boolean = false;
  coefficients: { x: number, y: number } = { x: 0, y: 0 };
  extendedSteps: { a: number, b: number, x: number, y: number, q: number }[] = [];

  ngOnInit(): void {
    this.reset();
  }

  reset(): void {
    this.generateNumbers();
    this.currentA = this.originalA;
    this.currentB = this.originalB;
    this.gcdResult = 0;
    this.steps = [];
    this.currentStepIndex = -1;
    this.isComplete = false;
    this.coefficients = { x: 0, y: 0 };
    this.extendedSteps = [];
    this.resetStats();
  }

  private generateNumbers(): void {
    // 設定に基づいて数値を生成
    const maxValue = Math.max(20, this.settings.arraySize * 5);
    const minValue = Math.max(5, Math.floor(maxValue / 4));
    
    this.originalA = Math.floor(Math.random() * (maxValue - minValue)) + minValue;
    this.originalB = Math.floor(Math.random() * (maxValue - minValue)) + minValue;
    
    // より大きい数をaに設定
    if (this.originalA < this.originalB) {
      [this.originalA, this.originalB] = [this.originalB, this.originalA];
    }
  }

  async run(): Promise<void> {
    if (this.isRunning) return;

    this.startExecution();
    
    if (this.extendedMode) {
      await this.extendedEuclideanGcd();
    } else {
      await this.euclideanGcd();
    }
    
    this.endExecution();
  }

  private async euclideanGcd(): Promise<void> {
    let a = this.originalA;
    let b = this.originalB;
    let stepCount = 0;

    while (b !== 0 && this.isRunning) {
      if (!this.isRunning) break;

      const quotient = Math.floor(a / b);
      const remainder = a % b;

      const step: GcdStep = {
        a: a,
        b: b,
        quotient: quotient,
        remainder: remainder,
        step: stepCount,
        operation: `${a} = ${b} × ${quotient} + ${remainder}`
      };

      this.steps.push(step);
      this.currentStepIndex = stepCount;
      this.currentA = a;
      this.currentB = b;

      this.incrementStep();
      this.incrementComparison();
      await this.delay(this.settings.speed);

      if (!this.isRunning) break;

      a = b;
      b = remainder;
      stepCount++;

      await this.delay(this.settings.speed * 0.5);
    }

    if (this.isRunning) {
      this.gcdResult = a;
      this.isComplete = true;
      this.currentStepIndex = -1;
    }
  }

  private async extendedEuclideanGcd(): Promise<void> {
    let oldR = this.originalA;
    let r = this.originalB;
    let oldS = 1;
    let s = 0;
    let oldT = 0;
    let t = 1;
    let stepCount = 0;

    this.extendedSteps.push({ a: oldR, b: r, x: oldS, y: oldT, q: 0 });

    while (r !== 0 && this.isRunning) {
      if (!this.isRunning) break;

      const quotient = Math.floor(oldR / r);
      
      [oldR, r] = [r, oldR - quotient * r];
      [oldS, s] = [s, oldS - quotient * s];
      [oldT, t] = [t, oldT - quotient * t];

      this.extendedSteps.push({ a: oldR, b: r, x: oldS, y: oldT, q: quotient });
      this.currentStepIndex = stepCount;

      this.incrementStep();
      this.incrementComparison();
      await this.delay(this.settings.speed);

      stepCount++;
    }

    if (this.isRunning) {
      this.gcdResult = oldR;
      this.coefficients = { x: oldS, y: oldT };
      this.isComplete = true;
      this.currentStepIndex = -1;
    }
  }

  getStepClass(index: number): string {
    const classes = ['step-item'];
    
    if (this.currentStepIndex === index) {
      classes.push('current');
    } else if (index < this.currentStepIndex || this.isComplete) {
      classes.push('completed');
    }
    
    return classes.join(' ');
  }

  getResultText(): string {
    if (!this.isComplete) {
      return this.currentStepIndex >= 0 ? `ステップ ${this.currentStepIndex + 1} 実行中...` : '開始前';
    }
    
    if (this.extendedMode) {
      return `GCD(${this.originalA}, ${this.originalB}) = ${this.gcdResult}, ${this.originalA}×${this.coefficients.x} + ${this.originalB}×${this.coefficients.y} = ${this.gcdResult}`;
    }
    
    return `GCD(${this.originalA}, ${this.originalB}) = ${this.gcdResult}`;
  }

  getCurrentOperationText(): string {
    if (this.currentStepIndex === -1 || !this.steps[this.currentStepIndex]) {
      return '';
    }
    return this.steps[this.currentStepIndex].operation;
  }

  toggleExtendedMode(): void {
    if (!this.isRunning) {
      this.extendedMode = !this.extendedMode;
      this.reset();
    }
  }

  // 数値の視覚的表現のためのヘルパー
  getNumberBlocks(num: number): number[] {
    if (num <= 0) return [];
    return Array(Math.min(num, 50)).fill(0).map((_, i) => i);
  }

  getBlockClass(num: number, blockIndex: number): string {
    const classes = ['number-block'];
    
    if (this.isComplete) {
      if (blockIndex < this.gcdResult) {
        classes.push('gcd-part');
      }
    } else if (this.currentStepIndex >= 0) {
      const step = this.steps[this.currentStepIndex];
      if (step && blockIndex < step.remainder) {
        classes.push('remainder-part');
      }
    }
    
    return classes.join(' ');
  }

  getLcm(): number {
    if (this.gcdResult === 0) return 0;
    return (this.originalA * this.originalB) / this.gcdResult;
  }

  // 素因数分解の簡易表示
  getPrimeFactors(num: number): string {
    if (num <= 1) return '';
    
    const factors: number[] = [];
    let n = num;
    
    for (let i = 2; i * i <= n; i++) {
      while (n % i === 0) {
        factors.push(i);
        n /= i;
      }
    }
    
    if (n > 1) factors.push(n);
    
    const factorCount: { [key: number]: number } = {};
    factors.forEach(f => factorCount[f] = (factorCount[f] || 0) + 1);
    
    return Object.entries(factorCount)
      .map(([factor, count]) => count === 1 ? factor : `${factor}^${count}`)
      .join(' × ');
  }
}