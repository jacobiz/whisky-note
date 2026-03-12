# Data Model: 記録アプリ UX 拡充

**Date**: 2026-03-12
**Branch**: `003-record-ux-polish`

## スキーマ変更: なし

本機能は既存の `TastingNote` / `BottleImage` スキーマを変更しない。UI 層の改善のみ。

## 既存スキーマ（参照用）

```typescript
interface TastingNote {
  id: string           // UUID v4
  brandName: string    // 銘柄名（必須）
  distillery?: string  // 蒸留所
  vintage?: string     // ヴィンテージ
  appearance?: string  // 外観（最大1,000文字）
  nose?: string        // 香り（最大1,000文字）
  palate?: string      // 味わい（最大1,000文字）
  finish?: string      // 余韻（最大1,000文字）
  rating?: number      // 評価（0–100の整数）
  notes?: string       // メモ（最大1,000文字）
  imageId?: string     // BottleImage.id への参照
  createdAt: Date
  updatedAt: Date
}

interface BottleImage {
  id: string
  noteId: string       // TastingNote.id への参照
  blob: Blob           // 圧縮済み画像（最大500KB）
  mimeType: string
  createdAt: Date
}
```

## 静的コンテンツ（DB 管理外）

### PrivacyPolicyContent

コード内定数として `PrivacyPolicyView.vue` に定義。

| フィールド | 型 | 説明 |
|-----------|-----|------|
| title | string | 「プライバシーポリシー」 |
| lastUpdated | string | 最終更新日（例: 2026-03-12） |
| sections | Array<{heading: string, body: string}> | ポリシー本文のセクション一覧 |

### LicenseEntry

コード内定数として `LicenseView.vue` に定義。

| フィールド | 型 | 説明 |
|-----------|-----|------|
| name | string | ライブラリ名（例: "Vue"） |
| version | string | バージョン（例: "3.5.x"） |
| license | string | ライセンス種別（例: "MIT"） |
| copyright | string | 著作権表示 |
| url | string | リポジトリ/ライセンス URL（オプション） |

### 収録ライブラリ一覧（初期版）

| ライブラリ | ライセンス |
|-----------|-----------|
| Vue | MIT |
| Pinia | MIT |
| Vue Router | MIT |
| vue-i18n | MIT |
| Vite | MIT |
| Dexie.js | Apache-2.0 |
| Tailwind CSS | MIT |
| browser-image-compression | MIT |
| vite-plugin-pwa | MIT |
| Workbox | MIT |

## コンポーネント Props の追加（型変更）

### ImagePicker

```typescript
// 追加 prop
existingImageUrl?: string | null
// 既存の imageId ではなく、親コンポーネントが解決した ObjectURL を受け取る
```

### NoteForm

```typescript
// 追加 prop
initialImageUrl?: string | null
// NoteEditView が IndexedDB から生成した ObjectURL
```

### AppHeader

```typescript
// 新規コンポーネントの props
title: string
showBack?: boolean      // default: true
showHome?: boolean      // default: true
onBack?: () => void     // 省略時: router.back()
onHome?: () => void     // 省略時: router.push({ name: 'home' })
```

**右側の追加ボタンについて（設計方針）**:
NoteDetailView は AppHeader の右端にホームアイコンに加え編集・削除ボタンを配置する必要がある。スロットは追加しない（YAGNI）。AppHeader の右端に Vue の `<slot name="actions" />` を設けて NoteDetailView 側から渡す方式を採用する。他の View はこのスロットを使用しない。
