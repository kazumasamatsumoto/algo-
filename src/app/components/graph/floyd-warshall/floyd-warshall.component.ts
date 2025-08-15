import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseAlgorithmComponent } from '../../../shared/base/base-algorithm.component';
import { DataGeneratorService } from '../../../shared/services/data-generator.service';
import { Graph } from '../../../shared/interfaces/algorithm.interface';

@Component({
  selector: 'app-floyd-warshall',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './floyd-warshall.component.html',
  styleUrls: ['./floyd-warshall.component.css']
})
export class FloydWarshallComponent extends BaseAlgorithmComponent implements OnInit {
  protected Math = Math;
  graph!: Graph;
  distanceMatrix: number[][] = [];
  pathMatrix: number[][] = [];
  currentK: number = -1;
  currentI: number = -1;
  currentJ: number = -1;
  isComplete: boolean = false;
  infinity = Infinity;
  
  // 結果表示用
  shortestPaths: { from: number, to: number, distance: number, path: number[] }[] = [];
  selectedPath: { from: number, to: number } | null = null;

  constructor(private dataGenerator: DataGeneratorService) {
    super();
  }

  ngOnInit(): void {
    this.reset();
  }

  reset(): void {
    this.graph = this.dataGenerator.generateGraph();
    this.initializeMatrices();
    this.currentK = -1;
    this.currentI = -1;
    this.currentJ = -1;
    this.isComplete = false;
    this.shortestPaths = [];
    this.selectedPath = null;
    this.resetStats();
  }

  private initializeMatrices(): void {
    const n = this.graph.nodes.length;
    
    // 距離行列の初期化
    this.distanceMatrix = Array(n).fill(null).map(() => Array(n).fill(this.infinity));
    this.pathMatrix = Array(n).fill(null).map(() => Array(n).fill(-1));

    // 対角線を0に設定
    for (let i = 0; i < n; i++) {
      this.distanceMatrix[i][i] = 0;
    }

    // エッジの重みを設定
    for (const edge of this.graph.edges) {
      this.distanceMatrix[edge.from][edge.to] = edge.weight;
      this.distanceMatrix[edge.to][edge.from] = edge.weight; // 無向グラフの場合
      this.pathMatrix[edge.from][edge.to] = edge.to;
      this.pathMatrix[edge.to][edge.from] = edge.from;
    }
  }

  async run(): Promise<void> {
    if (this.isRunning) return;

    this.startExecution();
    await this.floydWarshall();
    this.calculateAllPaths();
    this.endExecution();
  }

  private async floydWarshall(): Promise<void> {
    const n = this.graph.nodes.length;

    // k: 中間ノード
    for (let k = 0; k < n && this.isRunning; k++) {
      this.currentK = k;
      
      // i: 開始ノード
      for (let i = 0; i < n && this.isRunning; i++) {
        // j: 終了ノード
        for (let j = 0; j < n && this.isRunning; j++) {
          if (!this.isRunning) break;

          this.currentI = i;
          this.currentJ = j;
          this.incrementStep();
          await this.delay(this.settings.speed);

          if (!this.isRunning) break;

          // ノードkを経由する経路の方が短いかチェック
          if (this.distanceMatrix[i][k] !== this.infinity && 
              this.distanceMatrix[k][j] !== this.infinity) {
            
            const directDistance = this.distanceMatrix[i][j];
            const viaKDistance = this.distanceMatrix[i][k] + this.distanceMatrix[k][j];
            
            this.incrementComparison();

            if (viaKDistance < directDistance) {
              this.distanceMatrix[i][j] = viaKDistance;
              this.pathMatrix[i][j] = this.pathMatrix[i][k];
              this.incrementSwap(); // 更新をスワップとしてカウント
            }
          }

          await this.delay(this.settings.speed * 0.2);
        }
      }
    }

    if (this.isRunning) {
      this.isComplete = true;
      this.currentK = -1;
      this.currentI = -1;
      this.currentJ = -1;
    }
  }

