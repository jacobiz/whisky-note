import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useImageCompression } from '@/composables/useImageCompression'
import { IMAGE_MAX_SIZE_MB } from '@/db/types'

// browser-image-compression のモック
vi.mock('browser-image-compression', () => ({
  default: vi.fn(),
}))

import imageCompression from 'browser-image-compression'

function createFakeFile(sizeKb: number, name = 'test.jpg', type = 'image/jpeg'): File {
  const bytes = new Uint8Array(sizeKb * 1024)
  return new File([bytes], name, { type })
}

describe('useImageCompression', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('500KB 超の画像が圧縮されること', async () => {
    const largeFile = createFakeFile(800) // 800KB
    const compressedFile = createFakeFile(400) // 400KB に圧縮

    vi.mocked(imageCompression).mockResolvedValue(compressedFile)

    const { compress } = useImageCompression()
    const result = await compress(largeFile)

    expect(imageCompression).toHaveBeenCalledWith(largeFile, {
      maxSizeMB: IMAGE_MAX_SIZE_MB,
      useWebWorker: true,
    })
    expect(result).toBe(compressedFile)
  })

  it('500KB 以下の画像はそのまま通ること', async () => {
    const smallFile = createFakeFile(200) // 200KB

    // 圧縮ライブラリが同じサイズを返す場合でも元ファイルが返る
    vi.mocked(imageCompression).mockResolvedValue(smallFile)

    const { compress } = useImageCompression()
    const result = await compress(smallFile)

    expect(result).toBeDefined()
    expect(result?.size).toBeLessThanOrEqual(IMAGE_MAX_SIZE_MB * 1024 * 1024)
  })

  it('破損ファイルのエラーハンドリング', async () => {
    const brokenFile = createFakeFile(100)

    vi.mocked(imageCompression).mockRejectedValue(new Error('Invalid image'))

    const { compress, error } = useImageCompression()
    const result = await compress(brokenFile)

    expect(result).toBeNull()
    expect(error.value).toBeTruthy()
  })

  it('isCompressing フラグが圧縮中に true になること', async () => {
    const file = createFakeFile(800)
    let resolveCompression!: (v: File) => void
    const compressionPromise = new Promise<File>(resolve => {
      resolveCompression = resolve
    })

    vi.mocked(imageCompression).mockReturnValue(compressionPromise)

    const { compress, isCompressing } = useImageCompression()
    expect(isCompressing.value).toBe(false)

    const compressPromise = compress(file)
    expect(isCompressing.value).toBe(true)

    resolveCompression(createFakeFile(400))
    await compressPromise

    expect(isCompressing.value).toBe(false)
  })
})
