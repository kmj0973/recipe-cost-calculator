import { useState } from 'react'
import type { Ingredient, Unit } from '../types'
import { useStore } from '../store/StoreContext'
import { unitPrice } from '../lib/costing'
import { formatUnitPrice, formatWon } from '../lib/format'
import { ALL_UNITS, unitLabel } from '../lib/units'
import {
  Button,
  Card,
  EmptyState,
  Field,
  NumberInput,
  Select,
  TextInput,
} from '../components/ui'

interface FormState {
  name: string
  purchasePrice: string
  purchaseAmount: string
  unit: Unit
}

const EMPTY_FORM: FormState = {
  name: '',
  purchasePrice: '',
  purchaseAmount: '',
  unit: 'g',
}

function UnitOptions() {
  return (
    <>
      {ALL_UNITS.map((u) => (
        <option key={u} value={u}>
          {unitLabel(u)}
        </option>
      ))}
    </>
  )
}

export function IngredientsPage() {
  const { data, addIngredient, updateIngredient, deleteIngredient } = useStore()
  const [form, setForm] = useState<FormState>(EMPTY_FORM)
  const [editingId, setEditingId] = useState<string | null>(null)

  const price = Number(form.purchasePrice)
  const amount = Number(form.purchaseAmount)
  const canSubmit =
    form.name.trim() !== '' && price > 0 && amount > 0

  function resetForm() {
    setForm(EMPTY_FORM)
    setEditingId(null)
  }

  function handleSubmit() {
    if (!canSubmit) return
    const payload = {
      name: form.name.trim(),
      purchasePrice: price,
      purchaseAmount: amount,
      unit: form.unit,
    }
    if (editingId) {
      updateIngredient(editingId, payload)
    } else {
      addIngredient(payload)
    }
    resetForm()
  }

  function startEdit(ingredient: Ingredient) {
    setEditingId(ingredient.id)
    setForm({
      name: ingredient.name,
      purchasePrice: String(ingredient.purchasePrice),
      purchaseAmount: String(ingredient.purchaseAmount),
      unit: ingredient.unit,
    })
  }

  function handleDelete(ingredient: Ingredient) {
    const usedIn = data.recipes.filter((r) =>
      r.items.some((it) => it.ingredientId === ingredient.id),
    )
    const msg =
      usedIn.length > 0
        ? `'${ingredient.name}'은(는) 레시피 ${usedIn.length}개에서 사용 중입니다(${usedIn
            .map((r) => r.name)
            .join(', ')}). 삭제하면 해당 레시피에서도 제거됩니다. 계속할까요?`
        : `'${ingredient.name}'을(를) 삭제할까요?`
    if (confirm(msg)) {
      deleteIngredient(ingredient.id)
      if (editingId === ingredient.id) resetForm()
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <h2 className="mb-3 text-lg font-semibold text-gray-800">
          {editingId ? '재료 수정' : '재료 추가'}
        </h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <Field label="재료명" className="lg:col-span-2">
            <TextInput
              value={form.name}
              placeholder="예: 밀가루"
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </Field>
          <Field label="구매가 (원)">
            <NumberInput
              value={form.purchasePrice}
              min={0}
              placeholder="10000"
              onChange={(e) =>
                setForm({ ...form, purchasePrice: e.target.value })
              }
            />
          </Field>
          <Field label="용량">
            <NumberInput
              value={form.purchaseAmount}
              min={0}
              placeholder="1000"
              onChange={(e) =>
                setForm({ ...form, purchaseAmount: e.target.value })
              }
            />
          </Field>
          <Field label="단위">
            <Select
              value={form.unit}
              onChange={(e) =>
                setForm({ ...form, unit: e.target.value as Unit })
              }
            >
              <UnitOptions />
            </Select>
          </Field>
        </div>
        <div className="mt-3 flex items-center gap-2">
          <Button onClick={handleSubmit} disabled={!canSubmit}>
            {editingId ? '수정 완료' : '+ 추가'}
          </Button>
          {editingId && (
            <Button variant="secondary" onClick={resetForm}>
              취소
            </Button>
          )}
          {canSubmit && (
            <span className="ml-auto text-sm text-gray-500">
              단가{' '}
              <strong className="text-gray-800">
                {formatUnitPrice(price / amount, unitLabel(form.unit))}
              </strong>
            </span>
          )}
        </div>
      </Card>

      <Card>
        <h2 className="mb-3 text-lg font-semibold text-gray-800">
          재료 목록 ({data.ingredients.length})
        </h2>
        {data.ingredients.length === 0 ? (
          <EmptyState message="등록된 재료가 없습니다. 위에서 재료를 추가해 보세요." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-left text-gray-500">
                  <th className="py-2 pr-4 font-medium">이름</th>
                  <th className="py-2 pr-4 font-medium">구매가</th>
                  <th className="py-2 pr-4 font-medium">용량</th>
                  <th className="py-2 pr-4 font-medium">단가</th>
                  <th className="py-2 pr-4 font-medium text-right">관리</th>
                </tr>
              </thead>
              <tbody>
                {data.ingredients.map((ing) => (
                  <tr
                    key={ing.id}
                    className="border-b border-gray-100 last:border-0"
                  >
                    <td className="py-2 pr-4 font-medium text-gray-800">
                      {ing.name}
                    </td>
                    <td className="py-2 pr-4 text-gray-600">
                      {formatWon(ing.purchasePrice)}
                    </td>
                    <td className="py-2 pr-4 text-gray-600">
                      {ing.purchaseAmount.toLocaleString('ko-KR')}
                      {unitLabel(ing.unit)}
                    </td>
                    <td className="py-2 pr-4 text-gray-800">
                      {formatUnitPrice(unitPrice(ing), unitLabel(ing.unit))}
                    </td>
                    <td className="py-2 pr-4">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          onClick={() => startEdit(ing)}
                        >
                          수정
                        </Button>
                        <Button
                          variant="danger"
                          onClick={() => handleDelete(ing)}
                        >
                          삭제
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  )
}
