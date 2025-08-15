import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseAlgorithmComponent } from '../../../shared/base/base-algorithm.component';

interface Coin {
  value: number;
  count: number;
  used: number;
}

@Component({
  selector: 'app-coin-change',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './coin-change.component.html',
  styleUrls: ['./coin-change.component.css']
})
export class CoinChangeComponent extends BaseAlgorithmComponent implements OnInit {
  protected Math = Math;
  targetAmount: number = 0;
  coins: Coin[] = [];
  currentCoinIndex: number = -1;
  remainingAmount: number = 0;
  totalCoinsUsed: number = 0;
  isComplete: boolean = false;
  steps: string[] = [];

  ngOnInit(): void {
    this.reset();
  }

  reset(): void {
    this.targetAmount = Math.floor(Math.random() * 95) + 15; // 15-109円
    this.initializeCoins();
    this.currentCoinIndex = -1;
    this.remainingAmount = this.targetAmount;
    this.totalCoinsUsed = 0;
    this.isComplete = false;
    this.steps = [];
    this.resetStats();
  }

  private initializeCoins(): void {
    // 日本の硬貨システム
    this.coins = [
      { value: 500, count: 0, used: 0 },
      { value: 100, count: 0, used: 0 },
      { value: 50, count: 0, used: 0 },
      { value: 10, count: 0, used: 0 },
      { value: 5, count: 0, used: 0 },
      { value: 1, count: 0, used: 0 }
    ];
  }

  async run(): Promise<void> {
    if (this.isRunning) return;

    this.startExecution();
    await this.greedyCoinChange();
    this.endExecution();
  }

  private async greedyCoinChange(): Promise<void> {
    this.remainingAmount = this.targetAmount;
    this.totalCoinsUsed = 0;
    this.steps = [];

    for (let i = 0; i < this.coins.length && this.isRunning; i++) {
      if (!this.isRunning) break;

      this.currentCoinIndex = i;
      const coin = this.coins[i];
      coin.used = 0;

      this.incrementStep();
      await this.delay(this.settings.speed);

      if (!this.isRunning) break;

      // この硬貨で何枚使えるかを計算
      const coinsNeeded = Math.floor(this.remainingAmount / coin.value);
      
      if (coinsNeeded > 0) {
        coin.used = coinsNeeded;
        coin.count = coinsNeeded;
        this.remainingAmount -= coinsNeeded * coin.value;
        this.totalCoinsUsed += coinsNeeded;

        // ステップを記録
        this.steps.push(`${coin.value}円硬貨を${coinsNeeded}枚使用`);
        
        this.incrementComparison();
        await this.delay(this.settings.speed);

        // 硬貨を一枚ずつアニメーション
        for (let j = 0; j < coinsNeeded && this.isRunning; j++) {
          await this.delay(this.settings.speed * 0.3);
        }
      }

      if (this.remainingAmount === 0) {
        break;
      }
    }

    if (this.isRunning) {
      this.isComplete = true;
      this.currentCoinIndex = -1;
    }
  }

  getCoinClass(index: number): string {
    const classes = ['coin'];
    
    if (this.currentCoinIndex === index) {
      classes.push('current');
    } else if (this.coins[index].used > 0) {
      classes.push('used');
    } else if (index < this.currentCoinIndex || this.isComplete) {
      classes.push('processed');
    }
    
    return classes.join(' ');
  }

  getCoinValueText(coin: Coin): string {
    return coin.value >= 100 ? `${coin.value}円` : `${coin.value}円`;
  }

  getEfficiencyPercentage(): number {
    if (this.targetAmount === 0) return 0;
    // 理論上の最小枚数との比較（1円硬貨のみの場合）
    const theoreticalMin = 1; // 貪欲法は硬貨問題では最適
    const efficiency = theoreticalMin / Math.max(this.totalCoinsUsed, 1);
    return Math.min(100, Math.round(efficiency * 100));
  }

  getCurrentStepText(): string {
    if (this.currentCoinIndex === -1) {
      return this.isComplete ? '完了' : '開始前';
    }
    
    const coin = this.coins[this.currentCoinIndex];
    const needed = Math.floor(this.remainingAmount / coin.value);
    
    if (needed > 0) {
      return `${coin.value}円硬貨: ${needed}枚必要 (残り${this.remainingAmount}円)`;
    } else {
      return `${coin.value}円硬貨: 使用不可 (残り${this.remainingAmount}円)`;
    }
  }

  getResultText(): string {
    if (!this.isComplete) {
      return '計算中...';
    }
    
    if (this.remainingAmount === 0) {
      return `成功！${this.targetAmount}円を${this.totalCoinsUsed}枚で支払い`;
    } else {
      return `残り${this.remainingAmount}円（硬貨不足）`;
    }
  }

  // 硬貨のサイズを値に応じて調整
  getCoinSize(value: number): number {
    switch (value) {
      case 500: return 60;
      case 100: return 50;
      case 50: return 45;
      case 10: return 40;
      case 5: return 35;
      case 1: return 30;
      default: return 40;
    }
  }

  // 硬貨の色を値に応じて設定
  getCoinColor(value: number): string {
    switch (value) {
      case 500: return '#C0C0C0'; // シルバー
      case 100: return '#C0C0C0'; // シルバー
      case 50: return '#C0C0C0'; // シルバー
      case 10: return '#CD7F32'; // ブロンズ
      case 5: return '#CD7F32'; // ブロンズ
      case 1: return '#CD7F32'; // ブロンズ
      default: return '#C0C0C0';
    }
  }
}