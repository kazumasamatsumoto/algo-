import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseAlgorithmComponent } from '../../../shared/base/base-algorithm.component';
import { DataGeneratorService } from '../../../shared/services/data-generator.service';
import { Graph } from '../../../shared/interfaces/algorithm.interface';

interface Edge {
  from: number;
  to: number;
  weight: number;
  id: string;
}

interface UnionFind {
  parent: number[];
  rank: number[];
}

@Component({
  selector: 'app-kruskal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './kruskal.component.html',
  styleUrls: ['./kruskal.component.css']
})
export class KruskalComponent extends BaseAlgorithmComponent implements OnInit {
  protected Math = Math;
  graph!: Graph;
  sortedEdges: Edge[] = [];
  mstEdges: Set<string> = new Set();
  currentEdgeIndex: number = -1;
  unionFind!: UnionFind;
  totalWeight: number = 0;
  isComplete: boolean = false;
  rejectedEdges: Set<string> = new Set();

  constructor(private dataGenerator: DataGeneratorService) {
    super();
  }

  ngOnInit(): void {
    this.reset();
  }

  reset(): void {
    this.graph = this.dataGenerator.generateGraph();
    this.prepareEdges();
    this.initializeUnionFind();
    this.currentEdgeIndex = -1;
    this.mstEdges = new Set();
    this.rejectedEdges = new Set();
    this.totalWeight = 0;
    this.isComplete = false;
    this.resetStats();
  }

  private prepareEdges(): void {
    this.sortedEdges = this.graph.edges.map(edge => ({
      from: edge.from,
      to: edge.to,
      weight: edge.weight,
      id: `${Math.min(edge.from, edge.to)}-${Math.max(edge.from, edge.to)}`
    }));

    // エッジを重みで昇順ソート
    this.sortedEdges.sort((a, b) => a.weight - b.weight);
  }

  private initializeUnionFind(): void {
    const nodeCount = this.graph.nodes.length;
    this.unionFind = {
      parent: Array.from({ length: nodeCount }, (_, i) => i),
      rank: Array(nodeCount).fill(0)
    };
  }

  async run(): Promise<void> {
    if (this.isRunning) return;

    this.startExecution();
    await this.kruskalMST();
    this.endExecution();
  }

  private async kruskalMST(): Promise<void> {
    const targetEdges = this.graph.nodes.length - 1; // MST needs n-1 edges
    let addedEdges = 0;

    for (let i = 0; i < this.sortedEdges.length && addedEdges < targetEdges && this.isRunning; i++) {
      if (!this.isRunning) break;

      this.currentEdgeIndex = i;
      const edge = this.sortedEdges[i];
      
      this.incrementStep();
      await this.delay(this.settings.speed);

      if (!this.isRunning) break;

      // サイクルチェック
      const rootFrom = this.find(edge.from);
      const rootTo = this.find(edge.to);

      this.incrementComparison();
      await this.delay(this.settings.speed * 0.5);

      if (rootFrom !== rootTo) {
        // エッジを追加（サイクルなし）
        this.mstEdges.add(edge.id);
        this.union(edge.from, edge.to);
        this.totalWeight += edge.weight;
        addedEdges++;
        
        await this.delay(this.settings.speed);
      } else {
        // エッジを拒否（サイクルあり）
        this.rejectedEdges.add(edge.id);
        await this.delay(this.settings.speed * 0.3);
      }
    }

    if (this.isRunning) {
      this.isComplete = true;
      this.currentEdgeIndex = -1;
    }
  }

  private find(x: number): number {
    if (this.unionFind.parent[x] !== x) {
      this.unionFind.parent[x] = this.find(this.unionFind.parent[x]); // Path compression
    }
    return this.unionFind.parent[x];
  }

  private union(x: number, y: number): void {
    const rootX = this.find(x);
    const rootY = this.find(y);

