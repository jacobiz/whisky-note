import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/vue'
import { setActivePinia, createPinia } from 'pinia'
import { createTestingPinia } from '@pinia/testing'
import { createI18n } from 'vue-i18n'
import { createRouter, createWebHistory } from 'vue-router'
import ja from '@/i18n/locales/ja.json'
import en from '@/i18n/locales/en.json'
import HomeView from '@/views/HomeView.vue'
import { useNotesStore } from '@/stores/notes'
import { useSearchSortStore } from '@/stores/searchSort'
import type { TastingNote } from '@/db/types'

const i18n = createI18n({ legacy: false, locale: 'ja', messages: { ja, en } })

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'home', component: HomeView },
    { path: '/note/:id', name: 'note-detail', component: { template: '<div />' } },
    { path: '/note/create', name: 'note-create', component: { template: '<div />' } },
    { path: '/settings', name: 'settings', component: { template: '<div />' } },
    { path: '/glossary', name: 'glossary', component: { template: '<div />' } },
  ],
})

const mockNote = (overrides: Partial<TastingNote> = {}): TastingNote => ({
  id: crypto.randomUUID(),
  brandName: 'テスト',
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-01-01'),
  ...overrides,
})

/** 各テストでストアを初期化し、HomeView をレンダリングして store を返す */
function setup(initialNotes: TastingNote[] = []) {
  // actions をスタブ化（loadNotes が DB を呼ばないように）
  const pinia = createTestingPinia({ stubActions: true })
  setActivePinia(pinia)

  const notesStore = useNotesStore()
  const searchStore = useSearchSortStore()
  notesStore.notes = initialNotes

  render(HomeView, {
    global: { plugins: [pinia, i18n, router] },
  })

  return { notesStore, searchStore }
}

describe('HomeView — 検索フィルタリング', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('query が空のとき全ノートを表示する', async () => {
    const { notesStore } = setup([
      mockNote({ brandName: '山崎12年' }),
      mockNote({ brandName: '白州18年' }),
    ])
    await new Promise(r => setTimeout(r, 10))
    expect(screen.getByText('山崎12年')).toBeInTheDocument()
    expect(screen.getByText('白州18年')).toBeInTheDocument()
  })

  it('brandName の部分一致でフィルタリングされる', async () => {
    const { searchStore } = setup([
      mockNote({ brandName: '山崎12年' }),
      mockNote({ brandName: '白州18年' }),
    ])
    searchStore.query = '山崎'
    await new Promise(r => setTimeout(r, 10))
    expect(screen.getByText('山崎12年')).toBeInTheDocument()
    expect(screen.queryByText('白州18年')).toBeNull()
  })

  it('distillery の部分一致でフィルタリングされる', async () => {
    const { searchStore } = setup([
      mockNote({ brandName: 'A', distillery: 'サントリー山崎蒸溜所' }),
      mockNote({ brandName: 'B', distillery: 'ニッカ余市蒸溜所' }),
    ])
    searchStore.query = '山崎'
    await new Promise(r => setTimeout(r, 10))
    expect(screen.getByText('A')).toBeInTheDocument()
    expect(screen.queryByText('B')).toBeNull()
  })

  it('大文字・小文字を区別しないで検索できる', async () => {
    const { searchStore } = setup([mockNote({ brandName: 'Yamazaki 18' })])
    searchStore.query = 'yamazaki'
    await new Promise(r => setTimeout(r, 10))
    expect(screen.getByText('Yamazaki 18')).toBeInTheDocument()
  })

  it('query をクリアすると全ノートが再表示される', async () => {
    const { searchStore } = setup([
      mockNote({ brandName: '山崎12年' }),
      mockNote({ brandName: '白州18年' }),
    ])
    searchStore.query = '山崎'
    await new Promise(r => setTimeout(r, 10))
    searchStore.query = ''
    await new Promise(r => setTimeout(r, 10))
    expect(screen.getByText('山崎12年')).toBeInTheDocument()
    expect(screen.getByText('白州18年')).toBeInTheDocument()
  })

  it('検索結果が0件のとき「該当なし」メッセージを表示する', async () => {
    const { searchStore } = setup([mockNote({ brandName: '山崎12年' })])
    searchStore.query = '羽生'
    await new Promise(r => setTimeout(r, 10))
    expect(screen.getByText(/該当するノートが見つかりません/)).toBeInTheDocument()
  })
})

