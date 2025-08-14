import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseAlgorithmComponent } from '../../../shared/base/base-algorithm.component';
import { DataGeneratorService } from '../../../shared/services/data-generator.service';
import { Graph } from '../../../shared/interfaces/algorithm.interface';

@Component({
  selector: 'app-dijkstra',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dijkstra.component.html',
  styleUrls: ['./dijkstra.component.css']
})
export class DijkstraComponent extends BaseAlgorithmComponent implements OnInit {
  graph!: Graph;
  distances: Map<number, number> = new Map();
  visited: Set<number> = new Set();
  currentNode: number = -1;
  pathNodes: Set<number> = new Set();
  startNode: number = 0;
  endNode: number = 4;

  constructor(private dataGenerator: DataGeneratorService) {
    super();
  }

  ngOnInit(): void {
    this.reset();
  }

  reset(): void {
    this.graph = this.dataGenerator.generateGraph();
    this.distances = new Map();
    this.visited = new Set();
    this.currentNode = -1;
    this.pathNodes = new Set();
    this.resetStats();
  }

  async run(): Promise<void> {
    if (this.isRunning) return;

    this.startExecution();
    await this.dijkstra();
    this.endExecution();
  }

  private async dijkstra(): Promise<void> {
    // 距離を初期化
    for (const node of this.graph.nodes) {
      this.distances.set(node.id, node.id === this.startNode ? 0 : Infinity);
    }

    const unvisited = new Set(this.graph.nodes.map(n => n.id));

    while (unvisited.size > 0 && this.isRunning) {
      // 未訪問ノードの中で最短距離のノードを選択
      let minDistance = Infinity;
      let minNode = -1;

      for (const nodeId of unvisited) {
        const distance = this.distances.get(nodeId) || Infinity;
        if (distance < minDistance) {
          minDistance = distance;
          minNode = nodeId;
        }
      }

      if (minNode === -1 || minDistance === Infinity) break;

      this.currentNode = minNode;
      unvisited.delete(minNode);
      this.visited.add(minNode);
      this.incrementStep();
      await this.delay(this.settings.speed);

      if (!this.isRunning) break;

      // 隣接ノードの距離を更新
      const currentDistance = this.distances.get(minNode) || 0;
      
      for (const edge of this.graph.edges) {
        if (!this.isRunning) break;

        let neighborId = -1;
        if (edge.from === minNode) {
          neighborId = edge.to;
        } else if (edge.to === minNode) {
          neighborId = edge.from;
        }

        if (neighborId !== -1 && !this.visited.has(neighborId)) {
          const newDistance = currentDistance + edge.weight;
          const currentNeighborDistance = this.distances.get(neighborId) || Infinity;

          this.incrementComparison();
          await this.delay(this.settings.speed);

          if (newDistance < currentNeighborDistance) {
            this.distances.set(neighborId, newDistance);
            await this.delay(this.settings.speed);
          }
        }
      }

      if (minNode === this.endNode) {
        await this.constructPath();
        break;
      }
    }

    if (this.isRunning) {
      this.currentNode = -1;
    }
  }

  private async constructPath(): Promise<void> {
    // 最短パスを構築
    const path: number[] = [];
    let current = this.endNode;
    
    while (current !== this.startNode && this.isRunning) {
      path.unshift(current);
      const currentDistance = this.distances.get(current) || Infinity;
      
      // 前のノードを見つける
      let found = false;
      for (const edge of this.graph.edges) {
        if (!found && this.isRunning) {
          let prevNodeId = -1;
          if (edge.to === current) {
            prevNodeId = edge.from;
          } else if (edge.from === current) {
            prevNodeId = edge.to;
          }

          if (prevNodeId !== -1) {
            const prevDistance = this.distances.get(prevNodeId) || Infinity;
            if (prevDistance + edge.weight === currentDistance) {
              current = prevNodeId;
              found = true;
            }
          }
        }
      }
      
      if (!found) break;
    }
    
    if (this.isRunning) {
      path.unshift(this.startNode);
      this.pathNodes = new Set(path);
      await this.delay(this.settings.speed);
    }
  }

  getNodeDistance(nodeId: number): number | string {
    const distance = this.distances.get(nodeId);
    return distance === Infinity ? '∞' : distance || 0;
  }

  getEdgeMidX(edge: any): number {
    const fromNode = this.graph.nodes.find(n => n.id === edge.from);
    const toNode = this.graph.nodes.find(n => n.id === edge.to);
    return ((fromNode?.x || 0) + (toNode?.x || 0)) / 2;
  }

  getEdgeMidY(edge: any): number {
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
}