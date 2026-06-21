import { createContext, useContext } from 'react'
import type { AppData, Ingredient, Recipe } from '../types'

/** 새 재료 입력값 (id/타임스탬프 제외) */
export type IngredientInput = Omit<Ingredient, 'id' | 'createdAt' | 'updatedAt'>

export interface StoreValue {
  data: AppData
  addIngredient: (input: IngredientInput) => void
  updateIngredient: (
    id: string,
    patch: Partial<IngredientInput>,
  ) => void
  deleteIngredient: (id: string) => void
  /** 새 레시피 생성 후 생성된 id 반환 */
  addRecipe: (name: string) => string
  updateRecipe: (
    id: string,
    patch: Partial<Omit<Recipe, 'id' | 'createdAt' | 'updatedAt'>>,
  ) => void
  deleteRecipe: (id: string) => void
}

export const StoreContext = createContext<StoreValue | null>(null)

export function useStore(): StoreValue {
  const ctx = useContext(StoreContext)
  if (!ctx) {
    throw new Error('useStore must be used within a StoreProvider')
  }
  return ctx
}