    if (rootX !== rootY) {
      // Union by rank
      if (this.unionFind.rank[rootX] < this.unionFind.rank[rootY]) {
        this.unionFind.parent[rootX] = rootY;
      } else if (this.unionFind.rank[rootX] > this.unionFind.rank[rootY]) {
        this.unionFind.parent[rootY] = rootX;
      } else {
        this.unionFind.parent[rootY] = rootX;
        this.unionFind.rank[rootX]++;
      }
    }
  }

  getEdgeClass(edge: Edge, index: number): string {
    const classes = ['edge'];
    const edgeId = `${Math.min(edge.from, edge.to)}-${Math.max(edge.from, edge.to)}`;
    
    if (this.currentEdgeIndex === index) {
      classes.push('current');
    } else if (this.mstEdges.has(edgeId)) {
      classes.push('mst');
    } else if (this.rejectedEdges.has(edgeId)) {
      classes.push('rejected');
    } else if (index < this.currentEdgeIndex || this.isComplete) {
      classes.push('processed');
    }
    
    return classes.join(' ');
  }

  getNodeClass(nodeId: number): string {
    const classes = ['node'];
    
    if (this.isComplete) {
      classes.push('connected');
    }
    
    return classes.join(' ');
  }

  getCurrentEdgeInfo(): string {
    if (this.currentEdgeIndex === -1) {
      return this.isComplete ? '完了' : '開始前';
    }
    
    const edge = this.sortedEdges[this.currentEdgeIndex];
    const rootFrom = this.find(edge.from);
    const rootTo = this.find(edge.to);
    const wouldCreateCycle = rootFrom === rootTo;
    
    return `エッジ ${edge.from}-${edge.to} (重み${edge.weight}): ${wouldCreateCycle ? 'サイクル→拒否' : '追加→MST'}`;
  }

  getResultText(): string {
    if (!this.isComplete) {
      return '計算中...';
    }
    
    const expectedEdges = this.graph.nodes.length - 1;
    return `最小全域木完成！総重み: ${this.totalWeight}, エッジ数: ${this.mstEdges.size}/${expectedEdges}`;
  }

  getEdgeMidX(edge: Edge | import('../../../shared/interfaces/algorithm.interface').GraphEdge): number {
    const fromNode = this.graph.nodes.find(n => n.id === edge.from);
    const toNode = this.graph.nodes.find(n => n.id === edge.to);
    return ((fromNode?.x || 0) + (toNode?.x || 0)) / 2;
  }

  getEdgeMidY(edge: Edge | import('../../../shared/interfaces/algorithm.interface').GraphEdge): number {
    const fromNode = this.graph.nodes.find(n => n.id === edge.from);
    const toNode = this.graph.nodes.find(n => n.id === edge.to);
    return ((fromNode?.y || 0) + (toNode?.y || 0)) / 2;
  }

  getNodeX(nodeId: number): number {
    return this.graph.nodes.find(n => n.id === nodeId)?.x || 0;
  }

  getNodeY(nodeId: number): number {
    return this.graph.nodes.find(n => n.id === nodeId)?.y || 0;
  }

  // エッジがMST、拒否、または現在検討中かを判定
  getGraphEdgeClass(from: number, to: number): string {
    const edgeId = `${Math.min(from, to)}-${Math.max(from, to)}`;
    const classes = ['graph-edge'];
    
    if (this.mstEdges.has(edgeId)) {
      classes.push('mst-edge');
    } else if (this.rejectedEdges.has(edgeId)) {
      classes.push('rejected-edge');
    }
    
    // 現在検討中のエッジ
    if (this.currentEdgeIndex >= 0) {
      const currentEdge = this.sortedEdges[this.currentEdgeIndex];
      const currentEdgeId = `${Math.min(currentEdge.from, currentEdge.to)}-${Math.max(currentEdge.from, currentEdge.to)}`;
      if (edgeId === currentEdgeId) {
        classes.push('current-edge');
      }
    }
    
    return classes.join(' ');
  }
}