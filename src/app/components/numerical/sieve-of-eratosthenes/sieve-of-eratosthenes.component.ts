import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseAlgorithmComponent } from '../../../shared/base/base-algorithm.component';

interface NumberCell {
  value: number;
  isPrime: boolean;
  isMarked: boolean;
  markedBy: number;
  isCurrentMultiple: boolean;
}

@Component({
  selector: 'app-sieve-of-eratosthenes',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sieve-of-eratosthenes.component.html',
  styleUrls: ['./sieve-of-eratosthenes.component.css']
})
export class SieveOfEratosthenesComponent extends BaseAlgorithmComponent implements OnInit {
  protected Math = Math;
  maxNumber: number = 30;
  numbers: NumberCell[] = [];
  currentPrime: number = 2;
  primes: number[] = [];
  isComplete: boolean = false;
  currentStep: string = '';
  
  // 統計情報
  totalChecked: number = 0;
  multiplesMarked: number = 0;

  ngOnInit(): void {
    this.reset();
  }

  reset(): void {
    this.maxNumber = Math.max(20, Math.min(this.settings.arraySize * 2, 100));
    this.initializeNumbers();
    this.currentPrime = 2;
    this.primes = [];
    this.isComplete = false;
    this.currentStep = '';
    this.totalChecked = 0;
    this.multiplesMarked = 0;
    this.resetStats();
  }

  private initializeNumbers(): void {
    this.numbers = [];
    
    // 1は素数ではないので最初からマーク
    this.numbers.push({
      value: 1,
      isPrime: false,
      isMarked: true,
      markedBy: 0,
      isCurrentMultiple: false
    });

    // 2からmaxNumberまでの数を初期化
    for (let i = 2; i <= this.maxNumber; i++) {
      this.numbers.push({
        value: i,
        isPrime: true,
        isMarked: false,
        markedBy: 0,
        isCurrentMultiple: false
      });
    }
  }

  async run(): Promise<void> {
    if (this.isRunning) return;

    this.startExecution();
    await this.sieveOfEratosthenes();
    this.endExecution();
  }

  private async sieveOfEratosthenes(): Promise<void> {
    // √maxNumberまでの素数について処理
    const limit = Math.sqrt(this.maxNumber);

    while (this.currentPrime <= limit && this.isRunning) {
      if (!this.isRunning) break;

      // 現在の素数が既にマークされていない場合（つまり素数の場合）
      const primeIndex = this.currentPrime - 1;
      if (!this.numbers[primeIndex].isMarked) {
        
        // 素数リストに追加
        this.primes.push(this.currentPrime);
        this.currentStep = `${this.currentPrime} は素数です`;
        this.incrementStep();
        await this.delay(this.settings.speed);

        if (!this.isRunning) break;

        // この素数の倍数をマーク
        await this.markMultiples(this.currentPrime);
      }

      // 次の素数を探す
      this.currentPrime = this.findNextUnmarked(this.currentPrime + 1);
      this.totalChecked++;
    }

    if (this.isRunning) {
      // 残りの未マークの数を素数として追加
      for (let i = this.currentPrime; i <= this.maxNumber; i++) {
        const index = i - 1;
        if (!this.numbers[index].isMarked) {
          this.primes.push(i);
          this.numbers[index].isPrime = true;
        }
      }

      this.isComplete = true;
      this.currentStep = `完了！${this.primes.length}個の素数が見つかりました`;
      this.clearCurrentMultiples();
    }
  }

  private async markMultiples(prime: number): Promise<void> {
    this.currentStep = `${prime} の倍数をマークしています...`;
    
    // prime^2から開始（それより小さい倍数は既に処理済み）
    for (let multiple = prime * prime; multiple <= this.maxNumber; multiple += prime) {
      if (!this.isRunning) break;

      const index = multiple - 1;
      
      // 現在処理中の倍数をハイライト
      this.clearCurrentMultiples();
      this.numbers[index].isCurrentMultiple = true;
      
      if (!this.numbers[index].isMarked) {
        this.numbers[index].isMarked = true;
        this.numbers[index].markedBy = prime;
        this.numbers[index].isPrime = false;
        this.multiplesMarked++;
        this.incrementComparison();
      }

      await this.delay(this.settings.speed * 0.5);
    }

    this.clearCurrentMultiples();
  }

