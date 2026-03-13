import { render, screen, fireEvent } from '@testing-library/vue'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ref } from 'vue'
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

describe('インストールセクション', () => {
  beforeEach(() => {
    vi.resetModules()
  })

  it('canInstall が true のときインストールボタンが表示される', async () => {
    vi.doMock('@/composables/useInstallPrompt', () => ({
      useInstallPrompt: () => ({
        canInstall: ref(true),
        isIos: ref(false),
        promptInstall: vi.fn(),
      }),
    }))
    const { default: SettingsViewMocked } = await import('@/views/SettingsView.vue')
    render(SettingsViewMocked, {
      global: { plugins: [createTestingPinia({ createSpy: vi.fn }), i18n, router] },
    })
    expect(screen.getByText('ホーム画面に追加')).toBeInTheDocument()
  })

  it('ボタンクリックで promptInstall が呼ばれる', async () => {
    const mockPromptInstall = vi.fn()
    vi.doMock('@/composables/useInstallPrompt', () => ({
      useInstallPrompt: () => ({
        canInstall: ref(true),
        isIos: ref(false),
        promptInstall: mockPromptInstall,
      }),
    }))
    const { default: SettingsViewMocked } = await import('@/views/SettingsView.vue')
    render(SettingsViewMocked, {
      global: { plugins: [createTestingPinia({ createSpy: vi.fn }), i18n, router] },
    })
    const btn = screen.getByText('ホーム画面に追加')
    await fireEvent.click(btn)
    expect(mockPromptInstall).toHaveBeenCalled()
  })

  it('isIos が true のとき iOS 案内テキストが表示される', async () => {
    vi.doMock('@/composables/useInstallPrompt', () => ({
      useInstallPrompt: () => ({
        canInstall: ref(false),
        isIos: ref(true),
        promptInstall: vi.fn(),
      }),
    }))
    const { default: SettingsViewMocked } = await import('@/views/SettingsView.vue')
    render(SettingsViewMocked, {
      global: { plugins: [createTestingPinia({ createSpy: vi.fn }), i18n, router] },
    })
    expect(screen.getByText(/Safari/)).toBeInTheDocument()
  })

  it('canInstall が false かつ isIos が false のときインストールセクションが非表示', async () => {
    vi.doMock('@/composables/useInstallPrompt', () => ({
      useInstallPrompt: () => ({
        canInstall: ref(false),
        isIos: ref(false),
        promptInstall: vi.fn(),
      }),
    }))
    const { default: SettingsViewMocked } = await import('@/views/SettingsView.vue')
    render(SettingsViewMocked, {
      global: { plugins: [createTestingPinia({ createSpy: vi.fn }), i18n, router] },
    })
    expect(screen.queryByText('ホーム画面に追加')).not.toBeInTheDocument()
    expect(screen.queryByText(/Safari/)).not.toBeInTheDocument()
  })
})
