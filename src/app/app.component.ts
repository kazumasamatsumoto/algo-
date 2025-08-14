import { Component, OnInit, OnDestroy, ViewChild, ViewContainerRef, ComponentRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';

// Services
import { AlgorithmSettingsService } from './shared/services/algorithm-settings.service';
import { AlgorithmInfoService } from './shared/services/algorithm-info.service';

// Interfaces
import { AlgorithmType, AlgorithmSettings, ExecutionStats, AlgorithmComponent } from './shared/interfaces/algorithm.interface';

// Sorting Components
import { BubbleSortComponent } from './components/sorting/bubble-sort/bubble-sort.component';
import { QuickSortComponent } from './components/sorting/quick-sort/quick-sort.component';
import { SelectionSortComponent } from './components/sorting/selection-sort/selection-sort.component';
import { InsertionSortComponent } from './components/sorting/insertion-sort/insertion-sort.component';
import { MergeSortComponent } from './components/sorting/merge-sort/merge-sort.component';
import { HeapSortComponent } from './components/sorting/heap-sort/heap-sort.component';

// Graph Components
import { DijkstraComponent } from './components/graph/dijkstra/dijkstra.component';
import { DfsComponent } from './components/graph/dfs/dfs.component';
import { BfsComponent } from './components/graph/bfs/bfs.component';

// Search Components
import { LinearSearchComponent } from './components/search/linear-search/linear-search.component';
import { BinarySearchComponent } from './components/search/binary-search/binary-search.component';

// Dynamic Programming Components
import { FibonacciComponent } from './components/dynamic/fibonacci/fibonacci.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class App implements OnInit, OnDestroy {
  @ViewChild('algorithmContainer', { read: ViewContainerRef }) algorithmContainer!: ViewContainerRef;
  
  private destroy$ = new Subject<void>();
  private currentComponentRef: ComponentRef<any> | null = null;

  selectedAlgorithm: AlgorithmType | null = null;
  isRunning: boolean = false;
  stats: ExecutionStats = {
    steps: 0,
    swaps: 0,
    comparisons: 0,
    timeMs: 0
  };
  
  settings: AlgorithmSettings = {
    arraySize: 20,
    speed: 300,
    dataType: 'random',
    showStepCount: true,
    graphType: 'sparse'
  };

  // アルゴリズムカテゴリ
  sortingAlgorithms: AlgorithmType[] = [
    'bubble-sort', 'quick-sort', 'merge-sort', 'selection-sort', 'insertion-sort', 'heap-sort'
  ];
  
  searchAlgorithms: AlgorithmType[] = ['linear-search', 'binary-search'];
  
  graphAlgorithms: AlgorithmType[] = ['dijkstra', 'dfs', 'bfs'];
  
  dynamicProgramming: AlgorithmType[] = ['fibonacci'];

  // コンポーネントマッピング
  private componentMap = new Map<string, any>([
    ['bubble-sort', BubbleSortComponent],
    ['quick-sort', QuickSortComponent],
    ['selection-sort', SelectionSortComponent],
    ['insertion-sort', InsertionSortComponent],
    ['merge-sort', MergeSortComponent],
    ['heap-sort', HeapSortComponent],
    ['dijkstra', DijkstraComponent],
    ['dfs', DfsComponent],
    ['bfs', BfsComponent],
    ['linear-search', LinearSearchComponent],
    ['binary-search', BinarySearchComponent],
    ['fibonacci', FibonacciComponent]
  ]);

  constructor(
    private settingsService: AlgorithmSettingsService,
    public algorithmInfoService: AlgorithmInfoService
  ) {
    this.settings = this.settingsService.currentSettings;
  }

  ngOnInit(): void {
    this.settingsService.settings$
      .pipe(takeUntil(this.destroy$))
      .subscribe(settings => {
        this.settings = settings;
        this.updateCurrentComponentSettings();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.destroyCurrentComponent();
  }

  selectAlgorithm(algorithmType: AlgorithmType): void {
    if (this.isRunning) {
      this.stopAlgorithm();
    }
    
    this.selectedAlgorithm = algorithmType;
    this.resetStats();
    this.loadAlgorithmComponent(algorithmType);
  }

  private loadAlgorithmComponent(algorithmType: AlgorithmType): void {
    this.destroyCurrentComponent();
    
    const componentClass = this.componentMap.get(algorithmType);
    if (!componentClass) {
      console.error(`Component not found for algorithm: ${algorithmType}`);
      return;
    }

    this.currentComponentRef = this.algorithmContainer.createComponent(componentClass);
    this.setupComponent(this.currentComponentRef.instance, algorithmType);
  }

  private setupComponent(component: AlgorithmComponent, algorithmType: AlgorithmType): void {
    component.algorithmType = algorithmType;
    component.settings = this.settings;

    // イベントリスナーを設定
    if (component.statsChange) {
      component.statsChange.subscribe((stats: ExecutionStats) => {
        this.stats = stats;
      });
    }

    if (component.runningChange) {
      component.runningChange.subscribe((isRunning: boolean) => {
        this.isRunning = isRunning;
      });
    }

    // 初期化
    component.reset();
  }

  private updateCurrentComponentSettings(): void {
    if (this.currentComponentRef?.instance) {
      this.currentComponentRef.instance.settings = this.settings;
      this.currentComponentRef.instance.reset();
    }
  }

  private destroyCurrentComponent(): void {
    if (this.currentComponentRef) {
      this.currentComponentRef.destroy();
      this.currentComponentRef = null;
    }
  }

  runAlgorithm(): void {
    if (!this.currentComponentRef?.instance || this.isRunning) return;
    
    this.currentComponentRef.instance.run();
  }

  stopAlgorithm(): void {
    if (this.currentComponentRef?.instance) {
      this.currentComponentRef.instance.stop();
    }
  }

  resetAlgorithm(): void {
    if (this.currentComponentRef?.instance) {
      this.currentComponentRef.instance.reset();
    }
    this.resetStats();
  }

  private resetStats(): void {
    this.stats = {
      steps: 0,
      swaps: 0,
      comparisons: 0,
      timeMs: 0
    };
  }

  // 設定更新メソッド
  updateArraySize(size: number): void {
    this.settingsService.updateArraySize(size);
  }

  updateSpeed(speed: number): void {
    this.settingsService.updateSpeed(speed);
  }

  updateDataType(dataType: 'random' | 'sorted' | 'reverse' | 'nearly-sorted'): void {
    this.settingsService.updateDataType(dataType);
  }

  // ユーティリティメソッド
  getAlgorithmInfo(algorithmType: AlgorithmType | null) {
    if (!algorithmType) return null;
    return this.algorithmInfoService.getAlgorithmInfo(algorithmType);
  }

  getCategoryName(algorithms: AlgorithmType[]): string {
    if (algorithms === this.sortingAlgorithms) return 'ソートアルゴリズム';
    if (algorithms === this.searchAlgorithms) return '探索アルゴリズム';
    if (algorithms === this.graphAlgorithms) return 'グラフアルゴリズム';
    if (algorithms === this.dynamicProgramming) return '動的プログラミング';
    return '';
  }

  formatTime(ms: number): string {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  }
}