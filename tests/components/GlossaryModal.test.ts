import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/vue'
import { createTestingPinia } from '@pinia/testing'
import { createI18n } from 'vue-i18n'
import ja from '@/i18n/locales/ja.json'
import en from '@/i18n/locales/en.json'
import GlossaryModal from '@/components/GlossaryModal.vue'

const i18n = createI18n({ legacy: false, locale: 'ja', messages: { ja, en } })

describe('GlossaryModal', () => {
  const renderModal = (props = {}) =>
    render(GlossaryModal, {
      props: { visible: true, ...props },
      global: { plugins: [createTestingPinia(), i18n] },
    })

  it('visible=true のとき表示される', () => {
    renderModal({ visible: true })
    expect(screen.getByText('用語辞典')).toBeInTheDocument()
  })

  it('visible=false のとき非表示', () => {
    renderModal({ visible: false })
    expect(screen.queryByText('用語辞典')).toBeNull()
  })

  it('「閉じる」ボタンクリックで close が emit される', async () => {
    const { emitted } = renderModal()
    await fireEvent.click(screen.getByLabelText('閉じる'))
    expect(emitted().close).toBeTruthy()
  })

  it('検索ボックスが表示され、入力できる', async () => {
    renderModal()
    const input = screen.getByPlaceholderText('用語を検索...')
    expect(input).toBeInTheDocument()
    await fireEvent.input(input, { target: { value: 'peaty' } })
  })
})
