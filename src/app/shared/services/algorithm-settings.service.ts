import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { AlgorithmSettings } from '../interfaces/algorithm.interface';

@Injectable({
  providedIn: 'root'
})
export class AlgorithmSettingsService {
  private defaultSettings: AlgorithmSettings = {
    arraySize: 20,
    speed: 300,
    dataType: 'random',
    showStepCount: true,
    graphType: 'sparse'
  };

  private settingsSubject = new BehaviorSubject<AlgorithmSettings>(this.defaultSettings);
  public settings$ = this.settingsSubject.asObservable();

  get currentSettings(): AlgorithmSettings {
    return this.settingsSubject.value;
  }

  updateArraySize(size: number): void {
    const settings = { ...this.currentSettings };
    settings.arraySize = Math.max(5, Math.min(50, size));
    this.settingsSubject.next(settings);
  }

  updateSpeed(speed: number): void {
    const settings = { ...this.currentSettings };
    settings.speed = Math.max(50, Math.min(2000, speed));
    this.settingsSubject.next(settings);
  }

  updateDataType(type: 'random' | 'sorted' | 'reverse' | 'nearly-sorted'): void {
    const settings = { ...this.currentSettings };
    settings.dataType = type;
    this.settingsSubject.next(settings);
  }

  updateGraphType(type: 'complete' | 'sparse' | 'chain' | 'tree'): void {
    const settings = { ...this.currentSettings };
    settings.graphType = type;
    this.settingsSubject.next(settings);
  }

  updateShowStepCount(show: boolean): void {
    const settings = { ...this.currentSettings };
    settings.showStepCount = show;
    this.settingsSubject.next(settings);
  }

  reset(): void {
    this.settingsSubject.next({ ...this.defaultSettings });
  }
}