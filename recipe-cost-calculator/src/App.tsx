import { useState } from 'react'
import { StoreProvider } from './store/StoreProvider'
import { IngredientsPage } from './pages/IngredientsPage'
import { RecipesPage } from './pages/RecipesPage'
import { DashboardPage } from './pages/DashboardPage'

type Tab = 'ingredients' | 'recipes' | 'dashboard'

const TABS: { key: Tab; label: string }[] = [
  { key: 'ingredients', label: '재료' },
  { key: 'recipes', label: '레시피' },
  { key: 'dashboard', label: '대시보드' },
]

export default function App() {
  const [tab, setTab] = useState<Tab>('ingredients')

  return (
    <StoreProvider>
      <div className="flex min-h-full flex-col bg-gray-50 text-gray-900">
        <header className="border-b border-gray-200 bg-white">
          <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
            <h1 className="flex items-center gap-2 text-lg font-bold text-gray-900">
              🧮 레시피 원가계산기
            </h1>
            <nav className="hidden gap-1 sm:flex">
              {TABS.map((t) => (
                <TabButton
                  key={t.key}
                  active={tab === t.key}
                  label={t.label}
                  onClick={() => setTab(t.key)}
                />
              ))}
            </nav>
          </div>
        </header>

        <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6">
          {tab === 'ingredients' && <IngredientsPage />}
          {tab === 'recipes' && <RecipesPage />}
          {tab === 'dashboard' && <DashboardPage />}
        </main>

        {/* 모바일 하단 탭바 */}
        <nav className="sticky bottom-0 flex border-t border-gray-200 bg-white sm:hidden">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex-1 py-3 text-sm font-medium ${
                tab === t.key ? 'text-violet-600' : 'text-gray-500'
              }`}
            >
              {t.label}
            </button>
          ))}
        </nav>
      </div>
    </StoreProvider>
  )
}

function TabButton({
  active,
  label,
  onClick,
}: {
  active: boolean
  label: string
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
        active ? 'bg-violet-600 text-white' : 'text-gray-600 hover:bg-gray-100'
      }`}
    >
      {label}
    </button>
  )
}
