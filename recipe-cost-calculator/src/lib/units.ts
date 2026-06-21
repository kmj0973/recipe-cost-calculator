import type { Unit } from '../types'

/** 단위 그룹: 같은 그룹 내에서만 환산 가능 */
export type UnitGroup = 'weight' | 'volume' | 'count'

/** 단위 메타: 그룹과, 그룹 기준 단위(base) 대비 배율 */
interface UnitMeta {
  group: UnitGroup
  /** base 단위(g, ml, ea) 1개당 이 단위의 양 */
  toBase: number
  label: string
}

const UNIT_META: Record<Unit, UnitMeta> = {
  g: { group: 'weight', toBase: 1, label: 'g' },
  kg: { group: 'weight', toBase: 1000, label: 'kg' },
  ml: { group: 'volume', toBase: 1, label: 'ml' },
  L: { group: 'volume', toBase: 1000, label: 'L' },
  ea: { group: 'count', toBase: 1, label: '개' },
}

export const ALL_UNITS: Unit[] = ['g', 'kg', 'ml', 'L', 'ea']

export function unitGroup(unit: Unit): UnitGroup {
  return UNIT_META[unit].group
}

export function unitLabel(unit: Unit): string {
  return UNIT_META[unit].label
}

/** 두 단위가 서로 환산 가능한지 (같은 그룹인지) */
export function isCompatible(a: Unit, b: Unit): boolean {
  return UNIT_META[a].group === UNIT_META[b].group
}

/**
 * amount(from 단위) 를 to 단위로 환산.
 * 호환되지 않는 단위면 예외를 던진다.
 */
export function convert(amount: number, from: Unit, to: Unit): number {
  if (!isCompatible(from, to)) {
    throw new Error(
      `환산할 수 없는 단위입니다: ${unitLabel(from)} → ${unitLabel(to)}`,
    )
  }
  const inBase = amount * UNIT_META[from].toBase
  return inBase / UNIT_META[to].toBase
}
