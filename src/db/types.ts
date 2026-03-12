// テイスティングノートの TypeScript 型定義

/** テイスティングノート本体 */
export interface TastingNote {
  id: string // UUID v4
  brandName: string // 銘柄名（必須、最大100文字、一意性制約なし）
  distillery?: string // 蒸留所（最大100文字）
  vintage?: string // ヴィンテージ（最大20文字、例: "1990", "NAS"）
  appearance?: string // 外観（最大1,000文字）
  nose?: string // 香り（最大1,000文字）
  palate?: string // 味わい（最大1,000文字）
  finish?: string // 余韻（最大1,000文字）
  rating?: number // 総合評価（0–100の整数、未設定はundefined）
  notes?: string // フリーメモ（最大1,000文字）
  imageId?: string // BottleImage.id への参照
  createdAt: Date // 記録日時（自動設定）
  updatedAt: Date // 最終更新日時（自動更新）
}

/** ボトル画像（500KB以下に圧縮済み） */
export interface BottleImage {
  id: string // UUID v4
  noteId: string // TastingNote.id への参照
  blob: Blob // 圧縮済み画像データ（最大500KB）
  mimeType: string // "image/jpeg" または "image/webp"
  createdAt: Date
}

/** 下書き（シングルトン、常に1件のみ） */
export interface Draft {
  id: 'current' // 固定キー
  data: Partial<Omit<TastingNote, 'id' | 'createdAt' | 'updatedAt'>>
  updatedAt: Date
}

/** アプリ設定（シングルトン） */
export interface AppSettings {
  id: 'settings' // 固定キー
  language: 'ja' | 'en'
}

/** テキストフィールドの最大文字数 */
export const TEXT_FIELD_MAX_LENGTH = 1000

/** 画像の最大サイズ（バイト） */
export const IMAGE_MAX_SIZE_MB = 0.5
