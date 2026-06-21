import { useMemo } from 'react'
import { useStore } from '../store/StoreContext'
import { calcCosting, type CostingResult } from '../lib/costing'
import { formatPercent, formatWon } from '../lib/format'
import { Card, EmptyState } from '../components/ui'

interface Row {
  id: string
  name: string
  itemCount: number
  sellingPrice?: number
  costing: CostingResult
}

function rateTone(rate: number | null): 'normal' | 'warn' | 'danger' {
  if (rate === null) return 'normal'
  if (rate >= 50) return 'danger'
  if (rate >= 35) return 'warn'
  return 'normal'
}

const TONE_CLASS: Record<'normal' | 'warn' | 'danger', string> = {
  normal: 'text-gray-800',
  warn: 'text-amber-600',
  danger: 'text-red-600 font-semibold',
}

export function DashboardPage() {
  const { data } = useStore()

  const rows = useMemo<Row[]>(() => {
    const ingredientById = new Map(data.ingredients.map((i) => [i.id, i]))
    return data.recipes
      .map((r) => ({
        id: r.id,
        name: r.name,
        itemCount: r.items.length,
        sellingPrice: r.sellingPrice,
        costing: calcCosting(r, ingredientById),
      }))
      .sort((a, b) => {
        // 원가율 높은 순. 판매가 미입력(null)은 맨 아래로.
        const ra = a.costing.costRate
        const rb = b.costing.costRate
        if (ra === null && rb === null) return 0
        if (ra === null) return 1
        if (rb === null) return -1
        return rb - ra
      })
  }, [data])

  const summary = useMemo(() => {
    const priced = rows.filter((r) => r.costing.costRate !== null)
    const avgRate =
      priced.length > 0
        ? priced.reduce((s, r) => s + (r.costing.costRate ?? 0), 0) /
          priced.length
        : null
    const risky = priced.filter((r) => (r.costing.costRate ?? 0) >= 50).length
    return { total: rows.length, avgRate, risky }
  }, [rows])

  if (data.recipes.length === 0) {
    return (
      <Card>
        <EmptyState message="등록된 레시피가 없습니다. '레시피' 탭에서 먼저 메뉴를 만들어 보세요." />
      </Card>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      {/* 요약 카드 */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <SummaryCard label="전체 메뉴" value={`${summary.total}개`} />
        <SummaryCard
          label="평균 원가율"
          value={formatPercent(summary.avgRate)}
        />
        <SummaryCard
          label="위험 메뉴 (원가율 ≥ 50%)"
          value={`${summary.risky}개`}
          tone={summary.risky > 0 ? 'danger' : 'normal'}
        />
      </div>

      {/* 메뉴별 수익성 테이블 */}
      <Card>
        <h2 className="mb-1 text-lg font-semibold text-gray-800">
          메뉴별 수익성
        </h2>
        <p className="mb-3 text-xs text-gray-400">원가율 높은 순 정렬</p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-left text-gray-500">
                <th className="py-2 pr-4 font-medium">메뉴</th>
                <th className="py-2 pr-4 font-medium text-right">1개 원가</th>
                <th className="py-2 pr-4 font-medium text-right">판매가</th>
                <th className="py-2 pr-4 font-medium text-right">원가율 ▼</th>
                <th className="py-2 pr-4 font-medium text-right">1개 이익</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => {
                const tone = rateTone(row.costing.costRate)
                return (
                  <tr
                    key={row.id}
                    className="border-b border-gray-100 last:border-0"
                  >
                    <td className="py-2 pr-4 font-medium text-gray-800">
                      {row.name}
                      {row.itemCount === 0 && (
                        <span className="ml-1 text-xs text-gray-400">
                          (재료 없음)
                        </span>
                      )}
                    </td>
                    <td className="py-2 pr-4 text-right text-gray-700">
                      {formatWon(row.costing.unitCost)}
                    </td>
                    <td className="py-2 pr-4 text-right text-gray-700">
                      {formatWon(row.sellingPrice)}
                    </td>
                    <td className={`py-2 pr-4 text-right ${TONE_CLASS[tone]}`}>
                      {tone === 'danger' && '🔴 '}
                      {formatPercent(row.costing.costRate)}
                    </td>
                    <td className="py-2 pr-4 text-right text-gray-700">
                      {formatWon(row.costing.unitProfit)}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}

function SummaryCard({
  label,
  value,
  tone = 'normal',
}: {
  label: string
  value: string
  tone?: 'normal' | 'danger'
}) {
  return (
    <Card>
      <p className="text-xs text-gray-500">{label}</p>
      <p
        className={`mt-1 text-2xl font-bold ${
          tone === 'danger' ? 'text-red-600' : 'text-gray-900'
        }`}
      >
        {value}
      </p>
    </Card>
  )
}
