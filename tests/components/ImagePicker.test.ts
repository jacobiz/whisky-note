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

  it('existingImageUrl prop を渡したとき img 要素が表示される', () => {
    render(ImagePicker, {
      props: { existingImageUrl: 'blob:existing-url' },
      global: { plugins: [createTestingPinia(), i18n] },
    })
    const img = screen.getByRole('img')
    expect(img).toBeInTheDocument()
    expect(img).toHaveAttribute('src', 'blob:existing-url')
  })

  it('画像表示コンテナが縦長アスペクト比（aspect-[2/3]）を持つ', async () => {
    const { container } = render(ImagePicker, {
      props: { existingImageUrl: 'blob:existing-url' },
      global: { plugins: [createTestingPinia(), i18n] },
    })
    expect(container.querySelector('.aspect-\\[2\\/3\\]')).not.toBeNull()
  })

  it('削除ボタン（×）をクリックしたとき update:modelValue で null が emit される', async () => {
    const { emitted } = render(ImagePicker, {
      props: { existingImageUrl: 'blob:existing-url' },
      global: { plugins: [createTestingPinia(), i18n] },
    })
    const deleteBtn = screen.getByLabelText(/削除|remove/i)
    await fireEvent.click(deleteBtn)
    expect(emitted()['update:modelValue']).toContainEqual([null])
  })

  it('existingImageUrl がある状態で削除後、img が非表示になる', async () => {
    render(ImagePicker, {
      props: { existingImageUrl: 'blob:existing-url' },
      global: { plugins: [createTestingPinia(), i18n] },
    })
    const deleteBtn = screen.getByLabelText(/削除|remove/i)
    await fireEvent.click(deleteBtn)
    expect(screen.queryByRole('img')).not.toBeInTheDocument()
  })

  it('新しい画像を選択後ファイルが空の場合（キャンセル）、existingImageUrl の画像が維持される', async () => {
    const { container } = render(ImagePicker, {
      props: { existingImageUrl: 'blob:existing-url' },
      global: { plugins: [createTestingPinia(), i18n] },
    })
    // ファイル入力を空でトリガー（キャンセルをシミュレート）
    const input = container.querySelector('input[type="file"]') as HTMLInputElement
    Object.defineProperty(input, 'files', { value: [], writable: false })
    await fireEvent.change(input)
    // 既存画像が維持される
    expect(screen.getByRole('img')).toHaveAttribute('src', 'blob:existing-url')
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
