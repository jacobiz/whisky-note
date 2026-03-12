import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/vue'
import { setActivePinia, createPinia } from 'pinia'
import { createI18n } from 'vue-i18n'
import ja from '@/i18n/locales/ja.json'
import en from '@/i18n/locales/en.json'
import SearchSortBar from '@/components/SearchSortBar.vue'
import { useSearchSortStore } from '@/stores/searchSort'

const i18n = createI18n({ legacy: false, locale: 'ja', messages: { ja, en } })

describe('SearchSortBar', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  // --- 検索バー ---

  it('検索バーが表示される', () => {
    render(SearchSortBar, { global: { plugins: [i18n] } })
    expect(screen.getByPlaceholderText('銘柄名・蒸留所で検索')).toBeInTheDocument()
  })

  it('検索バーに入力するとストアの query が更新される', async () => {
    render(SearchSortBar, { global: { plugins: [i18n] } })
    const store = useSearchSortStore()
    const input = screen.getByPlaceholderText('銘柄名・蒸留所で検索')
    await fireEvent.update(input, '山崎')
    expect(store.query).toBe('山崎')
  })

  it('query が空のとき×ボタンは表示されない', () => {
    render(SearchSortBar, { global: { plugins: [i18n] } })
    const store = useSearchSortStore()
    store.query = ''
    expect(screen.queryByLabelText('検索をクリア')).toBeNull()
  })

  it('query に値があるとき×ボタンが表示される', async () => {
    render(SearchSortBar, { global: { plugins: [i18n] } })
    const store = useSearchSortStore()
    store.query = '山崎'
    // 再レンダリングを待つ
    await new Promise(r => setTimeout(r, 10))
    expect(screen.getByLabelText('検索をクリア')).toBeInTheDocument()
  })

  it('×ボタンをクリックするとストアの query が空になる', async () => {
    render(SearchSortBar, { global: { plugins: [i18n] } })
    const store = useSearchSortStore()
    store.query = '山崎'
    await new Promise(r => setTimeout(r, 10))
    await fireEvent.click(screen.getByLabelText('検索をクリア'))
    expect(store.query).toBe('')
  })

  // --- ソートセレクター ---

  it('ソートセレクターが表示される', () => {
    render(SearchSortBar, { global: { plugins: [i18n] } })
    expect(screen.getByLabelText('並び順')).toBeInTheDocument()
  })

  it('ソートセレクターに4つのオプションがある', () => {
    render(SearchSortBar, { global: { plugins: [i18n] } })
    const select = screen.getByLabelText('並び順') as HTMLSelectElement
    expect(select.options.length).toBe(4)
  })

  it('デフォルトのソートは新しい順（date-desc）である', () => {
    render(SearchSortBar, { global: { plugins: [i18n] } })
    const store = useSearchSortStore()
    expect(store.sortOption).toBe('date-desc')
  })

  it('ソートセレクターを変更するとストアの sortOption が更新される', async () => {
    render(SearchSortBar, { global: { plugins: [i18n] } })
    const store = useSearchSortStore()
    const select = screen.getByLabelText('並び順')
    await fireEvent.update(select, 'rating-desc')
    expect(store.sortOption).toBe('rating-desc')
  })
})
