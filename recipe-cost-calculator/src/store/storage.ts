import type { AppData } from '../types'

/**
 * 저장소 추상화. 컴포넌트/스토어는 이 인터페이스에만 의존한다.
 * 추후 백엔드 동기화 시 ApiAdapter 구현으로 무중단 교체.
 */
export interface StorageAdapter {
  load(): AppData | null
  save(data: AppData): void
}

const STORAGE_KEY = 'rcc:data'

export class LocalStorageAdapter implements StorageAdapter {
  load(): AppData | null {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (!raw) return null
      const parsed = JSON.parse(raw) as Partial<AppData>
      return {
        ingredients: parsed.ingredients ?? [],
        recipes: parsed.recipes ?? [],
      }
    } catch (err) {
      console.warn('저장된 데이터를 불러오지 못했습니다. 초기화합니다.', err)
      return null
    }
  }

  save(data: AppData): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    } catch (err) {
      console.error('데이터 저장에 실패했습니다.', err)
    }
  }
}

export const defaultStorage: StorageAdapter = new LocalStorageAdapter()
