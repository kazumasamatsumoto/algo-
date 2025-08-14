import { Injectable } from '@angular/core';
import { Graph, GraphNode, GraphEdge } from '../interfaces/algorithm.interface';

@Injectable({
  providedIn: 'root'
})
export class DataGeneratorService {

  generateArrayData(size: number, type: 'random' | 'sorted' | 'reverse' | 'nearly-sorted'): number[] {
    switch (type) {
      case 'random':
        return Array.from(
          { length: size }, 
          () => Math.floor(Math.random() * 80) + 10
        );
      case 'sorted':
        return Array.from(
          { length: size }, 
          (_, i) => (i + 1) * 4 + 10
        );
      case 'reverse':
        return Array.from(
          { length: size }, 
          (_, i) => (size - i) * 4 + 10
        );
      case 'nearly-sorted':
        return Array.from(
          { length: size }, 
          (_, i) => (i + 1) * 4 + 10 + (Math.random() > 0.8 ? Math.floor(Math.random() * 20) - 10 : 0)
        );
      default:
        return this.generateArrayData(size, 'random');
    }
  }

  generateGraph(type: 'complete' | 'sparse' | 'chain' | 'tree' = 'sparse'): Graph {
    const nodes: GraphNode[] = [
      { id: 0, x: 100, y: 100 },
      { id: 1, x: 200, y: 50 },
      { id: 2, x: 300, y: 100 },
      { id: 3, x: 150, y: 200 },
      { id: 4, x: 250, y: 200 },
      { id: 5, x: 350, y: 150 }
    ];

    let edges: GraphEdge[] = [];

    switch (type) {
      case 'complete':
        // 完全グラフ
        for (let i = 0; i < nodes.length; i++) {
          for (let j = i + 1; j < nodes.length; j++) {
            edges.push({
              from: i,
              to: j,
              weight: Math.floor(Math.random() * 10) + 1
            });
          }
        }
        break;
      
      case 'chain':
        // チェーン状グラフ
        for (let i = 0; i < nodes.length - 1; i++) {
          edges.push({
            from: i,
            to: i + 1,
            weight: Math.floor(Math.random() * 10) + 1
          });
        }
        break;
      
      case 'tree':
        // ツリー構造
        edges = [
          { from: 0, to: 1, weight: 4 },
          { from: 0, to: 3, weight: 2 },
          { from: 1, to: 2, weight: 3 },
          { from: 3, to: 4, weight: 3 },
          { from: 2, to: 5, weight: 1 }
        ];
        break;
      
      case 'sparse':
      default:
        // スパースグラフ
        edges = [
          { from: 0, to: 1, weight: 4 },
          { from: 0, to: 3, weight: 2 },
          { from: 1, to: 2, weight: 3 },
          { from: 1, to: 4, weight: 5 },
          { from: 2, to: 5, weight: 1 },
          { from: 3, to: 4, weight: 3 },
          { from: 4, to: 5, weight: 2 }
        ];
        break;
    }

    return { nodes, edges };
  }

  generateKnapsackItems(): { weight: number; value: number; name: string }[] {
    return [
      { weight: 2, value: 3, name: '宝石A' },
      { weight: 3, value: 4, name: '宝石B' },
      { weight: 4, value: 5, name: '宝石C' },
      { weight: 5, value: 6, name: '宝石D' }
    ];
  }

  getKnapsackCapacity(): number {
    return 8;
  }

  getLCSStrings(): { str1: string; str2: string } {
    return { str1: 'ABCDGH', str2: 'AEDFHR' };
  }
}