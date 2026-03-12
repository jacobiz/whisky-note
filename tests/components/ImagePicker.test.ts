import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/vue'
import { createTestingPinia } from '@pinia/testing'
import ImagePicker from '@/components/ImagePicker.vue'
import { i18n } from '@/i18n'

vi.mock('@/composables/useImageCompression', () => ({
  useImageCompression: () => ({
    compress: vi.fn().mockResolvedValue(new File(['compressed'], 'compressed.jpg', { type: 'image/jpeg' })),
    isCompressing: { value: false },
    error: { value: null },
  }),
}))

function createFakeFile(name = 'test.jpg', type = 'image/jpeg', sizeKb = 100): File {
  const bytes = new Uint8Array(sizeKb * 1024)
  return new File([bytes], name, { type })
}

describe('ImagePicker', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // URL.createObjectURL をモック
    vi.stubGlobal('URL', {
      createObjectURL: vi.fn().mockReturnValue('blob:mock-url'),
      revokeObjectURL: vi.fn(),
    })
  })

  it('画像選択ボタンが表示されること', () => {
    render(ImagePicker, {
      global: {
        plugins: [createTestingPinia(), i18n],
      },
    })

    expect(screen.getByRole('button')).toBeInTheDocument()
  })

  it('画像選択後にプレビューが表示されること', async () => {
    const { container } = render(ImagePicker, {
      global: {
        plugins: [createTestingPinia(), i18n],
      },
    })

    const input = container.querySelector('input[type="file"]') as HTMLInputElement
    const file = createFakeFile()

    Object.defineProperty(input, 'files', {
      value: [file],
      writable: false,
    })

    await fireEvent.change(input)

    // プレビュー画像が表示されること
    const img = await screen.findByRole('img')
    expect(img).toBeInTheDocument()
  })

  it('画像削除ボタンが画像選択後に表示されること', async () => {
    const { container } = render(ImagePicker, {
      global: {
        plugins: [createTestingPinia(), i18n],
      },
    })

    const input = container.querySelector('input[type="file"]') as HTMLInputElement
    const file = createFakeFile()

    Object.defineProperty(input, 'files', {
      value: [file],
      writable: false,
    })

    await fireEvent.change(input)

    // 削除ボタンが表示される
    const deleteButton = await screen.findByLabelText(/削除|remove|delete/i)
    expect(deleteButton).toBeInTheDocument()
  })
})
