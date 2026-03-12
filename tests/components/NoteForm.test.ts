import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/vue'
import { createTestingPinia } from '@pinia/testing'
import { createI18n } from 'vue-i18n'
import ja from '@/i18n/locales/ja.json'
import NoteForm from '@/components/NoteForm.vue'

const i18n = createI18n({ legacy: false, locale: 'ja', messages: { ja } })

const renderForm = (props = {}) =>
  render(NoteForm, {
    props,
    global: {
      plugins: [createTestingPinia(), i18n],
    },
  })

describe('NoteForm', () => {
  it('銘柄名フィールドが表示される', () => {
    renderForm()
    expect(screen.getByLabelText(/銘柄名/)).toBeInTheDocument()
  })

  it('銘柄名が空のまま保存しようとするとエラーメッセージを表示する', async () => {
    renderForm()
    const saveBtn = screen.getByRole('button', { name: /保存/ })
    await fireEvent.click(saveBtn)
    expect(screen.getByText(/銘柄名は必須/)).toBeInTheDocument()
  })

  it('1,000文字を超える入力に文字数超過メッセージを表示する', async () => {
    renderForm()
    const noseField = screen.getByLabelText(/香り/)
    await fireEvent.input(noseField, { target: { value: 'a'.repeat(1001) } })
    // 1001 / 1000 という形式のカウンターが表示される
    expect(screen.getByText('1001 / 1000')).toBeInTheDocument()
  })

  it('文字数カウンターが表示される', () => {
    renderForm()
    // 各テキストエリアに文字数カウンターが存在する
    expect(screen.getAllByText(/0 \/ 1000/).length).toBeGreaterThan(0)
  })
})
