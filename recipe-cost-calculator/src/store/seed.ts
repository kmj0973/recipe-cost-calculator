import type { AppData } from '../types'

// 최초 실행(저장된 데이터 없음) 시 채워지는 예시 데이터.
// 재료 id는 레시피에서 참조하므로 고정 문자열을 사용한다.
const TS = '2026-01-01T00:00:00.000Z'

export const seedData: AppData = {
  ingredients: [
    { id: 'ing-flour', name: '밀가루', purchasePrice: 10000, purchaseAmount: 1000, unit: 'g', createdAt: TS, updatedAt: TS },
    { id: 'ing-butter', name: '버터', purchasePrice: 8000, purchaseAmount: 500, unit: 'g', createdAt: TS, updatedAt: TS },
    { id: 'ing-sugar', name: '설탕', purchasePrice: 3000, purchaseAmount: 1000, unit: 'g', createdAt: TS, updatedAt: TS },
    { id: 'ing-milk', name: '우유', purchasePrice: 2500, purchaseAmount: 1000, unit: 'ml', createdAt: TS, updatedAt: TS },
    { id: 'ing-egg', name: '계란', purchasePrice: 6000, purchaseAmount: 30, unit: 'ea', createdAt: TS, updatedAt: TS },
    { id: 'ing-bean', name: '원두', purchasePrice: 25000, purchaseAmount: 1000, unit: 'g', createdAt: TS, updatedAt: TS },
  ],
  recipes: [
    {
      id: 'rec-croissant',
      name: '크루아상',
      yield: 10,
      sellingPrice: 2000,
      targetCostRate: 30,
      items: [
        { ingredientId: 'ing-flour', amount: 500, unit: 'g' },
        { ingredientId: 'ing-butter', amount: 200, unit: 'g' },
        { ingredientId: 'ing-sugar', amount: 50, unit: 'g' },
      ],
      createdAt: TS,
      updatedAt: TS,
    },
    {
      id: 'rec-americano',
      name: '아메리카노',
      yield: 1,
      sellingPrice: 4000,
      targetCostRate: 20,
      items: [{ ingredientId: 'ing-bean', amount: 18, unit: 'g' }],
      createdAt: TS,
      updatedAt: TS,
    },
    {
      id: 'rec-latte',
      name: '카페라떼',
      yield: 1,
      sellingPrice: 4500,
      items: [
        { ingredientId: 'ing-bean', amount: 18, unit: 'g' },
        { ingredientId: 'ing-milk', amount: 200, unit: 'ml' },
      ],
      createdAt: TS,
      updatedAt: TS,
    },
  ],
}
