import { render, screen, fireEvent } from '@testing-library/vue'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createTestingPinia } from '@pinia/testing'
import { createI18n } from 'vue-i18n'
import { createRouter, createMemoryHistory } from 'vue-router'
import NoteCreateView from '@/views/NoteCreateView.vue'
import ja from '@/i18n/locales/ja.json'

vi.stubGlobal('URL', {
  createObjectURL: vi.fn().mockReturnValue('blob:mock-url'),
  revokeObjectURL: vi.fn(),
})

const i18n = createI18n({ legacy: false, locale: 'ja', messages: { ja } })

const router = createRouter({
  history: createMemoryHistory(),
  routes: [
    { path: '/', name: 'home', component: { template: '<div/>' } },
    { path: '/notes/new', name: 'note-create', component: NoteCreateView },
  ],
})

const App = { template: '<router-view />' }

const renderCreateView = () => {
  const pinia = createTestingPinia({ createSpy: vi.fn })
  return render(App, {
    global: { plugins: [pinia, i18n, router] },
  })
}

describe('NoteCreateView', () => {
  beforeEach(async () => {
    await router.push('/notes/new')
    await router.isReady()
  })

  it('AppHeader が表示される', async () => {
    renderCreateView()
    await new Promise(r => setTimeout(r, 50))
    const backBtn = screen.getByLabelText(/戻る|back/i)
    expect(backBtn).toBeInTheDocument()
  })

  it('フォーム入力後にルート離脱したとき window.confirm が呼ばれる', async () => {
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false)
    renderCreateView()
    await new Promise(r => setTimeout(r, 50))

    const brandInput = screen.getByLabelText(/銘柄名/)
    await fireEvent.update(brandInput, '山崎18年')

    await router.push('/')
    expect(confirmSpy).toHaveBeenCalled()
    confirmSpy.mockRestore()
  })
})
