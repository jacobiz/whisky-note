import { render, screen } from '@testing-library/vue'
import { describe, it, expect, vi } from 'vitest'
import { createTestingPinia } from '@pinia/testing'
import { createI18n } from 'vue-i18n'
import { createRouter, createMemoryHistory } from 'vue-router'
import SettingsView from '@/views/SettingsView.vue'
import ja from '@/i18n/locales/ja.json'

const i18n = createI18n({ legacy: false, locale: 'ja', messages: { ja } })
const router = createRouter({
  history: createMemoryHistory(),
  routes: [
    { path: '/settings', name: 'settings', component: SettingsView },
    { path: '/privacy-policy', name: 'privacy-policy', component: { template: '<div/>' } },
    { path: '/licenses', name: 'licenses', component: { template: '<div/>' } },
  ],
})

const renderView = () =>
  render(SettingsView, { global: { plugins: [createTestingPinia({ createSpy: vi.fn }), i18n, router] } })

describe('SettingsView', () => {
  it('プライバシーポリシーへのナビゲーション項目が存在する', () => {
    renderView()
    expect(screen.getByText(/プライバシーポリシー/)).toBeInTheDocument()
  })

  it('ライセンスへのナビゲーション項目が存在する', () => {
    renderView()
    expect(screen.getByText(/ライセンス/)).toBeInTheDocument()
  })
})
