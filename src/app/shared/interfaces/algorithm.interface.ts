export type AlgorithmType = 'bubble-sort' | 'quick-sort' | 'merge-sort' | 'selection-sort' | 'heap-sort' | 'insertion-sort' | 'linear-search' | 'binary-search' | 'fibonacci' | 'dijkstra' | 'dfs' | 'bfs' | 'floyd-warshall' | 'kruskal' | 'coin-change' | 'knapsack' | 'a-star' | 'lcs' | 'euclidean-gcd' | 'sieve-of-eratosthenes';

export interface AlgorithmSettings {
  arraySize: number;
  speed: number;
  dataType: 'random' | 'sorted' | 'reverse' | 'nearly-sorted';
  showStepCount: boolean;
  graphType: 'complete' | 'sparse' | 'chain' | 'tree';
}

export interface ExecutionStats {
  steps: number;
  swaps: number;
  comparisons: number;
  timeMs: number;
}

export interface AlgorithmInfo {
  name: string;
  timeComplexity: string;
  spaceComplexity: string;
  description: string;
}

export interface GraphNode {
  id: number;
  x: number;
  y: number;
  distances?: { [key: number]: number };
}

export interface GraphEdge {
  from: number;
  to: number;
  weight: number;
}

export interface Graph {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export interface ComparisonResult {
  algorithm: AlgorithmType;
  steps: number;
  time: number;
  swaps?: number;
  comparisons?: number;
}

export interface AlgorithmComponent {
  algorithmType: AlgorithmType;
  isRunning: boolean;
  stats: ExecutionStats;
  settings: AlgorithmSettings;
  statsChange?: any;
  runningChange?: any;
  
  run(): Promise<void>;
  reset(): void;
  stop(): void;
}