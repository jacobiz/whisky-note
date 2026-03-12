import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { useImportExport } from '@/composables/useImportExport'
import type { TastingNote, BottleImage } from '@/db/types'

// DB モック
vi.mock('@/db', () => ({
  db: {
    tastingNotes: {
      toArray: vi.fn(),
      bulkGet: vi.fn(),
      add: vi.fn(),
    },
    bottleImages: {
      get: vi.fn(),
      bulkGet: vi.fn(),
      add: vi.fn(),
    },
  },
}))

// URL モック
vi.stubGlobal('URL', {
  createObjectURL: vi.fn(() => 'blob:mock-url'),
  revokeObjectURL: vi.fn(),
})

// <a> 要素モック（download 属性の取得に使用）
const mockAnchor = {
  href: '',
  download: '',
  click: vi.fn(),
  remove: vi.fn(),
  style: {},
}

// FileReader モック
type MockReaderInstance = {
  readAsDataURL: () => void
  readAsText: () => void
  onload: ((ev: { target: MockReaderInstance }) => void) | null
  onerror: (() => void) | null
  result: string | null
}
const mockReaderInstances: MockReaderInstance[] = []

vi.stubGlobal(
  'FileReader',
  class {
    onload: MockReaderInstance['onload'] = null
    onerror: MockReaderInstance['onerror'] = null
    result: string | null = null

    readAsDataURL(_blob: Blob) {
      mockReaderInstances.push(this as unknown as MockReaderInstance)
    }

    readAsText(_file: File) {
      mockReaderInstances.push(this as unknown as MockReaderInstance)
    }
  },
)

import { db } from '@/db'

const mockNote = (overrides: Partial<TastingNote> = {}): TastingNote => ({
  id: 'note-1',
  brandName: '山崎12年',
  createdAt: new Date('2026-01-01T00:00:00.000Z'),
  updatedAt: new Date('2026-01-01T00:00:00.000Z'),
  ...overrides,
})

const mockImage = (overrides: Partial<BottleImage> = {}): BottleImage => ({
  id: 'img-1',
  noteId: 'note-1',
  blob: new Blob(['fake'], { type: 'image/jpeg' }),
  mimeType: 'image/jpeg',
  createdAt: new Date('2026-01-01T00:00:00.000Z'),
  ...overrides,
})

