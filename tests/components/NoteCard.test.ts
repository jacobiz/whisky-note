import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/vue'
import { createTestingPinia } from '@pinia/testing'
import NoteCard from '@/components/NoteCard.vue'
import type { TastingNote } from '@/db/types'

// IndexedDB アクセスをモック
vi.mock('@/db', () => ({
  db: {
    bottleImages: {
      get: vi.fn().mockResolvedValue(null),
    },
  },
}))

const mockNote = (overrides: Partial<TastingNote> = {}): TastingNote => ({
  id: 'test-id',
  brandName: 'テスト銘柄',
  createdAt: new Date('2026-03-12'),
  updatedAt: new Date('2026-03-12'),
  ...overrides,
})

describe('NoteCard', () => {
  it('1. rating が設定されているとき、評価数値が表示されること', async () => {
    render(NoteCard, {
      props: { note: mockNote({ rating: 92 }) },
      global: { plugins: [createTestingPinia()] },
    })
    expect(screen.getByText('92')).toBeInTheDocument()
  })

  it('2. rating が undefined のとき、評価エリアが表示されないこと', async () => {
    render(NoteCard, {
      props: { note: mockNote({ rating: undefined }) },
      global: { plugins: [createTestingPinia()] },
    })
    // 評価数値が表示されないこと
    expect(screen.queryByText(/^\d+$/)).toBeNull()
  })

  it('3. appearance が空で nose に値があるとき、nose のテキストがプレビューに表示されること', async () => {
    render(NoteCard, {
      props: {
        note: mockNote({
          appearance: '',
          nose: '蜂蜜とバニラの香り',
        }),
      },
      global: { plugins: [createTestingPinia()] },
    })
    expect(screen.getByText('蜂蜜とバニラの香り')).toBeInTheDocument()
  })

  it('4. すべてのコメントフィールドが未入力のとき、エラーにならないこと', async () => {
    expect(() => {
      render(NoteCard, {
        props: {
          note: mockNote({
            appearance: '',
            nose: '',
            palate: '',
            finish: '',
            notes: '',
          }),
        },
        global: { plugins: [createTestingPinia()] },
      })
    }).not.toThrow()
  })

  it('5. createdAt が 2026-03-12 のとき、2026/03/12 形式で表示されること', async () => {
    render(NoteCard, {
      props: { note: mockNote({ createdAt: new Date('2026-03-12') }) },
      global: { plugins: [createTestingPinia()] },
    })
    expect(screen.getByText('2026/03/12')).toBeInTheDocument()
  })

  it('6. 銘柄名が表示されること', async () => {
    render(NoteCard, {
      props: { note: mockNote({ brandName: '山崎12年' }) },
      global: { plugins: [createTestingPinia()] },
    })
    expect(screen.getByText('山崎12年')).toBeInTheDocument()
  })

  it('7. 長いプレビューテキストのコンテナに line-clamp-2 クラスが適用されていること', async () => {
    const { container } = render(NoteCard, {
      props: {
        note: mockNote({
          appearance: 'あ'.repeat(200),
        }),
      },
      global: { plugins: [createTestingPinia()] },
    })
    const clampEl = container.querySelector('.line-clamp-2')
    expect(clampEl).not.toBeNull()
  })

  it('8. NoteCard をクリックしたとき、click イベントが emit されること', async () => {
    const { emitted } = render(NoteCard, {
      props: { note: mockNote({ id: 'note-123' }) },
      global: { plugins: [createTestingPinia()] },
    })
    const card = screen.getByRole('article')
    await fireEvent.click(card)
    expect(emitted('click')).toBeTruthy()
    expect(emitted('click')![0]).toEqual(['note-123'])
  })
})
