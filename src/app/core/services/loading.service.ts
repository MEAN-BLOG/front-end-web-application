import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoadingService {
  private readonly loadingSubject = new BehaviorSubject<boolean>(false);
  private readonly loadingMap = new Map<string, boolean>();

  loading$ = this.loadingSubject.asObservable();

  setLoading(loading: boolean, url: string): void {
    if (!url) {
      throw new Error('The request URL must be provided to the LoadingService.setLoading function');
    }

    if (loading === true) {
      this.loadingMap.set(url, true);
      this.loadingSubject.next(true);
    } else if (loading === false && this.loadingMap.has(url)) {
      this.loadingMap.delete(url);
    }

    if (this.loadingMap.size === 0) {
      this.loadingSubject.next(false);
    }
  }

  getLoadingStatus(): boolean {
    return this.loadingMap.size > 0;
  }
}