describe('useImportExport - エクスポート機能', () => {
  const origCreateElement = document.createElement.bind(document)

  beforeEach(() => {
    vi.clearAllMocks()
    mockReaderInstances.length = 0
    mockAnchor.href = ''
    mockAnchor.download = ''
    // bulkGet のデフォルト（写真なし）
    vi.mocked(db.bottleImages.bulkGet).mockResolvedValue([])
    // <a> 要素と body.appendChild を毎テストでモック
    vi.spyOn(document, 'createElement').mockImplementation((tag: string) => {
      if (tag === 'a') return mockAnchor as unknown as HTMLAnchorElement
      return origCreateElement(tag)
    })
    vi.spyOn(document.body, 'appendChild').mockImplementation((node) => node)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('exportData() 呼び出し後に isExporting が false に戻る', async () => {
    vi.mocked(db.tastingNotes.toArray).mockResolvedValue([])
    const { isExporting, exportData } = useImportExport()
    expect(isExporting.value).toBe(false)
    await exportData()
    expect(isExporting.value).toBe(false)
  })

  it('ノート0件でも正常に空配列 notes: [] を含むJSONが生成される', async () => {
    vi.mocked(db.tastingNotes.toArray).mockResolvedValue([])
    const stringifySpy = vi.spyOn(JSON, 'stringify')
    const { exportData } = useImportExport()
    await exportData()
    const exportCall = stringifySpy.mock.calls.find(
      (c) => c[0] !== null && typeof c[0] === 'object' && 'version' in (c[0] as object),
    )
    expect(exportCall).toBeTruthy()
    const data = exportCall![0] as { version: number; notes: unknown[] }
    expect(data.version).toBe(1)
    expect(data.notes).toHaveLength(0)
  })

  it('全ノートが ExportNote 形式（id/brandName/createdAt/updatedAt ISO8601）に変換される', async () => {
    vi.mocked(db.tastingNotes.toArray).mockResolvedValue([mockNote()])
    vi.mocked(db.bottleImages.bulkGet).mockResolvedValue([])
    const stringifySpy = vi.spyOn(JSON, 'stringify')

    const { exportData } = useImportExport()
    await exportData()

    const exportCall = stringifySpy.mock.calls.find(
      (c) => c[0] !== null && typeof c[0] === 'object' && 'version' in (c[0] as object),
    )
    const data = exportCall![0] as { version: number; notes: Array<{ id: string; brandName: string; createdAt: string; updatedAt: string }> }
    expect(data.version).toBe(1)
    expect(data.notes).toHaveLength(1)
    expect(data.notes[0].id).toBe('note-1')
    expect(data.notes[0].brandName).toBe('山崎12年')
    expect(data.notes[0].createdAt).toBe('2026-01-01T00:00:00.000Z')
    expect(data.notes[0].updatedAt).toBe('2026-01-01T00:00:00.000Z')
  })

  it('写真なしノートの image が null になる', async () => {
    vi.mocked(db.tastingNotes.toArray).mockResolvedValue([mockNote({ imageId: undefined })])
    const stringifySpy = vi.spyOn(JSON, 'stringify')

    const { exportData } = useImportExport()
    await exportData()

    const exportCall = stringifySpy.mock.calls.find(
      (c) => c[0] !== null && typeof c[0] === 'object' && 'version' in (c[0] as object),
    )
    const data = exportCall![0] as { notes: Array<{ image: null }> }
    expect(data.notes[0].image).toBeNull()
  })

  it('写真ありノートの image.data が "data:" で始まる Base64 data URL になる', async () => {
    vi.mocked(db.tastingNotes.toArray).mockResolvedValue([mockNote({ imageId: 'img-1' })])
    vi.mocked(db.bottleImages.bulkGet).mockResolvedValue([mockImage()])
    const stringifySpy = vi.spyOn(JSON, 'stringify')

    const { exportData } = useImportExport()
    const exportPromise = exportData()

    // FileReader.onload を呼び出してBase64を返す
    await new Promise((r) => setTimeout(r, 0))
    for (const reader of mockReaderInstances) {
      reader.result = 'data:image/jpeg;base64,/9j/fake'
      reader.onload?.({ target: reader })
    }
    await exportPromise

    const exportCall = stringifySpy.mock.calls.find(
      (c) => c[0] !== null && typeof c[0] === 'object' && 'version' in (c[0] as object),
    )
    const data = exportCall![0] as { notes: Array<{ image: { data: string; mimeType: string } }> }
    expect(data.notes[0].image.data).toMatch(/^data:/)
    expect(data.notes[0].image.mimeType).toBe('image/jpeg')
  })

  it('生成されるファイル名が whisky-note-export-YYYYMMDD.json 形式になる', async () => {
    vi.mocked(db.tastingNotes.toArray).mockResolvedValue([])
    const { exportData } = useImportExport()
    await exportData()
    expect(mockAnchor.download).toMatch(/^whisky-note-export-\d{8}\.json$/)
  })
})

describe('useImportExport - インポート機能', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockReaderInstances.length = 0
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  const makeValidJson = (overrides = {}) =>
    JSON.stringify({
      version: 1,
      exportedAt: '2026-01-01T00:00:00.000Z',
      notes: [
        {
          id: 'note-1',
          brandName: '山崎12年',
          createdAt: '2026-01-01T00:00:00.000Z',
          updatedAt: '2026-01-01T00:00:00.000Z',
          image: null,
        },
      ],
      ...overrides,
    })

  const makeFile = (content: string, name = 'export.json') =>
    new File([content], name, { type: 'application/json' })

  // FileReader.readAsText をトリガーするヘルパー
  async function triggerFileRead(content: string) {
    await new Promise((r) => setTimeout(r, 0))
    for (const reader of mockReaderInstances) {
      reader.result = content
      reader.onload?.({ target: reader })
    }
  }

  it('previewImport() が正常なJSONファイルを受け取り { total, skipped, notes } を返す', async () => {
    vi.mocked(db.tastingNotes.bulkGet).mockResolvedValue([undefined])
    const { previewImport } = useImportExport()
    const file = makeFile(makeValidJson())

    const previewPromise = previewImport(file)
    await triggerFileRead(makeValidJson())

    const result = await previewPromise
    expect(result.total).toBe(1)
    expect(result.skipped).toBe(0)
    expect(result.notes).toHaveLength(1)
  })

  it('previewImport() が不正なJSONでエラーをthrow', async () => {
    const { previewImport } = useImportExport()
    const file = makeFile('invalid json')

    const previewPromise = previewImport(file)
    await triggerFileRead('invalid json')

    await expect(previewPromise).rejects.toThrow()
  })

  it('previewImport() が version > 1 のファイルでエラーをthrow', async () => {
    const { previewImport } = useImportExport()
    const json = makeValidJson({ version: 2 })
    const file = makeFile(json)

    const previewPromise = previewImport(file)
    await triggerFileRead(json)

    await expect(previewPromise).rejects.toThrow()
  })

  it('previewImport() が既存IDのノートをスキップとしてカウントする', async () => {
    vi.mocked(db.tastingNotes.bulkGet).mockResolvedValue([{ id: 'note-1' } as TastingNote])
    const { previewImport } = useImportExport()
    const file = makeFile(makeValidJson())

    const previewPromise = previewImport(file)
    await triggerFileRead(makeValidJson())

    const result = await previewPromise
    expect(result.total).toBe(1)
    expect(result.skipped).toBe(1)
  })

  it('executeImport() が既存IDのノートをスキップして skipped をカウント', async () => {
    vi.mocked(db.tastingNotes.bulkGet).mockResolvedValue([{ id: 'note-1' } as TastingNote])
    const { executeImport } = useImportExport()

    const result = await executeImport([
      {
        id: 'note-1',
        brandName: '山崎12年',
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:00.000Z',
        image: null,
      },
    ])
    expect(result.added).toBe(0)
    expect(result.skipped).toBe(1)
  })

  it('executeImport() が新規ノートをDBに追加して added をカウントする', async () => {
    vi.mocked(db.tastingNotes.bulkGet).mockResolvedValue([undefined])
    vi.mocked(db.tastingNotes.add).mockResolvedValue('note-1')
    const { executeImport } = useImportExport()

    const result = await executeImport([
      {
        id: 'note-1',
        brandName: '山崎12年',
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:00.000Z',
        image: null,
      },
    ])
    expect(result.added).toBe(1)
    expect(result.skipped).toBe(0)
    expect(db.tastingNotes.add).toHaveBeenCalledTimes(1)
  })

  it('executeImport() が写真ありノートの image を Blob に変換して bottleImages に保存する', async () => {
    vi.mocked(db.tastingNotes.bulkGet).mockResolvedValue([undefined])
    vi.mocked(db.tastingNotes.add).mockResolvedValue('note-new')
    vi.mocked(db.bottleImages.add).mockResolvedValue('img-new')

    // fetch モック（Base64 data URL → Blob）
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        blob: vi.fn().mockResolvedValue(new Blob(['fake'], { type: 'image/jpeg' })),
      }),
    )

    const { executeImport } = useImportExport()

    const result = await executeImport([
      {
        id: 'note-new',
        brandName: '白州18年',
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:00.000Z',
        image: { mimeType: 'image/jpeg', data: 'data:image/jpeg;base64,/9j/fake' },
      },
    ])
    expect(result.added).toBe(1)
    expect(db.bottleImages.add).toHaveBeenCalledTimes(1)
    // noteId と imageId がリンクされていること
    const addedNote = vi.mocked(db.tastingNotes.add).mock.calls[0][0] as { imageId?: string }
    expect(addedNote.imageId).toBeTruthy()
  })
})

