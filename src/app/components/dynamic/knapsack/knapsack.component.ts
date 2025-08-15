import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseAlgorithmComponent } from '../../../shared/base/base-algorithm.component';

interface KnapsackItem {
  id: number;
  name: string;
  weight: number;
  value: number;
  valuePerWeight: number;
}

@Component({
  selector: 'app-knapsack',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './knapsack.component.html',
  styleUrls: ['./knapsack.component.css']
})
export class KnapsackComponent extends BaseAlgorithmComponent implements OnInit {
  capacity: number = 10;
  items: KnapsackItem[] = [];
  dpTable: number[][] = [];
  currentRow: number = -1;
  currentCol: number = -1;
  selectedItems: Set<number> = new Set();
  totalValue: number = 0;
  totalWeight: number = 0;
  isComplete: boolean = false;

  ngOnInit(): void {
    this.reset();
  }

  reset(): void {
    this.capacity = Math.max(8, Math.min(this.settings.arraySize, 15));
    this.generateItems();
    this.initializeDPTable();
    this.currentRow = -1;
    this.currentCol = -1;
    this.selectedItems = new Set();
    this.totalValue = 0;
    this.totalWeight = 0;
    this.isComplete = false;
    this.resetStats();
  }

  private generateItems(): void {
    const itemNames = ['📱 スマホ', '💻 ノートPC', '⌚ 腕時計', '📚 本', '🎧 ヘッドホン', '📷 カメラ', '🎮 ゲーム機', '🔋 バッテリー'];
    const itemCount = Math.min(6, Math.max(4, Math.floor(this.settings.arraySize / 3)));
    
    this.items = [];
    for (let i = 0; i < itemCount; i++) {
      const weight = Math.floor(Math.random() * 4) + 1; // 1-4
      const baseValue = Math.floor(Math.random() * 8) + 2; // 2-9
      const item: KnapsackItem = {
        id: i,
        name: itemNames[i] || `アイテム${i + 1}`,
        weight: weight,
        value: baseValue,
        valuePerWeight: Math.round((baseValue / weight) * 10) / 10
      };
      this.items.push(item);
    }

    // 価値密度でソート（表示用）
    this.items.sort((a, b) => b.valuePerWeight - a.valuePerWeight);
    this.items.forEach((item, index) => item.id = index);
  }

  private initializeDPTable(): void {
    const n = this.items.length;
    this.dpTable = Array(n + 1).fill(null).map(() => Array(this.capacity + 1).fill(0));
  }

  async run(): Promise<void> {
    if (this.isRunning) return;

    this.startExecution();
    await this.solveKnapsack();
    await this.backtrack();
    this.endExecution();
  }

  private async solveKnapsack(): Promise<void> {
    const n = this.items.length;

    for (let i = 1; i <= n && this.isRunning; i++) {
      for (let w = 0; w <= this.capacity && this.isRunning; w++) {
        if (!this.isRunning) break;

        this.currentRow = i;
        this.currentCol = w;
        this.incrementStep();
        await this.delay(this.settings.speed);

        if (!this.isRunning) break;

        const item = this.items[i - 1];
        
        if (item.weight <= w) {
          // アイテムを取る場合と取らない場合の価値を比較
          const valueWithItem = this.dpTable[i - 1][w - item.weight] + item.value;
          const valueWithoutItem = this.dpTable[i - 1][w];
          
          this.dpTable[i][w] = Math.max(valueWithItem, valueWithoutItem);
          this.incrementComparison();
        } else {
          // アイテムの重量が容量を超える場合、取れない
          this.dpTable[i][w] = this.dpTable[i - 1][w];
        }

        await this.delay(this.settings.speed * 0.3);
      }
    }

    if (this.isRunning) {
      this.currentRow = -1;
      this.currentCol = -1;
    }
  }

  private async backtrack(): Promise<void> {
    if (!this.isRunning) return;

    const n = this.items.length;
    let i = n;
    let w = this.capacity;

    this.totalValue = this.dpTable[n][this.capacity];
    this.totalWeight = 0;

    while (i > 0 && w > 0 && this.isRunning) {
      this.currentRow = i;
      this.currentCol = w;
      await this.delay(this.settings.speed);

      if (!this.isRunning) break;

      // このアイテムが選ばれているかチェック
      if (this.dpTable[i][w] !== this.dpTable[i - 1][w]) {
        const item = this.items[i - 1];
        this.selectedItems.add(i - 1);
        this.totalWeight += item.weight;
        w -= item.weight;
        this.incrementStep();
      }
      i--;
    }

    if (this.isRunning) {
      this.isComplete = true;
      this.currentRow = -1;
      this.currentCol = -1;
    }
  }

  getDPCellClass(row: number, col: number): string {
    const baseClass = 'dp-cell';
    const classes = [baseClass];
    
    if (this.currentRow === row && this.currentCol === col) {
      classes.push('current');
    } else if (this.isComplete && this.isDPCellInSolution(row, col)) {
      classes.push('solution');
    } else if (row <= this.currentRow || this.isComplete) {
      classes.push('computed');
    }
    
    return classes.join(' ');
  }

  private isDPCellInSolution(row: number, col: number): boolean {
    if (!this.isComplete || row === 0 || col === 0) return false;
    
    // バックトラック経路をチェック（簡易版）
    let i = this.items.length;
    let w = this.capacity;
    
    while (i > 0 && w > 0) {
      if (this.dpTable[i][w] !== this.dpTable[i - 1][w]) {
        if (i === row && w === col) return true;
        const item = this.items[i - 1];
        w -= item.weight;
      }
      i--;
    }
    return false;
  }

  getItemClass(index: number): string {
    const classes = ['item'];
    if (this.selectedItems.has(index)) {
      classes.push('selected');
    }
    return classes.join(' ');
  }

  getResultText(): string {
    if (!this.isComplete) {
      return '計算中...';
    }
    return `最適解: 価値${this.totalValue}, 重量${this.totalWeight}/${this.capacity}`;
  }

  getEfficiencyPercentage(): number {
    if (this.capacity === 0) return 0;
    return Math.round((this.totalWeight / this.capacity) * 100);
  }
}