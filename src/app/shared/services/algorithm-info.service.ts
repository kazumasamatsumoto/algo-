import { Injectable } from '@angular/core';
import { AlgorithmType, AlgorithmInfo } from '../interfaces/algorithm.interface';

@Injectable({
  providedIn: 'root'
})
export class AlgorithmInfoService {

  private algorithmData: Record<AlgorithmType, AlgorithmInfo> = {
    'bubble-sort': {
      name: 'バブルソート',
      timeComplexity: 'O(n²)',
      spaceComplexity: 'O(1)',
      description: '隣接する要素を比較して交換を繰り返すシンプルなソートアルゴリズム。理解しやすいが効率は悪い。'
    },
    'selection-sort': {
      name: '選択ソート',
      timeComplexity: 'O(n²)',
      spaceComplexity: 'O(1)',
      description: '最小値を見つけて順番に配置する直感的なソートアルゴリズム。'
    },
    'insertion-sort': {
      name: '挿入ソート',
      timeComplexity: '最良 O(n), 平均 O(n²)',
      spaceComplexity: 'O(1)',
      description: '既にソートされた部分に新しい要素を正しい位置に挿入するソート。小さなデータに効率的。'
    },
    'quick-sort': {
      name: 'クイックソート',
      timeComplexity: '平均 O(n log n), 最悪 O(n²)',
      spaceComplexity: 'O(log n)',
      description: 'ピボット要素を選んで分割統治で高速にソートする。平均的に最も速いソートアルゴリズムの一つ。'
    },
    'merge-sort': {
      name: 'マージソート',
      timeComplexity: 'O(n log n)',
      spaceComplexity: 'O(n)',
      description: '配列を分割してマージしながらソートする安定ソート。常にO(n log n)の性能を保証。'
    },
    'heap-sort': {
      name: 'ヒープソート',
      timeComplexity: 'O(n log n)',
      spaceComplexity: 'O(1)',
      description: 'ヒープ構造を利用したソート。常にO(n log n)の性能を保証する。'
    },
    'linear-search': {
      name: '線形探索',
      timeComplexity: 'O(n)',
      spaceComplexity: 'O(1)',
      description: '配列を先頭から順番に探索する最も基本的な探索方法。ソートされていない配列にも使える。'
    },
    'binary-search': {
      name: '二分探索',
      timeComplexity: 'O(log n)',
      spaceComplexity: 'O(1)',
      description: 'ソート済み配列で中央値と比較して範囲を半分に絞って探索する効率的な方法。'
    },
    'fibonacci': {
      name: 'フィボナッチ数列',
      timeComplexity: 'O(2^n) (ナイーブ実装)',
      spaceComplexity: 'O(n) (再帰スタック)',
      description: '前の2つの数を足して次の数を求める数列。動的プログラミングの典型例。'
    },
    'dijkstra': {
      name: 'ダイクストラ法',
      timeComplexity: 'O((V + E) log V)',
      spaceComplexity: 'O(V)',
      description: '重み付きグラフで単一始点から全ノードへの最短経路を求めるアルゴリズム。'
    },
    'floyd-warshall': {
      name: 'フロイド・ワーシャル法',
      timeComplexity: 'O(V³)',
      spaceComplexity: 'O(V²)',
      description: '全点対間最短経路問題を解く動的プログラミング手法。'
    },
    'kruskal': {
      name: 'クラスカル法',
      timeComplexity: 'O(E log E)',
      spaceComplexity: 'O(V)',
      description: 'エッジの重みでソートして最小全域木を構築する貪欲アルゴリズム。'
    },
    'a-star': {
      name: 'A*アルゴリズム',
      timeComplexity: 'O(b^d)',
      spaceComplexity: 'O(b^d)',
      description: 'ヒューリスティック関数を使用した効率的な最短経路探索アルゴリズム。'
    },
    'dfs': {
      name: '深さ優先探索',
      timeComplexity: 'O(V + E)',
      spaceComplexity: 'O(V)',
      description: 'スタックを使ってグラフを深く探索する方法。迷路の探索などに使われる。'
    },
    'bfs': {
      name: '幅優先探索',
      timeComplexity: 'O(V + E)',
      spaceComplexity: 'O(V)',
      description: 'キューを使ってグラフを幅広く探索する方法。最短経路の発見に適している。'
    },
    'coin-change': {
      name: '硬貨問題',
      timeComplexity: 'O(n)',
      spaceComplexity: 'O(1)',
      description: '指定した金額を最少枚数の硬貨で支払う貪欲アルゴリズム。'
    },
    'knapsack': {
      name: 'ナップサック問題',
      timeComplexity: 'O(nW)',
      spaceComplexity: 'O(nW)',
      description: '容量制限内で価値を最大化するアイテムの組み合わせを求める動的プログラミング。'
    },
    'lcs': {
      name: '最長共通部分列',
      timeComplexity: 'O(mn)',
      spaceComplexity: 'O(mn)',
      description: '2つの文字列間で共通する最も長い部分列を見つける動的プログラミング手法。'
    }
  };

  getAlgorithmInfo(type: AlgorithmType): AlgorithmInfo {
    return this.algorithmData[type];
  }

  getAllAlgorithmInfos(): Record<AlgorithmType, AlgorithmInfo> {
    return { ...this.algorithmData };
  }

  isSortAlgorithm(type: AlgorithmType): boolean {
    return ['bubble-sort', 'quick-sort', 'merge-sort', 'selection-sort', 'heap-sort', 'insertion-sort'].includes(type);
  }

  isSearchAlgorithm(type: AlgorithmType): boolean {
    return ['linear-search', 'binary-search'].includes(type);
  }

  isGraphAlgorithm(type: AlgorithmType): boolean {
    return ['dijkstra', 'dfs', 'bfs', 'floyd-warshall', 'kruskal', 'a-star'].includes(type);
  }

  isDynamicProgramming(type: AlgorithmType): boolean {
    return ['fibonacci', 'knapsack', 'lcs'].includes(type);
  }

  isGreedyAlgorithm(type: AlgorithmType): boolean {
    return ['coin-change'].includes(type);
  }
}