describe('useImportExport - エッジケース', () => {
  const origCreateElement = document.createElement.bind(document)

  beforeEach(() => {
    vi.clearAllMocks()
    mockReaderInstances.length = 0
    mockAnchor.href = ''
    mockAnchor.download = ''
    vi.mocked(db.bottleImages.bulkGet).mockResolvedValue([])
    vi.spyOn(document, 'createElement').mockImplementation((tag: string) => {
      if (tag === 'a') return mockAnchor as unknown as HTMLAnchorElement
      return origCreateElement(tag)
    })
    vi.spyOn(document.body, 'appendChild').mockImplementation((node) => node)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('エクスポート中にDB読み込みが失敗しても isExporting が false に戻る', async () => {
    vi.mocked(db.tastingNotes.toArray).mockRejectedValue(new Error('DB error'))
    const { isExporting, exportData } = useImportExport()

    await expect(exportData()).rejects.toThrow()
    expect(isExporting.value).toBe(false)
  })

  it('previewImport() が notes フィールドを持たないJSONでエラーをthrow', async () => {
    const { previewImport } = useImportExport()
    const json = JSON.stringify({ version: 1, exportedAt: '2026-01-01T00:00:00.000Z' })
    const file = new File([json], 'export.json', { type: 'application/json' })

    const previewPromise = previewImport(file)
    await new Promise((r) => setTimeout(r, 0))
    for (const reader of mockReaderInstances) {
      reader.result = json
      reader.onload?.({ target: reader })
    }

    await expect(previewPromise).rejects.toThrow()
  })

  it('executeImport() が全ノート重複の場合 added:0, skipped:N で正常終了する', async () => {
    vi.mocked(db.tastingNotes.bulkGet).mockResolvedValue([
      { id: 'note-1' } as TastingNote,
      { id: 'note-2' } as TastingNote,
    ])
    const { executeImport } = useImportExport()

    const result = await executeImport([
      {
        id: 'note-1',
        brandName: '山崎12年',
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:00.000Z',
        image: null,
      },
      {
        id: 'note-2',
        brandName: '白州18年',
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:00.000Z',
        image: null,
      },
    ])
    expect(result.added).toBe(0)
    expect(result.skipped).toBe(2)
    expect(db.tastingNotes.add).not.toHaveBeenCalled()
  })

  it('写真の Base64 data URL が不正な場合、写真なしとして保存される', async () => {
    vi.mocked(db.tastingNotes.bulkGet).mockResolvedValue([undefined])
    vi.mocked(db.tastingNotes.add).mockResolvedValue('note-1')

    // fetch が失敗するケース（不正な data URL）
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('invalid data URL')))

    const { executeImport } = useImportExport()

    const result = await executeImport([
      {
        id: 'note-1',
        brandName: '響21年',
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:00.000Z',
        image: { mimeType: 'image/jpeg', data: 'invalid-data-url' },
      },
    ])
    // 写真変換失敗でも added:1（写真なしで保存）
    expect(result.added).toBe(1)
    expect(db.bottleImages.add).not.toHaveBeenCalled()
    const addedNote = vi.mocked(db.tastingNotes.add).mock.calls[0][0] as { imageId?: string }
    expect(addedNote.imageId).toBeUndefined()
  })
})
