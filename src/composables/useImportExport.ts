import { ref } from 'vue'
import { db } from '@/db'

// エクスポートJSONファイル内の写真データ
export interface ExportImage {
  mimeType: string
  data: string // "data:<mimeType>;base64,..." 形式
}

// エクスポートJSONファイル内の個別ノートレコード
export interface ExportNote {
  id: string
  brandName: string
  distillery?: string
  vintage?: string
  appearance?: string
  nose?: string
  palate?: string
  finish?: string
  rating?: number
  notes?: string
  createdAt: string // ISO 8601
  updatedAt: string // ISO 8601
  image?: ExportImage | null
}

// エクスポートJSONファイルのルートオブジェクト
export interface ExportData {
  version: 1
  exportedAt: string // ISO 8601
  notes: ExportNote[]
}

// インポート処理の結果
export interface ImportResult {
  added: number
  skipped: number
  errors: string[]
}

// プレビュー結果（確認ダイアログ表示用）
export interface ImportPreview {
  total: number
  skipped: number
  notes: ExportNote[]
}

// Blob → Base64 data URL に変換するヘルパー
function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => resolve(e.target!.result as string)
    reader.onerror = () => reject(new Error('画像の読み込みに失敗しました'))
    reader.readAsDataURL(blob)
  })
}

// Base64 data URL → Blob に変換するヘルパー
async function base64ToBlob(dataUrl: string): Promise<Blob> {
  const res = await fetch(dataUrl)
  return res.blob()
}

// 写真データを DB に保存して imageId を返すヘルパー（失敗時は undefined）
async function importImage(noteId: string, image: ExportImage): Promise<string | undefined> {
  try {
    const blob = await base64ToBlob(image.data)
    const imgId = crypto.randomUUID()
    await db.bottleImages.add({
      id: imgId,
      noteId,
      blob,
      mimeType: image.mimeType,
      createdAt: new Date(),
    })
    return imgId
  } catch {
    // 写真の変換に失敗した場合は写真なしで保存
    return undefined
  }
}

// YYYYMMDD 形式の日付文字列を生成するヘルパー
function toDateString(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}${m}${d}`
}

export function useImportExport() {
  const isExporting = ref(false)
  const isImporting = ref(false)

  // 全ノートをJSONファイルとしてダウンロード
  async function exportData(): Promise<void> {
    isExporting.value = true
    try {
      const notes = await db.tastingNotes.toArray()

      // 写真を一括取得してMapに格納
      const imageIds = notes.map((n) => n.imageId).filter((id): id is string => id !== undefined)
      const images = await db.bottleImages.bulkGet(imageIds)
      const imageMap = new Map(images.filter(Boolean).map((img) => [img!.id, img!]))

      // 各ノートを ExportNote 形式に変換（写真は Base64 に変換）
      const exportNotes: ExportNote[] = await Promise.all(
        notes.map(async (note) => {
          let image: ExportImage | null = null
          if (note.imageId) {
            const img = imageMap.get(note.imageId)
            if (img) {
              const data = await blobToBase64(img.blob)
              image = { mimeType: img.mimeType, data }
            }
          }
          return {
            id: note.id,
            brandName: note.brandName,
            ...(note.distillery !== undefined && { distillery: note.distillery }),
            ...(note.vintage !== undefined && { vintage: note.vintage }),
            ...(note.appearance !== undefined && { appearance: note.appearance }),
            ...(note.nose !== undefined && { nose: note.nose }),
            ...(note.palate !== undefined && { palate: note.palate }),
            ...(note.finish !== undefined && { finish: note.finish }),
            ...(note.rating !== undefined && { rating: note.rating }),
            ...(note.notes !== undefined && { notes: note.notes }),
            createdAt: note.createdAt.toISOString(),
            updatedAt: note.updatedAt.toISOString(),
            image,
          } satisfies ExportNote
        }),
      )

      const now = new Date()
      const exportData: ExportData = {
        version: 1,
        exportedAt: now.toISOString(),
        notes: exportNotes,
      }

      // JSON Blob を生成してダウンロード
      const json = JSON.stringify(exportData, null, 2)
      const blob = new Blob([json], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const dateStr = toDateString(now)
      const a = document.createElement('a')
      a.href = url
      a.download = `whisky-note-export-${dateStr}.json`
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
    } finally {
      isExporting.value = false
    }
  }

  // JSONファイルを解析してプレビュー情報を取得（確認ダイアログ用）
  async function previewImport(file: File): Promise<ImportPreview> {
    // ファイルをテキストとして読み込む
    const text = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => resolve(e.target!.result as string)
      reader.onerror = () => reject(new Error('ファイルの読み込みに失敗しました'))
      reader.readAsText(file)
    })

    // JSON パース
    let parsed: unknown
    try {
      parsed = JSON.parse(text)
    } catch {
      throw new Error('有効なエクスポートファイルではありません')
    }

    // 構造バリデーション
    if (
      typeof parsed !== 'object' ||
      parsed === null ||
      !('version' in parsed) ||
      !('notes' in parsed) ||
      !Array.isArray((parsed as ExportData).notes)
    ) {
      throw new Error('有効なエクスポートファイルではありません')
    }

    const data = parsed as ExportData

    // バージョンチェック
    if (data.version > 1) {
      throw new Error('未対応のファイルバージョンです')
    }

    // 有効なノートのみ抽出
    const validNotes = data.notes.filter(
      (n) => typeof n.id === 'string' && typeof n.brandName === 'string',
    )

    // 重複チェック
    const ids = validNotes.map((n) => n.id)
    const existing = await db.tastingNotes.bulkGet(ids)
    const skippedCount = existing.filter(Boolean).length

    return {
      total: validNotes.length,
      skipped: skippedCount,
      notes: validNotes,
    }
  }

  // 確認後にインポートを実行
  async function executeImport(notes: ExportNote[]): Promise<ImportResult> {
    isImporting.value = true
    let added = 0
    let skipped = 0
    const errors: string[] = []

    try {
      // 重複チェック（一括取得）
      const ids = notes.map((n) => n.id)
      const existing = await db.tastingNotes.bulkGet(ids)
      const existingIds = new Set(existing.filter(Boolean).map((n) => n!.id))

      for (const note of notes) {
        if (existingIds.has(note.id)) {
          skipped++
          continue
        }

        try {
          // 写真の保存
          const imageId = note.image?.data
            ? await importImage(note.id, note.image)
            : undefined

          // ノートの保存
          await db.tastingNotes.add({
            id: note.id,
            brandName: note.brandName,
            ...(note.distillery !== undefined && { distillery: note.distillery }),
            ...(note.vintage !== undefined && { vintage: note.vintage }),
            ...(note.appearance !== undefined && { appearance: note.appearance }),
            ...(note.nose !== undefined && { nose: note.nose }),
            ...(note.palate !== undefined && { palate: note.palate }),
            ...(note.finish !== undefined && { finish: note.finish }),
            ...(note.rating !== undefined && { rating: note.rating }),
            ...(note.notes !== undefined && { notes: note.notes }),
            ...(imageId !== undefined && { imageId }),
            createdAt: new Date(note.createdAt),
            updatedAt: new Date(note.updatedAt),
          })
          added++
        } catch (err) {
          errors.push(`ノート「${note.brandName}」の保存に失敗しました`)
        }
      }
    } finally {
      isImporting.value = false
    }

    return { added, skipped, errors }
  }

  return { isExporting, isImporting, exportData, previewImport, executeImport }
}
