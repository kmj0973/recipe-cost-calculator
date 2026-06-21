import { useEffect, useMemo, useReducer, useRef, type ReactNode } from 'react'
import type { Ingredient, Recipe } from '../types'
import { defaultStorage, type StorageAdapter } from './storage'
import { initialState, reducer } from './reducer'
import { seedData } from './seed'
import {
  StoreContext,
  type IngredientInput,
  type StoreValue,
} from './StoreContext'

function newId(): string {
  return crypto.randomUUID()
}

function now(): string {
  return new Date().toISOString()
}

interface Props {
  children: ReactNode
  storage?: StorageAdapter
}

export function StoreProvider({ children, storage = defaultStorage }: Props) {
  const [data, dispatch] = useReducer(reducer, initialState)
  const loaded = useRef(false)
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // 최초 1회 로드. 저장된 데이터가 없으면 예시 데이터로 시작한다.
  useEffect(() => {
    const stored = storage.load()
    dispatch({ type: 'INIT', data: stored ?? seedData })
    loaded.current = true
  }, [storage])

  // 변경 시 디바운스 저장 (로드 완료 후에만)
  useEffect(() => {
    if (!loaded.current) return
    if (saveTimer.current) clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(() => storage.save(data), 300)
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current)
    }
  }, [data, storage])

  const value = useMemo<StoreValue>(() => {
    const findIngredient = (id: string) =>
      data.ingredients.find((i) => i.id === id)
    const findRecipe = (id: string) => data.recipes.find((r) => r.id === id)

    return {
      data,

      addIngredient(input: IngredientInput) {
        const ts = now()
        const ingredient: Ingredient = {
          ...input,
          id: newId(),
          createdAt: ts,
          updatedAt: ts,
        }
        dispatch({ type: 'ADD_INGREDIENT', ingredient })
      },

      updateIngredient(id, patch) {
        const existing = findIngredient(id)
        if (!existing) return
        dispatch({
          type: 'UPDATE_INGREDIENT',
          ingredient: { ...existing, ...patch, updatedAt: now() },
        })
      },

      deleteIngredient(id) {
        dispatch({ type: 'DELETE_INGREDIENT', id })
      },

      addRecipe(name) {
        const ts = now()
        const recipe: Recipe = {
          id: newId(),
          name,
          items: [],
          yield: 1,
          createdAt: ts,
          updatedAt: ts,
        }
        dispatch({ type: 'ADD_RECIPE', recipe })
        return recipe.id
      },

      updateRecipe(id, patch) {
        const existing = findRecipe(id)
        if (!existing) return
        dispatch({
          type: 'UPDATE_RECIPE',
          recipe: { ...existing, ...patch, updatedAt: now() },
        })
      },

      deleteRecipe(id) {
        dispatch({ type: 'DELETE_RECIPE', id })
      },
    }
  }, [data])

  return <StoreContext value={value}>{children}</StoreContext>
}
