import { useMemo, useState } from 'react'
import type { Ingredient, Recipe, RecipeItem, Unit } from '../types'
import { useStore } from '../store/StoreContext'
import { calcCosting } from '../lib/costing'
import { formatPercent, formatWon } from '../lib/format'
import { ALL_UNITS, isCompatible, unitLabel } from '../lib/units'
import {
  Button,
  Card,
  EmptyState,
  Field,
  NumberInput,
  Select,
  TextInput,
} from '../components/ui'

export function RecipesPage() {
  const { data, addRecipe, deleteRecipe } = useStore()
  const [selectedId, setSelectedId] = useState<string | null>(
    data.recipes[0]?.id ?? null,
  )
  const [newName, setNewName] = useState('')

  const selected = data.recipes.find((r) => r.id === selectedId) ?? null

  function handleCreate() {
    const name = newName.trim()
    if (!name) return
    const id = addRecipe(name)
    setSelectedId(id)
    setNewName('')
  }

  function handleDelete(recipe: Recipe) {
    if (confirm(`레시피 '${recipe.name}'을(를) 삭제할까요?`)) {
      deleteRecipe(recipe.id)
      if (selectedId === recipe.id) setSelectedId(null)
    }
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[17.5rem_1fr]">
      {/* 레시피 목록 */}
      <Card className="h-fit">
        <h2 className="mb-3 text-lg font-semibold text-gray-800">레시피</h2>
        <div className="mb-3 flex gap-2">
          <TextInput
            value={newName}
            placeholder="새 레시피 이름"
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
          />
          <Button onClick={handleCreate} disabled={!newName.trim()}>
            추가
          </Button>
        </div>
        {data.recipes.length === 0 ? (
          <EmptyState message="레시피가 없습니다." />
        ) : (
          <ul className="flex flex-col gap-1">
            {data.recipes.map((r) => (
              <li key={r.id}>
                <button
                  onClick={() => setSelectedId(r.id)}
                  className={`flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm transition-colors ${
                    r.id === selectedId
                      ? 'bg-violet-50 font-medium text-violet-700'
                      : 'hover:bg-gray-100'
                  }`}
                >
                  <span className="truncate">{r.name}</span>
                  <span className="text-xs text-gray-400">
                    {r.items.length}개 재료
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </Card>

      {/* 레시피 편집 */}
      {selected ? (
        <RecipeEditor
          key={selected.id}
          recipe={selected}
          ingredients={data.ingredients}
          onDelete={() => handleDelete(selected)}
        />
      ) : (
        <Card>
          <EmptyState message="왼쪽에서 레시피를 선택하거나 새로 만들어 보세요." />
        </Card>
      )}
    </div>
  )
}

function RecipeEditor({
  recipe,
  ingredients,
  onDelete,
}: {
  recipe: Recipe
  ingredients: Ingredient[]
  onDelete: () => void
}) {
  const { updateRecipe } = useStore()
  const [pickIngredientId, setPickIngredientId] = useState('')

  const ingredientById = useMemo(
    () => new Map(ingredients.map((i) => [i.id, i])),
    [ingredients],
  )
  const costing = useMemo(
    () => calcCosting(recipe, ingredientById),
    [recipe, ingredientById],
  )

  function setItems(items: RecipeItem[]) {
    updateRecipe(recipe.id, { items })
  }

  function addItem() {
    const ing = ingredientById.get(pickIngredientId)
    if (!ing) return
    const item: RecipeItem = {
      ingredientId: ing.id,
      amount: 0,
      unit: ing.unit,
    }
    setItems([...recipe.items, item])
    setPickIngredientId('')
  }

  function updateItem(index: number, patch: Partial<RecipeItem>) {
    setItems(
      recipe.items.map((it, i) => (i === index ? { ...it, ...patch } : it)),
    )
  }

  function removeItem(index: number) {
    setItems(recipe.items.filter((_, i) => i !== index))
  }

  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_20rem]">
      {/* 좌: 기본정보 + 재료 */}
      <div className="flex flex-col gap-4">
        <Card>
          <div className="flex flex-wrap items-end gap-3">
            <Field label="레시피명" className="min-w-40 flex-1">
              <TextInput
                value={recipe.name}
                onChange={(e) =>
                  updateRecipe(recipe.id, { name: e.target.value })
                }
              />
            </Field>
            <Field label="생산량 (개/인분)" className="w-32">
              <NumberInput
                value={recipe.yield}
                min={1}
                onChange={(e) =>
                  updateRecipe(recipe.id, {
                    yield: Math.max(1, Number(e.target.value) || 1),
                  })
                }
              />
            </Field>
            <Button variant="danger" onClick={onDelete}>
              🗑 레시피 삭제
            </Button>
          </div>
        </Card>

        <Card>
          <h3 className="mb-3 text-base font-semibold text-gray-800">
            사용 재료
          </h3>

          {ingredients.length === 0 ? (
            <EmptyState message="먼저 '재료' 탭에서 재료를 등록하세요." />
          ) : (
            <div className="mb-4 flex gap-2">
              <Select
                value={pickIngredientId}
                onChange={(e) => setPickIngredientId(e.target.value)}
              >
                <option value="">재료 선택…</option>
                {ingredients.map((i) => (
                  <option key={i.id} value={i.id}>
                    {i.name}
                  </option>
                ))}
              </Select>
              <Button onClick={addItem} disabled={!pickIngredientId}>
                + 추가
              </Button>
            </div>
          )}

          {recipe.items.length === 0 ? (
            <EmptyState message="추가된 재료가 없습니다." />
          ) : (
            <ul className="flex flex-col gap-2">
              {recipe.items.map((item, index) => {
                const ing = ingredientById.get(item.ingredientId)
                const incompatible =
                  ing && !isCompatible(item.unit, ing.unit)
                return (
                  <li
                    key={index}
                    className="flex flex-wrap items-center gap-2 rounded-lg border border-gray-100 bg-gray-50 p-2"
                  >
                    <span className="min-w-30 flex-1 font-medium text-gray-800">
                      {ing?.name ?? '(삭제된 재료)'}
                    </span>
                    <NumberInput
                      className="w-24"
                      value={item.amount}
                      min={0}
                      onChange={(e) =>
                        updateItem(index, {
                          amount: Number(e.target.value) || 0,
                        })
                      }
                    />
                    <Select
                      className="w-24"
                      value={item.unit}
                      onChange={(e) =>
                        updateItem(index, { unit: e.target.value as Unit })
                      }
                    >
                      {ALL_UNITS.map((u) => (
                        <option key={u} value={u}>
                          {unitLabel(u)}
                        </option>
                      ))}
                    </Select>
                    <Button
                      variant="danger"
                      onClick={() => removeItem(index)}
                    >
                      🗑 삭제
                    </Button>
                    {incompatible && (
                      <p className="w-full text-xs text-red-500">
                        ⚠ '{ing?.name}'의 단위({unitLabel(ing!.unit)})와 환산할
                        수 없는 단위입니다. 비용 계산에서 제외됩니다.
                      </p>
                    )}
                  </li>
                )
              })}
            </ul>
          )}
        </Card>
      </div>

      {/* 우: 원가 패널 */}
      <CostPanel recipe={recipe} costing={costing} />
    </div>
  )
}

function CostPanel({
  recipe,
  costing,
}: {
  recipe: Recipe
  costing: ReturnType<typeof calcCosting>
}) {
  const { updateRecipe } = useStore()

  return (
    <Card className="h-fit xl:sticky xl:top-4">
      <h3 className="mb-3 text-base font-semibold text-gray-800">💰 원가 분석</h3>

      <dl className="flex flex-col gap-2 text-sm">
        <Row label="총 재료비" value={formatWon(costing.totalCost)} />
        <Row
          label={`1개당 원가 (÷${recipe.yield})`}
          value={formatWon(costing.unitCost)}
          strong
        />
      </dl>

      <hr className="my-4 border-gray-100" />

      <Field label="판매가 (원)">
        <NumberInput
          value={recipe.sellingPrice ?? ''}
          min={0}
          placeholder="예: 2000"
          onChange={(e) =>
            updateRecipe(recipe.id, {
              sellingPrice: e.target.value ? Number(e.target.value) : undefined,
            })
          }
        />
      </Field>

      <dl className="mt-3 flex flex-col gap-2 text-sm">
        <Row
          label="원가율"
          value={formatPercent(costing.costRate)}
          tone={rateTone(costing.costRate)}
        />
        <Row label="1개당 이익" value={formatWon(costing.unitProfit)} />
      </dl>

      <hr className="my-4 border-gray-100" />

      <Field label="목표 원가율 (%)">
        <NumberInput
          value={recipe.targetCostRate ?? ''}
          min={0}
          max={99}
          placeholder="예: 30"
          onChange={(e) =>
            updateRecipe(recipe.id, {
              targetCostRate: e.target.value
                ? Number(e.target.value)
                : undefined,
            })
          }
        />
      </Field>

      <dl className="mt-3 flex flex-col gap-2 text-sm">
        <Row
          label="권장 판매가"
          value={formatWon(costing.suggestedPrice)}
          strong
        />
      </dl>

      {costing.invalidItemIndexes.length > 0 && (
        <p className="mt-4 text-xs text-amber-600">
          ⚠ 단위가 맞지 않는 재료 {costing.invalidItemIndexes.length}개는 계산에서
          제외됐습니다.
        </p>
      )}
    </Card>
  )
}

function rateTone(rate: number | null): 'normal' | 'warn' | 'danger' {
  if (rate === null) return 'normal'
  if (rate >= 50) return 'danger'
  if (rate >= 35) return 'warn'
  return 'normal'
}

function Row({
  label,
  value,
  strong,
  tone = 'normal',
}: {
  label: string
  value: string
  strong?: boolean
  tone?: 'normal' | 'warn' | 'danger'
}) {
  const toneClass =
    tone === 'danger'
      ? 'text-red-600'
      : tone === 'warn'
        ? 'text-amber-600'
        : 'text-gray-800'
  return (
    <div className="flex items-center justify-between">
      <dt className="text-gray-500">{label}</dt>
      <dd
        className={`${strong ? 'text-base font-bold' : 'font-medium'} ${toneClass}`}
      >
        {value}
      </dd>
    </div>
  )
}
