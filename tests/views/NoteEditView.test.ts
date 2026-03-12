import { render, screen, fireEvent } from '@testing-library/vue'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createTestingPinia } from '@pinia/testing'
import { createI18n } from 'vue-i18n'
import { createRouter, createMemoryHistory } from 'vue-router'
import NoteEditView from '@/views/NoteEditView.vue'
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
    { path: '/notes/:id', name: 'note-detail', component: { template: '<div/>' } },
    { path: '/notes/:id/edit', name: 'note-edit', component: NoteEditView },
  ],
})

const noteWithImage: TastingNote = {
  id: 'test-id',
  brandName: '山崎12年',
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-01-01'),
  imageId: 'img-1',
}

const App = { template: '<router-view />' }

const renderEditView = (note: TastingNote = noteWithImage) => {
  const pinia = createTestingPinia({ createSpy: vi.fn })
  const wrapper = render(App, {
    global: { plugins: [pinia, i18n, router] },
  })
  const store = useNotesStore()
  ;(store.notes as TastingNote[]) = [note]
  return wrapper
}

describe('NoteEditView', () => {
  beforeEach(async () => {
    await router.push('/notes/test-id/edit')
    await router.isReady()
  })

  it('imageId がある場合、編集画面でボトル画像のプレビューが表示される', async () => {
    const { container } = renderEditView()
    await new Promise(r => setTimeout(r, 100))
    const img = container.querySelector('img')
    expect(img).not.toBeNull()
    expect(img?.getAttribute('src')).toBe('blob:mock-url')
  })

  it('AppHeader が表示される', async () => {
    renderEditView()
    await new Promise(r => setTimeout(r, 50))
    const backBtn = screen.getByLabelText(/戻る|back/i)
    expect(backBtn).toBeInTheDocument()
  })

  it('フォーム変更後にルート離脱したとき window.confirm が呼ばれる', async () => {
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false)
    const noteNoImage: TastingNote = { ...noteWithImage, imageId: undefined }
    renderEditView(noteNoImage)
    await new Promise(r => setTimeout(r, 50))

    // フォームに入力して変更済み状態にする
    const brandInput = screen.getByLabelText(/銘柄名/)
    await fireEvent.update(brandInput, '山崎18年')

    // 別ルートへ遷移を試みる
    await router.push('/')
    expect(confirmSpy).toHaveBeenCalled()
    confirmSpy.mockRestore()
  })
})
