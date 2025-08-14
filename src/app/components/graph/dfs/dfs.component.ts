import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseAlgorithmComponent } from '../../../shared/base/base-algorithm.component';
import { DataGeneratorService } from '../../../shared/services/data-generator.service';
import { Graph } from '../../../shared/interfaces/algorithm.interface';

@Component({
  selector: 'app-dfs',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dfs.component.html',
  styleUrls: ['./dfs.component.css']
})
export class DfsComponent extends BaseAlgorithmComponent implements OnInit {
  graph!: Graph;
  visited: Set<number> = new Set();
  currentNode: number = -1;
  stack: number[] = [];
  visitOrder: number[] = [];
  startNode: number = 0;

  constructor(private dataGenerator: DataGeneratorService) {
    super();
  }

  ngOnInit(): void {
    this.reset();
  }

  reset(): void {
    this.graph = this.dataGenerator.generateGraph();
    this.visited = new Set();
    this.currentNode = -1;
    this.stack = [];
    this.visitOrder = [];
    this.resetStats();
  }

  async run(): Promise<void> {
    if (this.isRunning) return;

    this.startExecution();
    await this.dfs();
    this.endExecution();
  }

  private async dfs(): Promise<void> {
    this.stack.push(this.startNode);

    while (this.stack.length > 0 && this.isRunning) {
      if (!this.isRunning) break;

      const nodeId = this.stack.pop()!;
      
      if (!this.visited.has(nodeId)) {
        this.currentNode = nodeId;
        this.visited.add(nodeId);
        this.visitOrder.push(nodeId);
        this.incrementStep();
        await this.delay(this.settings.speed);

        if (!this.isRunning) break;

        // 隣接ノードをスタックに追加（逆順で追加して正しい順序で処理）
        const neighbors = this.getNeighbors(nodeId).reverse();
        
        for (const neighborId of neighbors) {
          if (!this.visited.has(neighborId) && this.isRunning) {
            this.stack.push(neighborId);
            this.incrementComparison();
            await this.delay(this.settings.speed * 0.5);
          }
        }
      }
    }

    if (this.isRunning) {
      this.currentNode = -1;
    }
  }

  private getNeighbors(nodeId: number): number[] {
    const neighbors: number[] = [];
    
    for (const edge of this.graph.edges) {
      if (edge.from === nodeId) {
        neighbors.push(edge.to);
      } else if (edge.to === nodeId) {
        neighbors.push(edge.from);
      }
    }
    
    return neighbors.sort((a, b) => a - b);
  }

  getVisitOrderText(): string {
    return this.visitOrder.join(' → ');
  }

  getNodeX(nodeId: number): number {
    return this.graph.nodes.find(n => n.id === nodeId)?.x || 0;
  }

  getNodeY(nodeId: number): number {
    return this.graph.nodes.find(n => n.id === nodeId)?.y || 0;
  }
}