  private findNextUnmarked(start: number): number {
    for (let i = start; i <= this.maxNumber; i++) {
      const index = i - 1;
      if (index < this.numbers.length && !this.numbers[index].isMarked) {
        return i;
      }
    }
    return this.maxNumber + 1; // 見つからない場合
  }

  private clearCurrentMultiples(): void {
    this.numbers.forEach(num => num.isCurrentMultiple = false);
  }

  getCellClass(number: NumberCell): string {
    const classes = ['number-cell'];
    
    if (number.value === 1) {
      classes.push('not-prime');
    } else if (number.isCurrentMultiple) {
      classes.push('current-multiple');
    } else if (number.value === this.currentPrime && !this.isComplete) {
      classes.push('current-prime');
    } else if (this.primes.includes(number.value)) {
      classes.push('prime');
    } else if (number.isMarked) {
      classes.push('marked');
    } else {
      classes.push('unmarked');
    }
    
    return classes.join(' ');
  }

  getResultText(): string {
    if (!this.isComplete) {
      if (this.currentPrime <= this.maxNumber) {
        return `${this.currentPrime} の処理中... (見つかった素数: ${this.primes.length}個)`;
      }
      return '開始前';
    }
    return `完了！2〜${this.maxNumber}の範囲で${this.primes.length}個の素数が見つかりました`;
  }

  getPrimeFactorization(num: number): number[] {
    const factors: number[] = [];
    let n = num;
    
    for (const prime of this.primes) {
      if (prime * prime > n) break;
      while (n % prime === 0) {
        factors.push(prime);
        n /= prime;
      }
    }
    
    if (n > 1) factors.push(n);
    return factors;
  }

  isPerfectSquare(num: number): boolean {
    const sqrt = Math.sqrt(num);
    return sqrt === Math.floor(sqrt);
  }

  getTwinPrimes(): [number, number][] {
    const twins: [number, number][] = [];
    for (let i = 0; i < this.primes.length - 1; i++) {
      if (this.primes[i + 1] - this.primes[i] === 2) {
        twins.push([this.primes[i], this.primes[i + 1]]);
      }
    }
    return twins;
  }

  getPrimeGaps(): number[] {
    const gaps: number[] = [];
    for (let i = 0; i < this.primes.length - 1; i++) {
      gaps.push(this.primes[i + 1] - this.primes[i]);
    }
    return gaps;
  }

  getLargestPrimeGap(): number {
    const gaps = this.getPrimeGaps();
    return gaps.length > 0 ? Math.max(...gaps) : 0;
  }

  getPrimeDensity(): number {
    return this.primes.length / (this.maxNumber - 1) * 100;
  }

  getNumberInfo(number: NumberCell): string {
    if (number.value === 1) {
      return '1 (素数ではない)';
    }
    
    if (this.primes.includes(number.value)) {
      return `${number.value} (素数)`;
    }
    
    if (number.isMarked && number.markedBy > 0) {
      const factors = this.getPrimeFactorization(number.value);
      return `${number.value} = ${factors.join(' × ')} (${number.markedBy}の倍数)`;
    }
    
    return `${number.value}`;
  }

  // グリッドのレイアウト計算
  getGridColumns(): number {
    if (this.maxNumber <= 30) return 10;
    if (this.maxNumber <= 50) return 10;
    if (this.maxNumber <= 100) return 12;
    return 15;
  }

  // テンプレート用のヘルパーメソッド
  getEvenPrimesCount(): number {
    return this.primes.filter(p => p % 2 === 0).length;
  }

  getOddPrimesCount(): number {
    return this.primes.filter(p => p % 2 === 1).length;
  }

  getPrimesEndingWith(digit: number): number {
    return this.primes.filter(p => p % 10 === digit).length;
  }

  getPerfectSquareAdjacentPrimes(): number[] {
    return this.primes.filter(p => this.isPerfectSquare(p - 1) || this.isPerfectSquare(p + 1)).slice(0, 5);
  }
}