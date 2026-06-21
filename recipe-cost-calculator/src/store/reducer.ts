import type { AppData, Ingredient, Recipe } from '../types'

export type Action =
  | { type: 'INIT'; data: AppData }
  | { type: 'ADD_INGREDIENT'; ingredient: Ingredient }
  | { type: 'UPDATE_INGREDIENT'; ingredient: Ingredient }
  | { type: 'DELETE_INGREDIENT'; id: string }
  | { type: 'ADD_RECIPE'; recipe: Recipe }
  | { type: 'UPDATE_RECIPE'; recipe: Recipe }
  | { type: 'DELETE_RECIPE'; id: string }

export const initialState: AppData = { ingredients: [], recipes: [] }

export function reducer(state: AppData, action: Action): AppData {
  switch (action.type) {
    case 'INIT':
      return action.data

    case 'ADD_INGREDIENT':
      return { ...state, ingredients: [...state.ingredients, action.ingredient] }

    case 'UPDATE_INGREDIENT':
      return {
        ...state,
        ingredients: state.ingredients.map((i) =>
          i.id === action.ingredient.id ? action.ingredient : i,
        ),
      }

    case 'DELETE_INGREDIENT':
      return {
        ...state,
        ingredients: state.ingredients.filter((i) => i.id !== action.id),
        // 삭제된 재료를 참조하던 레시피 아이템도 정리
        recipes: state.recipes.map((r) => ({
          ...r,
          items: r.items.filter((it) => it.ingredientId !== action.id),
        })),
      }

    case 'ADD_RECIPE':
      return { ...state, recipes: [...state.recipes, action.recipe] }

    case 'UPDATE_RECIPE':
      return {
        ...state,
        recipes: state.recipes.map((r) =>
          r.id === action.recipe.id ? action.recipe : r,
        ),
      }

    case 'DELETE_RECIPE':
      return {
        ...state,
        recipes: state.recipes.filter((r) => r.id !== action.id),
      }

    default:
      return state
  }
}
