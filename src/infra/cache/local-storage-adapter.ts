/**
 * Infra Adapter: LocalStorageAdapter
 *
 * Wraps browser localStorage behind the SetStorage/GetStorage interface.
 * This keeps the data layer decoupled from the browser API.
 */
import { SetStorage } from '@/data/protocols/cache';

export class LocalStorageAdapter implements SetStorage {
  set(key: string, value: object): void {
    if (value) {
      localStorage.setItem(key, JSON.stringify(value));
    } else {
      localStorage.removeItem(key);
    }
  }

  get(key: string): any {
    return JSON.parse(localStorage.getItem(key));
  }
}
