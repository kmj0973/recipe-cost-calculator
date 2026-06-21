/** 원화 표시: 반올림 후 천 단위 콤마 + '원'. 값이 없으면 '—'. */
export function formatWon(value: number | null | undefined): string {
  if (value === null || value === undefined || Number.isNaN(value)) return '—'
  return `${Math.round(value).toLocaleString('ko-KR')}원`
}

/** 퍼센트 표시 (소수 1자리). 값이 없으면 '—'. */
export function formatPercent(value: number | null | undefined): string {
  if (value === null || value === undefined || Number.isNaN(value)) return '—'
  return `${value.toFixed(1)}%`
}

/** 단가 표시: 'N원/단위' (소수 둘째자리까지). */
export function formatUnitPrice(value: number, unitLabel: string): string {
  if (Number.isNaN(value)) return '—'
  const rounded = Math.round(value * 100) / 100
  return `${rounded.toLocaleString('ko-KR')}원/${unitLabel}`
}
