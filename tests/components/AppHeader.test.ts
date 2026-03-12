import { render, screen, fireEvent } from '@testing-library/vue'
import { describe, it, expect, vi } from 'vitest'
import { createTestingPinia } from '@pinia/testing'
import { createI18n } from 'vue-i18n'
import { createRouter, createMemoryHistory } from 'vue-router'
import AppHeader from '@/components/AppHeader.vue'
import ja from '@/i18n/locales/ja.json'

const i18n = createI18n({ legacy: false, locale: 'ja', messages: { ja } })
const router = createRouter({ history: createMemoryHistory(), routes: [{ path: '/', name: 'home', component: { template: '<div/>' } }] })

const renderAppHeader = (props = {}) =>
  render(AppHeader, {
    props: { title: 'テストタイトル', ...props },
    global: { plugins: [createTestingPinia(), i18n, router] },
  })

describe('AppHeader', () => {
  it('showBack=true のとき「戻る」ボタンが表示される', () => {
    renderAppHeader({ showBack: true })
    expect(screen.getByLabelText('戻る')).toBeInTheDocument()
  })

  it('showBack=false のとき「戻る」ボタンが表示されない', () => {
    renderAppHeader({ showBack: false })
    expect(screen.queryByLabelText('戻る')).not.toBeInTheDocument()
  })

  it('showHome=true のときホームアイコンボタンが表示される', () => {
    renderAppHeader({ showHome: true })
    expect(screen.getByLabelText('ホーム')).toBeInTheDocument()
  })

  it('showHome=false のときホームアイコンが表示されない', () => {
    renderAppHeader({ showHome: false })
    expect(screen.queryByLabelText('ホーム')).not.toBeInTheDocument()
  })

  it('onBack prop が渡されたとき戻るボタン押下で onBack が呼ばれる', async () => {
    const onBack = vi.fn()
    renderAppHeader({ showBack: true, onBack })
    await fireEvent.click(screen.getByLabelText('戻る'))
    expect(onBack).toHaveBeenCalledOnce()
  })

  it('onHome prop が渡されたときホームアイコン押下で onHome が呼ばれる', async () => {
    const onHome = vi.fn()
    renderAppHeader({ showHome: true, onHome })
    await fireEvent.click(screen.getByLabelText('ホーム'))
    expect(onHome).toHaveBeenCalledOnce()
  })

  it('タイトルが表示される', () => {
    renderAppHeader({ title: 'マイタイトル' })
    expect(screen.getByText('マイタイトル')).toBeInTheDocument()
  })
})
