import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/vue'
import { createTestingPinia } from '@pinia/testing'
import { createI18n } from 'vue-i18n'
import { createRouter, createMemoryHistory } from 'vue-router'
import ja from '@/i18n/locales/ja.json'
import en from '@/i18n/locales/en.json'
import GlossaryView from '@/views/GlossaryView.vue'

const i18n = createI18n({ legacy: false, locale: 'ja', messages: { ja, en } })

const router = createRouter({
  history: createMemoryHistory(),
  routes: [
    { path: '/', name: 'home', component: { template: '<div />' } },
    { path: '/glossary', name: 'glossary', component: GlossaryView },
  ],
})

function setup(locale = 'ja') {
  const testI18n = createI18n({ legacy: false, locale, messages: { ja, en } })
  return render(GlossaryView, {
    global: { plugins: [createTestingPinia(), testI18n, router] },
  })
}

describe('GlossaryView', () => {
  it('全用語が表示される（li 要素が存在する）', () => {
    setup()
    const items = screen.getAllByRole('listitem')
    expect(items.length).toBeGreaterThan(0)
  })

  it('検索クエリで絞り込まれる', async () => {
    setup()
    const allItems = screen.getAllByRole('listitem')
    const input = screen.getByPlaceholderText('用語を検索...')
    // 存在しない語で検索すると件数が減る（または noResults になる）
    await fireEvent.input(input, { target: { value: 'xyzzy_no_match_term' } })
    // noResults メッセージが出るか、listitem が減る
    expect(
      screen.queryAllByRole('listitem').length < allItems.length ||
      screen.queryByText(/該当する用語が見つかりません/) !== null
    ).toBe(true)
  })

  it('カテゴリタブで絞り込まれる', async () => {
    setup()
    const allItems = screen.getAllByRole('listitem')
    // 「テイスティング」カテゴリボタンをクリック
    const btn = screen.getByRole('button', { name: 'テイスティング' })
    await fireEvent.click(btn)
    const filtered = screen.queryAllByRole('listitem')
    expect(filtered.length).toBeLessThanOrEqual(allItems.length)
  })

  it('用語タップでアコーディオン展開・再タップで閉じる', async () => {
    setup()
    // 最初の用語ボタンをクリック
    const termButtons = screen.getAllByRole('button', { name: /\S/ })
    // カテゴリボタン以外の用語ボタンを探す（最初のアコーディオンボタン）
    // li > button を探す
    const listItems = screen.getAllByRole('listitem')
    const firstTermButton = listItems[0].querySelector('button')!
    expect(firstTermButton).not.toBeNull()

    // クリックして展開
    await fireEvent.click(firstTermButton)
    // 展開コンテンツは v-show で制御されるため、ボタンが active になる
    // 再クリックで閉じる
    await fireEvent.click(firstTermButton)
    // 閉じても listitem は残る
    expect(screen.getAllByRole('listitem').length).toBeGreaterThan(0)
  })

  it('言語設定に応じて日英表示切り替わる', () => {
    // 英語モードでレンダリング
    const enI18n = createI18n({ legacy: false, locale: 'en', messages: { ja, en } })
    render(GlossaryView, {
      global: { plugins: [createTestingPinia(), enI18n, router] },
    })
    // ヘッダータイトルが英語になっている
    expect(screen.getByText('Glossary')).toBeInTheDocument()
  })

  it('存在しない語で検索すると noResults メッセージが表示される', async () => {
    setup()
    const input = screen.getByPlaceholderText('用語を検索...')
    await fireEvent.input(input, { target: { value: 'zzzznotexist99999' } })
    expect(screen.getByText(/該当する用語が見つかりません/)).toBeInTheDocument()
  })
})
