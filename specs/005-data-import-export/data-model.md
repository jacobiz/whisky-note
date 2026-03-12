# Data Model: データ インポート・エクスポート機能

**Branch**: `005-data-import-export` | **Date**: 2026-03-12

---

## 既存エンティティ（変更なし）

このfeatureはIndexedDBのスキーマを変更しない。既存の`TastingNote`・`BottleImage`テーブルは読み取り（エクスポート）と書き込み（インポート）のみで利用する。

---

## 新規型定義（in-memory / エクスポートファイル用）

### ExportNote

エクスポートJSONファイル内の個別ノートレコード。`TastingNote`のシリアライズ可能な表現。

| フィールド | 型 | 必須 | 説明 |
|-----------|-----|------|------|
| `id` | `string` | ✅ | UUID v4（インポート時の重複判定に使用） |
| `brandName` | `string` | ✅ | 銘柄名（最大100文字） |
| `distillery` | `string \| undefined` | — | 蒸留所 |
| `vintage` | `string \| undefined` | — | ヴィンテージ |
| `appearance` | `string \| undefined` | — | 外観 |
| `nose` | `string \| undefined` | — | 香り |
| `palate` | `string \| undefined` | — | 味わい |
| `finish` | `string \| undefined` | — | 余韻 |
| `rating` | `number \| undefined` | — | 総合評価（0–100） |
| `notes` | `string \| undefined` | — | フリーメモ |
| `createdAt` | `string` | ✅ | ISO 8601形式（Dateをシリアライズ） |
| `updatedAt` | `string` | ✅ | ISO 8601形式 |
| `image` | `ExportImage \| null` | — | ボトル写真（写真なし時は`null`または省略） |

### ExportImage

ボトル写真のBase64表現。

| フィールド | 型 | 必須 | 説明 |
|-----------|-----|------|------|
| `mimeType` | `string` | ✅ | `"image/jpeg"` または `"image/webp"` |
| `data` | `string` | ✅ | `data:<mimeType>;base64,...` 形式のdata URL |

### ExportData

エクスポートJSONファイルのルートオブジェクト。

| フィールド | 型 | 必須 | 説明 |
|-----------|-----|------|------|
| `version` | `number` | ✅ | フォーマットバージョン（現在は`1`） |
| `exportedAt` | `string` | ✅ | エクスポート実行日時（ISO 8601） |
| `notes` | `ExportNote[]` | ✅ | ノート配列（0件の場合は空配列`[]`） |

### ImportResult

インポート処理の結果を表す。

| フィールド | 型 | 説明 |
|-----------|-----|------|
| `added` | `number` | 追加されたノートの件数 |
| `skipped` | `number` | 重複のためスキップされた件数 |
| `errors` | `string[]` | 処理中のエラーメッセージ（通常は空） |

---

## バリデーションルール（インポート時）

1. **ファイル構造検証**: `version`・`notes`フィールドの存在確認
2. **バージョン検証**: `version > 1`の場合はエラー（未対応バージョン）
3. **ノート検証**: 各ノートに`id`・`brandName`・`createdAt`・`updatedAt`が存在すること
4. **重複判定**: `TastingNote.id`がIndexedDBに存在する場合はスキップ
5. **画像バリデーション**: `image.data`が有効なdata URLであること（不正な場合は写真なしとして処理）

---

## ファイル名規則

エクスポートファイル名: `whisky-note-export-YYYYMMDD.json`
- 例: `whisky-note-export-20260312.json`
- 日付はエクスポート実行時のローカル日付（`YYYY-MM-DD`形式をハイフンなし`YYYYMMDD`に変換）

---

## i18nキー（追加分）

`src/i18n/locales/ja.json` / `en.json` の `settings` セクションに追加：

| キー | 日本語 | 英語 |
|-----|--------|------|
| `settings.dataManagement` | `データ管理` | `Data Management` |
| `settings.exportData` | `データをエクスポート` | `Export Data` |
| `settings.exportDescription` | `全ノートをJSONファイルとして保存` | `Save all notes as a JSON file` |
| `settings.importData` | `データをインポート` | `Import Data` |
| `settings.importDescription` | `エクスポートしたJSONファイルを読み込む` | `Load a previously exported JSON file` |

`src/i18n/locales/ja.json` / `en.json` に `import` セクションを追加：

| キー | 日本語 | 英語 |
|-----|--------|------|
| `import.confirmTitle` | `インポートの確認` | `Confirm Import` |
| `import.confirmMessage` | `{total}件のノートを追加します（{skipped}件は既に存在するためスキップ）。続行しますか？` | `Add {total} note(s) ({skipped} will be skipped as duplicates). Continue?` |
| `import.confirmButton` | `追加する` | `Add` |
| `import.cancelButton` | `キャンセル` | `Cancel` |
| `import.successMessage` | `{added}件のノートを追加しました（{skipped}件スキップ）` | `Added {added} note(s) ({skipped} skipped)` |
| `import.errorInvalidFile` | `有効なエクスポートファイルではありません` | `Invalid export file` |
| `import.errorUnsupportedVersion` | `未対応のファイルバージョンです` | `Unsupported file version` |
| `import.errorReadFailed` | `ファイルの読み込みに失敗しました` | `Failed to read file` |
| `import.noNotes` | `インポート可能なノートがありません` | `No notes to import` |

`src/i18n/locales/ja.json` / `en.json` に `export` セクションを追加：

| キー | 日本語 | 英語 |
|-----|--------|------|
| `export.successMessage` | `エクスポートが完了しました` | `Export completed` |
| `export.errorFailed` | `エクスポートに失敗しました` | `Export failed` |
