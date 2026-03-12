# Implementation Plan: データ インポート・エクスポート機能

**Branch**: `005-data-import-export` | **Date**: 2026-03-12 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/005-data-import-export/spec.md`

## Summary

設定画面にデータ管理セクションを追加し、全テイスティングノート（ボトル写真含む）をJSONファイルとしてエクスポート・インポートできる機能を実装する。写真はBase64 data URLとしてJSONに埋め込む。ロジックは`useImportExport`コンポーザブルに集約し、UIはSettingsViewに追加する。

## Technical Context

**Language/Version**: TypeScript 5.x / Vue 3 (Composition API)
**Primary Dependencies**: Pinia 2, vue-i18n v9, Dexie.js 4（IndexedDB — 既存）
**Storage**: IndexedDB（既存スキーマを読み書きのみ利用。スキーマ変更なし）
**Testing**: Vitest + @testing-library/vue（既存）
**Target Platform**: PWA / モバイルブラウザ（iOS Safari / Chrome Android）
**Project Type**: PWA（mobile-first）
**Performance Goals**: 写真なし100件エクスポート3秒以内・インポート5秒以内（SC-001/SC-002）
**Constraints**: オフライン動作必須、外部ライブラリ追加なし（Base64変換はブラウザ標準API使用）
**Scale/Scope**: 最大数百件のノート（写真なし想定）。写真ありはローディング表示で対応

## Constitution Check

| 原則 | 状態 | 備考 |
|------|------|------|
| I. ローカルファースト | ✅ PASS | エクスポート・インポートはすべてローカル処理。外部通信なし |
| II. テストファースト | ✅ PASS | TDD（Red→Green）でコンポーザブル・コンポーネントを実装 |
| III. シンプル設計 | ✅ PASS | Repositoryパターン・Factoryなし。コンポーザブル1ファイルのみ |
| IV. モバイル最適化 | ✅ PASS | `<input type="file">`・Blob+`<a download>`はiOS Safariで動作確認済み |
| V. 日本語コミュニケーション | ✅ PASS | 全ドキュメント・コメントは日本語 |

**Constitution violations**: なし

## Project Structure

### Documentation (this feature)

```text
specs/005-data-import-export/
├── plan.md              # このファイル
├── research.md          # 技術決定の根拠
├── data-model.md        # エクスポート型定義・i18nキー
└── tasks.md             # タスクリスト（/speckit.tasks で生成）
```

### Source Code (追加・変更ファイル)

```text
src/
├── composables/
│   └── useImportExport.ts      # [NEW] エクスポート・インポートロジック
├── components/
│   └── ImportConfirmDialog.vue # [NEW] インポート確認ダイアログ
└── views/
    └── SettingsView.vue        # [MODIFY] データ管理セクション追加

src/i18n/locales/
├── ja.json                     # [MODIFY] settings.dataManagement 等追加
└── en.json                     # [MODIFY] 同上

tests/
├── composables/
│   └── useImportExport.test.ts # [NEW] コンポーザブルのテスト
└── components/
    └── ImportConfirmDialog.test.ts # [NEW] ダイアログのテスト
```

**Structure Decision**: 既存の`src/composables/`パターンを踏襲。スキーマ変更なし。

## Complexity Tracking

> 憲法違反なし。記録不要。

## Phase 0: Research（完了）

→ [research.md](./research.md) 参照

主要決定:
1. JSON + Base64写真埋め込み（外部ライブラリなし）
2. `Blob + <a download>`でブラウザダウンロード
3. `<input type="file">`でインポートファイル選択
4. `src/composables/useImportExport.ts`にロジック集約
5. SettingsView.vue に「データ管理」セクション追加
6. `ImportConfirmDialog.vue` を新規作成（DeleteConfirmDialogパターン踏襲）

## Phase 1: Design（完了）

→ [data-model.md](./data-model.md) 参照

### エクスポートファイル仕様

```typescript
interface ExportData {
  version: 1
  exportedAt: string        // ISO 8601
  notes: ExportNote[]
}

interface ExportNote {
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
  createdAt: string         // ISO 8601
  updatedAt: string         // ISO 8601
  image?: { mimeType: string; data: string } | null  // Base64 data URL
}

interface ImportResult {
  added: number
  skipped: number
  errors: string[]
}
```

### `useImportExport` コンポーザブル API

```typescript
// src/composables/useImportExport.ts
export function useImportExport() {
  const isExporting = ref(false)
  const isImporting = ref(false)

  // 全ノートをJSONファイルとしてダウンロード
  async function exportData(): Promise<void>

  // JSONファイルを解析してプレビュー情報を取得（確認ダイアログ用）
  async function previewImport(file: File): Promise<{ total: number; skipped: number; notes: ExportNote[] }>

  // 確認後にインポートを実行
  async function executeImport(notes: ExportNote[]): Promise<ImportResult>

  return { isExporting, isImporting, exportData, previewImport, executeImport }
}
```

**分割理由**: `previewImport`でファイル解析→確認ダイアログ表示→`executeImport`でDB書き込みの2ステップにすることで、確認ダイアログへの件数・スキップ数の受け渡しが自然になる。

### `ImportConfirmDialog.vue` Props

```typescript
interface Props {
  visible: boolean
  totalCount: number   // 追加予定件数（スキップ前）
  skippedCount: number // スキップ予定件数（重複）
}

interface Emits {
  confirm: []   // 続行
  cancel: []    // キャンセル
}
```

### SettingsView.vue 変更概要

「データ管理」セクションをLanguageToggleセクションと情報セクションの間に追加:
- 「データをエクスポート」ボタン（クリック → `exportData()`）
- 「データをインポート」ボタン（クリック → `<input type="file">`トリガー → `previewImport()` → 確認ダイアログ → `executeImport()`）

### i18n キー

→ [data-model.md](./data-model.md) 参照（`settings.*`・`import.*`・`export.*` セクション）

## 実装ステップ（/speckit.tasks で展開）

1. **Phase 1 - Setup**: i18nキー追加（ja.json / en.json）
2. **Phase 2 - US1 (エクスポート)**: `useImportExport`のエクスポート部分 → SettingsView UIの追加
3. **Phase 3 - US2 (インポート)**: `ImportConfirmDialog.vue` → `useImportExport`のインポート部分 → SettingsView UI統合
4. **Phase 4 - Polish**: エラーハンドリング・ローディング状態・エクスポートファイル名の日付フォーマット
