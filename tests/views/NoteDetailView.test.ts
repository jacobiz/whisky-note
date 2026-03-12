import { render, screen, fireEvent } from '@testing-library/vue'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createTestingPinia } from '@pinia/testing'
import { createI18n } from 'vue-i18n'
import { createRouter, createMemoryHistory } from 'vue-router'
import NoteDetailView from '@/views/NoteDetailView.vue'
import { useNotesStore } from '@/stores/notes'
import ja from '@/i18n/locales/ja.json'
import type { TastingNote } from '@/db/types'

// DB モック: imageId があるとき Blob を返す
vi.mock('@/db', () => ({
  db: {
    bottleImages: {
      get: vi.fn().mockResolvedValue({ blob: new Blob(['dummy'], { type: 'image/jpeg' }) }),
    },
  },
}))

// URL.createObjectURL モック
vi.stubGlobal('URL', {
  createObjectURL: vi.fn().mockReturnValue('blob:mock-url'),
  revokeObjectURL: vi.fn(),
})

const i18n = createI18n({ legacy: false, locale: 'ja', messages: { ja } })

const router = createRouter({
  history: createMemoryHistory(),
  routes: [
    { path: '/', name: 'home', component: { template: '<div/>' } },
    { path: '/notes/:id', name: 'note-detail', component: NoteDetailView },
    { path: '/notes/:id/edit', name: 'note-edit', component: { template: '<div/>' } },
  ],
})

const fullNote: TastingNote = {
  id: 'test-id',
  brandName: '山崎12年',
  distillery: 'サントリー山崎蒸溜所',
  vintage: '2010',
  appearance: '琥珀色、粘度高め',
  nose: 'バニラ、ハチミツ',
  palate: 'リッチで甘い',
  finish: '長く続く余韻',
  rating: 90,
  notes: '素晴らしい一本',
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-01-01'),
}

const renderView = (note: TastingNote = fullNote) => {
  const pinia = createTestingPinia({ createSpy: vi.fn })
  const wrapper = render(NoteDetailView, {
    global: {
      plugins: [pinia, i18n, router],
    },
  })
  const store = useNotesStore()
  ;(store.notes as TastingNote[]) = [note]
  return wrapper
}

describe('NoteDetailView', () => {
  beforeEach(async () => {
    await router.push('/notes/test-id')
    await router.isReady()
  })

  it('全フィールド入力済みのとき appearance/nose/palate/finish/notes/rating/distillery/vintage が表示される', async () => {
    renderView()
    // テキストは非同期で表示されるため少し待つ
    await new Promise(r => setTimeout(r, 50))
    expect(screen.getByText('琥珀色、粘度高め')).toBeInTheDocument()
    expect(screen.getByText('バニラ、ハチミツ')).toBeInTheDocument()
    expect(screen.getByText('リッチで甘い')).toBeInTheDocument()
    expect(screen.getByText('長く続く余韻')).toBeInTheDocument()
    expect(screen.getByText('素晴らしい一本')).toBeInTheDocument()
    expect(screen.getByText('90')).toBeInTheDocument()
    expect(screen.getByText('サントリー山崎蒸溜所')).toBeInTheDocument()
    expect(screen.getByText('2010')).toBeInTheDocument()
  })

  it('未入力フィールドは表示されない', async () => {
    const noteWithout: TastingNote = { ...fullNote, appearance: undefined, nose: undefined }
    renderView(noteWithout)
    await new Promise(r => setTimeout(r, 50))
    expect(screen.queryByText('琥珀色、粘度高め')).not.toBeInTheDocument()
    expect(screen.queryByText('バニラ、ハチミツ')).not.toBeInTheDocument()
    // 他のフィールドは表示される
    expect(screen.getByText('リッチで甘い')).toBeInTheDocument()
  })

  it('画像エリアに aspect-[2/3] クラスが適用されている', async () => {
    const { container } = renderView({ ...fullNote, imageId: 'img-1' })
    await new Promise(r => setTimeout(r, 100))
    const aspectEl = container.querySelector('.aspect-\\[2\\/3\\]')
    expect(aspectEl).not.toBeNull()
  })

  it('ホームアイコンをクリックすると home ルートへ遷移する', async () => {
    renderView()
    await new Promise(r => setTimeout(r, 50))
    const homeBtn = screen.getByLabelText(/ホーム|home/i)
    await fireEvent.click(homeBtn)
    await new Promise(r => setTimeout(r, 50))
    expect(router.currentRoute.value.name).toBe('home')
  })
})
