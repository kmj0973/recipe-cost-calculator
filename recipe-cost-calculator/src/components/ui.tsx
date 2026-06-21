import type {
  ButtonHTMLAttributes,
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
} from 'react'

type Variant = 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost'

const VARIANT_CLASS: Record<Variant, string> = {
  primary: 'bg-violet-600 text-white shadow-sm hover:bg-violet-700',
  secondary: 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-100',
  outline:
    'border border-violet-300 bg-violet-50 text-violet-700 hover:bg-violet-100',
  danger: 'border border-red-300 bg-red-50 text-red-600 hover:bg-red-100',
  ghost: 'bg-transparent text-gray-500 hover:bg-gray-100',
}

export function Button({
  variant = 'primary',
  className = '',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return (
    <button
      className={`inline-flex shrink-0 items-center justify-center gap-1 whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${VARIANT_CLASS[variant]} ${className}`}
      {...props}
    />
  )
}

const FIELD_CLASS =
  'w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500'

export function TextInput({
  className = '',
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return <input type="text" className={`${FIELD_CLASS} ${className}`} {...props} />
}

export function NumberInput({
  className = '',
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      type="number"
      inputMode="decimal"
      className={`${FIELD_CLASS} ${className}`}
      {...props}
    />
  )
}

export function Select({
  className = '',
  children,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select className={`${FIELD_CLASS} bg-white ${className}`} {...props}>
      {children}
    </select>
  )
}

export function Field({
  label,
  children,
  className = '',
}: {
  label: string
  children: ReactNode
  className?: string
}) {
  return (
    <label className={`flex flex-col gap-1 ${className}`}>
      <span className="text-xs font-medium text-gray-600">{label}</span>
      {children}
    </label>
  )
}

export function Card({
  children,
  className = '',
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div
      className={`rounded-xl border border-gray-200 bg-white p-4 shadow-sm ${className}`}
    >
      {children}
    </div>
  )
}

export function EmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-lg border border-dashed border-gray-300 p-8 text-center text-sm text-gray-400">
      {message}
    </div>
  )
}
