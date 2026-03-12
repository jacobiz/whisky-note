import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/vue'
import { createI18n } from 'vue-i18n'
import ja from '@/i18n/locales/ja.json'
import en from '@/i18n/locales/en.json'
import ImportConfirmDialog from '@/components/ImportConfirmDialog.vue'

const i18n = createI18n({ legacy: false, locale: 'ja', messages: { ja, en } })

describe('ImportConfirmDialog', () => {
  it('visible=false のときダイアログが表示されない', () => {
    const { container } = render(ImportConfirmDialog, {
      props: { visible: false, totalCount: 3, skippedCount: 0 },
      global: { plugins: [i18n] },
    })
    expect(container.querySelector('[role="dialog"]')).toBeNull()
  })

  it('visible=true のときダイアログが表示される', () => {
    render(ImportConfirmDialog, {
      props: { visible: true, totalCount: 3, skippedCount: 0 },
      global: { plugins: [i18n] },
    })
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })

  it('totalCount と skippedCount がメッセージに表示される', () => {
    render(ImportConfirmDialog, {
      props: { visible: true, totalCount: 5, skippedCount: 2 },
      global: { plugins: [i18n] },
    })
    // i18n: "{total}件のノートを追加します（{skipped}件は既に存在するためスキップ）。続行しますか？"
    expect(screen.getByText(/5件のノートを追加します/)).toBeInTheDocument()
    expect(screen.getByText(/2件は既に存在するためスキップ/)).toBeInTheDocument()
  })

  it('確認ボタンクリックで confirm イベントが発火する', async () => {
    const { emitted } = render(ImportConfirmDialog, {
      props: { visible: true, totalCount: 3, skippedCount: 0 },
      global: { plugins: [i18n] },
    })
    await fireEvent.click(screen.getByText('追加する'))
    expect(emitted().confirm).toBeTruthy()
  })

  it('キャンセルボタンクリックで cancel イベントが発火する', async () => {
    const { emitted } = render(ImportConfirmDialog, {
      props: { visible: true, totalCount: 3, skippedCount: 0 },
      global: { plugins: [i18n] },
    })
    await fireEvent.click(screen.getByText('キャンセル'))
    expect(emitted().cancel).toBeTruthy()
  })
})