  private calculateAllPaths(): void {
    const n = this.graph.nodes.length;
    this.shortestPaths = [];

    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        if (this.distanceMatrix[i][j] !== this.infinity) {
          const path = this.reconstructPath(i, j);
          this.shortestPaths.push({
            from: i,
            to: j,
            distance: this.distanceMatrix[i][j],
            path: path
          });
        }
      }
    }

    // 距離でソート
    this.shortestPaths.sort((a, b) => a.distance - b.distance);
  }

  private reconstructPath(start: number, end: number): number[] {
    if (this.pathMatrix[start][end] === -1) {
      return [];
    }

    const path = [start];
    let current = start;

    while (current !== end) {
      current = this.pathMatrix[current][end];
      path.push(current);
    }

    return path;
  }

  getCellClass(i: number, j: number): string {
    const classes = ['matrix-cell'];
    
    if (this.currentI === i && this.currentJ === j) {
      classes.push('current');
    } else if (this.currentK >= 0 && (
      (i === this.currentK && j === this.currentJ) ||
      (i === this.currentI && j === this.currentK) ||
      (i === this.currentK && j === this.currentK)
    )) {
      classes.push('involved');
    } else if (i === j) {
      classes.push('diagonal');
    } else if (this.isComplete && this.distanceMatrix[i][j] !== this.infinity) {
      classes.push('reachable');
    }

    if (this.selectedPath && 
        ((this.selectedPath.from === i && this.selectedPath.to === j) ||
         (this.selectedPath.from === j && this.selectedPath.to === i))) {
      classes.push('selected-path');
    }
    
    return classes.join(' ');
  }

  formatDistance(distance: number): string {
    return distance === this.infinity ? '∞' : distance.toString();
  }

  selectPath(from: number, to: number): void {
    this.selectedPath = { from, to };
  }

  getCurrentOperationText(): string {
    if (this.currentK === -1) return '';
    if (this.currentI === -1 || this.currentJ === -1) return '';

    const directDist = this.distanceMatrix[this.currentI][this.currentJ];
    const viaDist = this.distanceMatrix[this.currentI][this.currentK] + this.distanceMatrix[this.currentK][this.currentJ];
    
    return `ノード${this.currentI}→${this.currentJ}: 直接(${this.formatDistance(directDist)}) vs 経由${this.currentK}(${this.formatDistance(viaDist)})`;
  }

  getResultText(): string {
    if (!this.isComplete) {
      return this.currentK >= 0 ? `中間ノード ${this.currentK} で計算中...` : '開始前';
    }
    return `全点対間最短経路計算完了！${this.shortestPaths.length}個の経路が見つかりました。`;
  }

  getNodeX(nodeId: number): number {
    return this.graph.nodes.find(n => n.id === nodeId)?.x || 0;
  }

  getNodeY(nodeId: number): number {
    return this.graph.nodes.find(n => n.id === nodeId)?.y || 0;
  }

  getEdgeClass(from: number, to: number): string {
    const classes = ['graph-edge'];
    
    if (this.selectedPath) {
      const path = this.reconstructPath(this.selectedPath.from, this.selectedPath.to);
      for (let i = 0; i < path.length - 1; i++) {
        if ((path[i] === from && path[i + 1] === to) ||
            (path[i] === to && path[i + 1] === from)) {
          classes.push('highlighted-path');
          break;
        }
      }
    }
    
    return classes.join(' ');
  }

  getNodeClass(nodeId: number): string {
    const classes = ['node'];
    
    if (this.currentK === nodeId) {
      classes.push('intermediate');
    } else if (this.currentI === nodeId || this.currentJ === nodeId) {
      classes.push('endpoint');
    }

    if (this.selectedPath && 
        (this.selectedPath.from === nodeId || this.selectedPath.to === nodeId)) {
      classes.push('selected');
    }
    
    return classes.join(' ');
  }
}