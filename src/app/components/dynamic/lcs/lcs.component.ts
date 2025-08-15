import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseAlgorithmComponent } from '../../../shared/base/base-algorithm.component';

@Component({
  selector: 'app-lcs',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './lcs.component.html',
  styleUrls: ['./lcs.component.css']
})
export class LcsComponent extends BaseAlgorithmComponent implements OnInit {
  protected Math = Math;
  string1: string = '';
  string2: string = '';
  dpTable: number[][] = [];
  currentRow: number = -1;
  currentCol: number = -1;
  lcsResult: string = '';
  lcsLength: number = 0;
  backtrackPath: Set<string> = new Set();
  isComplete: boolean = false;
  
  // 文字列のハイライト用
  string1Highlights: boolean[] = [];
  string2Highlights: boolean[] = [];

  ngOnInit(): void {
    this.reset();
  }

  reset(): void {
    this.generateStrings();
    this.initializeDPTable();
    this.currentRow = -1;
    this.currentCol = -1;
    this.lcsResult = '';
    this.lcsLength = 0;
    this.backtrackPath = new Set();
    this.isComplete = false;
    this.string1Highlights = Array(this.string1.length).fill(false);
    this.string2Highlights = Array(this.string2.length).fill(false);
    this.resetStats();
  }

  private generateStrings(): void {
    const strings = [
      ['ABCDGH', 'AEDFHR'],
      ['AGGTAB', 'GXTXAYB'],
      ['PROGRAMMING', 'ALGORITHM'],
      ['DYNAMIC', 'ECONOMIC'],
      ['HELLO', 'WORLD'],
      ['COMPUTER', 'SCIENCE']
    ];
    
    const selectedStrings = strings[Math.floor(Math.random() * strings.length)];
    this.string1 = selectedStrings[0];
    this.string2 = selectedStrings[1];
    
    // 設定に基づいて文字列を調整
    if (this.settings.arraySize < 15) {
      this.string1 = this.string1.substring(0, Math.max(4, this.settings.arraySize - 2));
      this.string2 = this.string2.substring(0, Math.max(4, this.settings.arraySize - 2));
    }
  }

  private initializeDPTable(): void {
    const m = this.string1.length;
    const n = this.string2.length;
    this.dpTable = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0));
  }

  async run(): Promise<void> {
    if (this.isRunning) return;

    this.startExecution();
    await this.computeLCS();
    await this.backtrack();
    this.endExecution();
  }

  private async computeLCS(): Promise<void> {
    const m = this.string1.length;
    const n = this.string2.length;

    for (let i = 1; i <= m && this.isRunning; i++) {
      for (let j = 1; j <= n && this.isRunning; j++) {
        if (!this.isRunning) break;

        this.currentRow = i;
        this.currentCol = j;
        this.incrementStep();
        await this.delay(this.settings.speed);

        if (!this.isRunning) break;

        const char1 = this.string1[i - 1];
        const char2 = this.string2[j - 1];

        this.incrementComparison();
        
        if (char1 === char2) {
          // 文字が一致する場合
          this.dpTable[i][j] = this.dpTable[i - 1][j - 1] + 1;
        } else {
          // 文字が一致しない場合
          this.dpTable[i][j] = Math.max(
            this.dpTable[i - 1][j],
            this.dpTable[i][j - 1]
          );
        }

        await this.delay(this.settings.speed * 0.5);
      }
    }

    if (this.isRunning) {
      this.lcsLength = this.dpTable[m][n];
      this.currentRow = -1;
      this.currentCol = -1;
    }
  }

  private async backtrack(): Promise<void> {
    if (!this.isRunning) return;

    const m = this.string1.length;
    const n = this.string2.length;
    let i = m;
    let j = n;
    const lcsChars: string[] = [];

    // バックトラック経路を記録
    while (i > 0 && j > 0 && this.isRunning) {
      this.currentRow = i;
      this.currentCol = j;
      this.backtrackPath.add(`${i}-${j}`);
      await this.delay(this.settings.speed);

      if (!this.isRunning) break;

      if (this.string1[i - 1] === this.string2[j - 1]) {
        // 文字が一致する場合、LCSに追加
        lcsChars.unshift(this.string1[i - 1]);
        this.string1Highlights[i - 1] = true;
        this.string2Highlights[j - 1] = true;
        i--;
        j--;
      } else if (this.dpTable[i - 1][j] > this.dpTable[i][j - 1]) {
        i--;
      } else {
        j--;
      }

      this.incrementStep();
    }

    if (this.isRunning) {
      this.lcsResult = lcsChars.join('');
      this.isComplete = true;
      this.currentRow = -1;
      this.currentCol = -1;
    }
  }

  getDPCellClass(row: number, col: number): string {
    const classes = ['dp-cell'];
    
    if (this.currentRow === row && this.currentCol === col) {
      classes.push('current');
    } else if (this.backtrackPath.has(`${row}-${col}`)) {
      classes.push('backtrack');
    } else if ((row <= this.currentRow && col <= this.currentCol) || this.isComplete) {
      classes.push('computed');
    }
    
    return classes.join(' ');
  }

  getCharClass(stringIndex: number, charIndex: number): string {
    const classes = ['string-char'];
    
    if (stringIndex === 1 && this.string1Highlights[charIndex]) {
      classes.push('highlighted');
    } else if (stringIndex === 2 && this.string2Highlights[charIndex]) {
      classes.push('highlighted');
    }
    
    // 現在比較中の文字をハイライト
    if (this.currentRow > 0 && this.currentCol > 0) {
      if (stringIndex === 1 && charIndex === this.currentRow - 1) {
        classes.push('comparing');
      } else if (stringIndex === 2 && charIndex === this.currentCol - 1) {
        classes.push('comparing');
      }
    }
    
    return classes.join(' ');
  }

  getResultText(): string {
    if (!this.isComplete) {
      return '計算中...';
    }
    return `LCS: "${this.lcsResult}" (長さ: ${this.lcsLength})`;
  }

  getSimilarityPercentage(): number {
    if (this.string1.length === 0 || this.string2.length === 0) return 0;
    const maxLength = Math.max(this.string1.length, this.string2.length);
    return Math.round((this.lcsLength / maxLength) * 100);
  }

  getCurrentComparisonText(): string {
    if (this.currentRow <= 0 || this.currentCol <= 0) return '';
    const char1 = this.string1[this.currentRow - 1];
    const char2 = this.string2[this.currentCol - 1];
    const match = char1 === char2 ? '一致' : '不一致';
    return `'${char1}' vs '${char2}' (${match})`;
  }
}