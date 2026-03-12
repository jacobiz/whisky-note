import { render, screen } from '@testing-library/vue'
import { describe, it, expect } from 'vitest'
import { createI18n } from 'vue-i18n'
import { createRouter, createMemoryHistory } from 'vue-router'
import { createTestingPinia } from '@pinia/testing'
import PrivacyPolicyView from '@/views/PrivacyPolicyView.vue'
import ja from '@/i18n/locales/ja.json'

const i18n = createI18n({ legacy: false, locale: 'ja', messages: { ja } })
const router = createRouter({
  history: createMemoryHistory(),
  routes: [{ path: '/privacy-policy', name: 'privacy-policy', component: PrivacyPolicyView }],
})

const renderView = () =>
  render(PrivacyPolicyView, { global: { plugins: [createTestingPinia(), i18n, router] } })

describe('PrivacyPolicyView', () => {
  it('プライバシーポリシーの見出しが表示される', () => {
    renderView()
    expect(screen.getAllByText(/プライバシーポリシー/).length).toBeGreaterThan(0)
  })

  it('ローカル保存のみ・外部送信なしの説明テキストが存在する', () => {
    renderView()
    expect(screen.getAllByText(/外部|送信|ローカル/).length).toBeGreaterThan(0)
  })
})
