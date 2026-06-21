// 도메인 타입 정의

/** 측정 단위. 무게/부피/개수 3개 그룹으로 나뉜다. */
export type Unit = 'g' | 'kg' | 'ml' | 'L' | 'ea'

/** 재료: 구매 단위 기준으로 가격을 입력하고, 단가는 파생 계산한다. */
export interface Ingredient {
  id: string
  name: string
  /** 구매가 (원) */
  purchasePrice: number
  /** 구매 용량 (unit 기준 수량) */
  purchaseAmount: number
  unit: Unit
  createdAt: string
  updatedAt: string
}

/** 레시피에 들어가는 재료 한 줄 */
export interface RecipeItem {
  ingredientId: string
  amount: number
  unit: Unit
}

/** 레시피(메뉴) */
export interface Recipe {
  id: string
  name: string
  items: RecipeItem[]
  /** 생산량 (인분/개수), 1 이상 */
  yield: number
  /** 판매가 (원) */
  sellingPrice?: number
  /** 목표 원가율 (%) */
  targetCostRate?: number
  createdAt: string
  updatedAt: string
}

/** 영속화되는 전체 상태 스냅샷 */
export interface AppData {
  ingredients: Ingredient[]
  recipes: Recipe[]
}
