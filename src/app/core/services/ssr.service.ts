import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class SsrService {
  isBrowser: boolean;

  constructor(@Inject(PLATFORM_ID) private platformId: object) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  getDocument(): Document | null {
    return this.isBrowser ? document : null;
  }

  getWindow(): Window | null {
    return this.isBrowser ? window : null;
  }

  getLocalStorage(): Storage | null {
    return this.isBrowser ? localStorage : null;
  }
}
