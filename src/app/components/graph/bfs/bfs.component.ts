import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseAlgorithmComponent } from '../../../shared/base/base-algorithm.component';
import { DataGeneratorService } from '../../../shared/services/data-generator.service';
import { Graph } from '../../../shared/interfaces/algorithm.interface';

@Component({
  selector: 'app-bfs',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './bfs.component.html',
  styleUrls: ['./bfs.component.css']
})
export class BfsComponent extends BaseAlgorithmComponent implements OnInit {
  graph!: Graph;
  visited: Set<number> = new Set();
  currentNode: number = -1;
  queue: number[] = [];
  visitOrder: number[] = [];
  distances: Map<number, number> = new Map();
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
    this.queue = [];
    this.visitOrder = [];
    this.distances = new Map();
    this.resetStats();
  }

  async run(): Promise<void> {
    if (this.isRunning) return;

    this.startExecution();
    await this.bfs();
    this.endExecution();
  }

  private async bfs(): Promise<void> {
    this.queue.push(this.startNode);
    this.visited.add(this.startNode);
    this.distances.set(this.startNode, 0);

    while (this.queue.length > 0 && this.isRunning) {
      if (!this.isRunning) break;

      const nodeId = this.queue.shift()!;
      this.currentNode = nodeId;
      this.visitOrder.push(nodeId);
      this.incrementStep();
      await this.delay(this.settings.speed);

      if (!this.isRunning) break;

      const neighbors = this.getNeighbors(nodeId);
      const currentDistance = this.distances.get(nodeId) || 0;
      
      for (const neighborId of neighbors) {
        if (!this.visited.has(neighborId) && this.isRunning) {
          this.visited.add(neighborId);
          this.distances.set(neighborId, currentDistance + 1);
          this.queue.push(neighborId);
          this.incrementComparison();
          await this.delay(this.settings.speed * 0.5);
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

  getNodeDistance(nodeId: number): number {
    return this.distances.get(nodeId) || 0;
  }

  getNodeX(nodeId: number): number {
    return this.graph.nodes.find(n => n.id === nodeId)?.x || 0;
  }

  getNodeY(nodeId: number): number {
    return this.graph.nodes.find(n => n.id === nodeId)?.y || 0;
  }
}