import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/vue'
import { createTestingPinia } from '@pinia/testing'
import { createI18n } from 'vue-i18n'
import ja from '@/i18n/locales/ja.json'
import NoteList from '@/components/NoteList.vue'
import type { TastingNote } from '@/db/types'

const i18n = createI18n({ legacy: false, locale: 'ja', messages: { ja } })

const mockNote = (overrides: Partial<TastingNote> = {}): TastingNote => ({
  id: 'test-id',
  brandName: 'テスト銘柄',
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-01-01'),
  ...overrides,
})

describe('NoteList', () => {
  it('ノートが空のときは空状態メッセージを表示する', () => {
    render(NoteList, {
      props: { notes: [] },
      global: { plugins: [createTestingPinia(), i18n] },
    })
    expect(screen.getByText(/テイスティングノートがまだありません/)).toBeInTheDocument()
  })

  it('ノートが存在するときは銘柄名を表示する', () => {
    render(NoteList, {
      props: { notes: [mockNote({ brandName: '山崎12年' })] },
      global: { plugins: [createTestingPinia(), i18n] },
    })
    expect(screen.getByText('山崎12年')).toBeInTheDocument()
  })

  it('複数ノートをすべて表示する', () => {
    const notes = [
      mockNote({ id: '1', brandName: '山崎12年' }),
      mockNote({ id: '2', brandName: '白州18年' }),
    ]
    render(NoteList, {
      props: { notes },
      global: { plugins: [createTestingPinia(), i18n] },
    })
    expect(screen.getByText('山崎12年')).toBeInTheDocument()
    expect(screen.getByText('白州18年')).toBeInTheDocument()
  })

  it('ノートが存在するとき、grid-cols-2 クラスを持つ要素が存在しないこと（1列レイアウト確認）', () => {
    const { container } = render(NoteList, {
      props: { notes: [mockNote()] },
      global: { plugins: [createTestingPinia(), i18n] },
    })
    expect(container.querySelector('.grid-cols-2')).toBeNull()
  })
})
