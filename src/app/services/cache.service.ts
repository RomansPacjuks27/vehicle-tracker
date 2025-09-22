import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CacheService {
  constructor() { }

  save(options: CachingOptions) {
    options.expiresInSeconds = options.expiresInSeconds > 0 ? options.expiresInSeconds : 0;
    const date = new Date();
    const data = {
      value: options.data,
      expiresOn: date.setSeconds(date.getSeconds() + options.expiresInSeconds)
    }
    localStorage.setItem(options.key, JSON.stringify(data));
  }

  load(key: string) {
    const item = localStorage.getItem(key);
    if (item) {
      const data = JSON.parse(item);
      if (data && data.expiresOn >= new Date()) {
        return data.value;
      }
      else
        this.remove(key);
        return null;
    }
  }

  remove(key: string) {
    localStorage.removeItem(key);
  }
}

export interface CachingOptions {
  key: string
  data: any
  expiresInSeconds: number
}
