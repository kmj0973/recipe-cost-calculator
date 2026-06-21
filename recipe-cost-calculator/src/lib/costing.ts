import type { Ingredient, Recipe, RecipeItem } from '../types'
import { convert, isCompatible } from './units'

/** 재료의 단가 (구매 단위 1개당 원). 잘못된 입력이면 0. */
export function unitPrice(ingredient: Ingredient): number {
  if (ingredient.purchaseAmount <= 0) return 0
  return ingredient.purchasePrice / ingredient.purchaseAmount
}

/** 레시피 아이템 1줄의 재료비. 재료가 없거나 단위 불일치면 null. */
export function lineCost(
  item: RecipeItem,
  ingredient: Ingredient | undefined,
): number | null {
  if (!ingredient) return null
  if (!isCompatible(item.unit, ingredient.unit)) return null
  // 사용량을 재료의 구매 단위로 환산한 뒤 단가를 곱한다.
  const amountInPurchaseUnit = convert(item.amount, item.unit, ingredient.unit)
  return amountInPurchaseUnit * unitPrice(ingredient)
}

export interface CostingResult {
  /** 총 재료비 (원) */
  totalCost: number
  /** 생산량 1개당 원가 (원) */
  unitCost: number
  /** 원가율 (%) — 판매가 없으면 null */
  costRate: number | null
  /** 1개당 이익 (원) — 판매가 없으면 null */
  unitProfit: number | null
  /** 목표 원가율 기반 권장 판매가 (원) — 목표 미설정/무효면 null */
  suggestedPrice: number | null
  /** 단위 불일치 등으로 계산에서 빠진 아이템 인덱스 */
  invalidItemIndexes: number[]
}

/**
 * 레시피의 원가/가격 지표를 계산한다. 순수 함수.
 * @param recipe 대상 레시피
 * @param ingredientById 재료 id → 재료 조회 맵
 */
export function calcCosting(
  recipe: Recipe,
  ingredientById: Map<string, Ingredient>,
): CostingResult {
  let totalCost = 0
  const invalidItemIndexes: number[] = []

  recipe.items.forEach((item, index) => {
    const ingredient = ingredientById.get(item.ingredientId)
    const cost = lineCost(item, ingredient)
    if (cost === null) {
      invalidItemIndexes.push(index)
      return
    }
    totalCost += cost
  })

  const servings = recipe.yield > 0 ? recipe.yield : 1
  const unitCost = totalCost / servings

  const price = recipe.sellingPrice
  const hasPrice = typeof price === 'number' && price > 0
  const costRate = hasPrice ? (unitCost / price) * 100 : null
  const unitProfit = hasPrice ? price - unitCost : null

  const target = recipe.targetCostRate
  // 원가율 = 원가 / 판매가 이므로, 판매가 = 원가 / (목표원가율/100)
  const hasTarget = typeof target === 'number' && target > 0 && target <= 100
  const suggestedPrice = hasTarget ? unitCost / (target / 100) : null

  return {
    totalCost,
    unitCost,
    costRate,
    unitProfit,
    suggestedPrice,
    invalidItemIndexes,
  }
}