describe('HomeView — ソート', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('date-desc: 新しい日付のノートが先頭に来る', async () => {
    const { searchStore } = setup([
      mockNote({ id: '1', brandName: '古いノート', createdAt: new Date('2024-01-01') }),
      mockNote({ id: '2', brandName: '新しいノート', createdAt: new Date('2025-01-01') }),
    ])
    searchStore.sortOption = 'date-desc'
    await new Promise(r => setTimeout(r, 10))
    const items = screen.getAllByText(/古いノート|新しいノート/)
    expect(items[0].textContent).toContain('新しいノート')
  })

  it('date-asc: 古い日付のノートが先頭に来る', async () => {
    const { searchStore } = setup([
      mockNote({ id: '1', brandName: '古いノート', createdAt: new Date('2024-01-01') }),
      mockNote({ id: '2', brandName: '新しいノート', createdAt: new Date('2025-01-01') }),
    ])
    searchStore.sortOption = 'date-asc'
    await new Promise(r => setTimeout(r, 10))
    const items = screen.getAllByText(/古いノート|新しいノート/)
    expect(items[0].textContent).toContain('古いノート')
  })

  it('rating-desc: 評価の高いノートが先頭、未設定は末尾', async () => {
    const { searchStore } = setup([
      mockNote({ id: '1', brandName: '低評価ノート', rating: 70 }),
      mockNote({ id: '2', brandName: '未評価ノート', rating: undefined }),
      mockNote({ id: '3', brandName: '高評価ノート', rating: 95 }),
    ])
    searchStore.sortOption = 'rating-desc'
    await new Promise(r => setTimeout(r, 10))
    const cards = screen.getAllByText(/高評価ノート|低評価ノート|未評価ノート/)
    expect(cards[0].textContent).toContain('高評価ノート')
    expect(cards[cards.length - 1].textContent).toContain('未評価ノート')
  })

  it('name-asc: 銘柄名の A-Z 順で並ぶ', async () => {
    const { searchStore } = setup([
      mockNote({ id: '1', brandName: 'Zymurgy' }),
      mockNote({ id: '2', brandName: 'Apple' }),
    ])
    searchStore.sortOption = 'name-asc'
    await new Promise(r => setTimeout(r, 10))
    const cards = screen.getAllByText(/Apple|Zymurgy/)
    expect(cards[0].textContent).toContain('Apple')
  })

  it('検索フィルタとソートを同時に適用できる', async () => {
    const { searchStore } = setup([
      mockNote({ id: '1', brandName: '山崎12年', rating: 80 }),
      mockNote({ id: '2', brandName: '山崎18年', rating: 95 }),
      mockNote({ id: '3', brandName: '白州12年', rating: 85 }),
    ])
    searchStore.query = '山崎'
    searchStore.sortOption = 'rating-desc'
    await new Promise(r => setTimeout(r, 10))
    expect(screen.queryByText('白州12年')).toBeNull()
    const cards = screen.getAllByText(/山崎\d+年/)
    expect(cards[0].textContent).toContain('山崎18年')
  })
})

describe('HomeView — 辞典ボタン', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('辞典ボタンが表示される', () => {
    setup()
    expect(screen.getByLabelText('用語辞典')).toBeInTheDocument()
  })

  it('辞典ボタンクリックで /glossary に遷移する', async () => {
    setup()
    await router.push('/')
    await fireEvent.click(screen.getByLabelText('用語辞典'))
    await new Promise(r => setTimeout(r, 10))
    expect(router.currentRoute.value.name).toBe('glossary')
  })
})
