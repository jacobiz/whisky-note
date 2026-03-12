import { render, screen } from '@testing-library/vue'
import { describe, it, expect } from 'vitest'
import { createI18n } from 'vue-i18n'
import { createRouter, createMemoryHistory } from 'vue-router'
import { createTestingPinia } from '@pinia/testing'
import LicenseView from '@/views/LicenseView.vue'
import ja from '@/i18n/locales/ja.json'

const i18n = createI18n({ legacy: false, locale: 'ja', messages: { ja } })
const router = createRouter({
  history: createMemoryHistory(),
  routes: [{ path: '/licenses', name: 'licenses', component: LicenseView }],
})

const renderView = () =>
  render(LicenseView, { global: { plugins: [createTestingPinia(), i18n, router] } })

describe('LicenseView', () => {
  it('Vue / Pinia / Dexie.js 等のライブラリ名が表示される', () => {
    renderView()
    expect(screen.getAllByText(/Vue/).length).toBeGreaterThan(0)
    expect(screen.getByText('Pinia')).toBeInTheDocument()
    expect(screen.getByText('Dexie.js')).toBeInTheDocument()
  })
})
