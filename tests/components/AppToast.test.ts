import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/vue'
import { createI18n } from 'vue-i18n'
import ja from '@/i18n/locales/ja.json'
import en from '@/i18n/locales/en.json'
import AppToast from '@/components/AppToast.vue'

const i18n = createI18n({ legacy: false, locale: 'ja', messages: { ja, en } })

describe('AppToast', () => {
  it('メッセージが表示される', () => {
    render(AppToast, {
      props: { message: 'テストメッセージ' },
      global: { plugins: [i18n] },
    })
    expect(screen.getByText('テストメッセージ')).toBeInTheDocument()
  })

  it('アクションボタンクリックで action が emit される', async () => {
    const { emitted } = render(AppToast, {
      props: { message: 'テスト', actionLabel: '更新' },
      global: { plugins: [i18n] },
    })
    await fireEvent.click(screen.getByText('更新'))
    expect(emitted().action).toBeTruthy()
  })

  it('× ボタンクリックで close が emit される', async () => {
    const { emitted } = render(AppToast, {
      props: { message: 'テスト', actionLabel: '更新' },
      global: { plugins: [i18n] },
    })
    await fireEvent.click(screen.getByLabelText('閉じる'))
    expect(emitted().close).toBeTruthy()
  })

  it('actionLabel 未指定時にアクションボタンが表示されない', () => {
    render(AppToast, {
      props: { message: 'テスト' },
      global: { plugins: [i18n] },
    })
    expect(screen.queryByRole('button', { name: /更新/i })).toBeNull()
  })
})
