# Tasks: データ インポート・エクスポート機能

**Input**: Design documents from `/specs/005-data-import-export/`
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅

**Tests**: TDD（Red → Green）— 憲法原則IIに従い実装前にテストを記述

**Organization**: US1（エクスポート）→ US2（インポート）の順で独立実装可能

## Format: `[ID] [P?] [Story] Description`

- **[P]**: 並列実行可（別ファイル、依存なし）
- **[Story]**: 対象ユーザーストーリー（US1/US2）

---

## Phase 1: Setup（i18nキー追加）

**Purpose**: 両ユーザーストーリーで共通使用するi18nキーを追加

- [X] T001 `src/i18n/locales/ja.json` の `settings` セクションに `dataManagement`/`exportData`/`exportDescription`/`importData`/`importDescription` キーを追加し、`import` セクション（confirmTitle/confirmMessage/confirmButton/cancelButton/successMessage/errorInvalidFile/errorUnsupportedVersion/errorReadFailed/noNotes）と `export` セクション（successMessage/errorFailed）を新規追加（data-model.md参照）
- [X] T002 [P] `src/i18n/locales/en.json` に T001 と同じキー構成を英語で追加

---

## Phase 2: Foundational（型定義・共有基盤）

**Purpose**: US1・US2 両方が依存するコンポーザブルの骨格を作成

⚠️ **CRITICAL**: このフェーズ完了後に US1/US2 の実装を開始すること

- [X] T003 `src/composables/useImportExport.ts` を新規作成し、`ExportData`/`ExportNote`/`ExportImage`/`ImportResult` 型定義と `useImportExport()` 関数の骨格（空の `exportData`/`previewImport`/`executeImport` 関数と `isExporting`/`isImporting` ref）を追加（plan.md の「useImportExport コンポーザブル API」参照）

**Checkpoint**: 型定義完了 — US1・US2 の実装開始可能

---

## Phase 3: User Story 1 — テイスティングノートのエクスポート (Priority: P1) 🎯 MVP

**Goal**: 設定画面から全ノート（写真含む）をJSONファイルとしてダウンロードできる

**Independent Test**: エクスポートボタンを押してJSONファイルがダウンロードされ、全ノートの情報が含まれていることを確認

### TDD Red（先にテストを書き、失敗を確認する）

- [X] T004 [US1] `tests/composables/useImportExport.test.ts` を新規作成し、以下の失敗テストを記述: (1) exportData() 呼び出し後に isExporting が false に戻る (2) 全ノートが ExportNote 形式（id/brandName/createdAt/updatedAt/ISO8601）に変換される (3) 写真ありノートの image.data が "data:" で始まる Base64 data URL になる (4) 写真なしノートの image が null になる (5) ノート0件でも正常に空配列 notes: [] を含むJSONが生成される (6) 生成されるファイル名が `whisky-note-export-YYYYMMDD.json` 形式になる

### TDD Green（実装して全テストをパスさせる）

- [X] T005 [US1] `src/composables/useImportExport.ts` の `exportData()` を実装: `db.tastingNotes.toArray()` でノート一覧取得 → 写真ありノートは `db.bottleImages.get(imageId)` で Blob 取得 → `FileReader.readAsDataURL()` で Base64 変換（Promise化）→ `ExportData` オブジェクト生成（version:1, exportedAt:ISO8601, notes配列）→ `JSON.stringify()` → Blob → `URL.createObjectURL()` → 一時 `<a download>` 要素クリックでダウンロード → `URL.revokeObjectURL()` でクリーンアップ
- [X] T006 [US1] `src/views/SettingsView.vue` に「データ管理」セクション（`bg-surface-elevated border border-gold-muted rounded-xl`）を追加し、「データをエクスポート」ボタン（クリックで `exportData()` 呼び出し、`isExporting` 中はローディング表示）を実装

**Checkpoint**: US1 完了 — エクスポートボタンが動作し、JSONファイルがダウンロードされる

---

## Phase 4: User Story 2 — テイスティングノートのインポート (Priority: P2)

**Goal**: エクスポートしたJSONファイルを読み込んでノートを復元できる（確認ダイアログ付きマージ動作）

**Independent Test**: エクスポートJSONをインポートして元のノートが一覧に追加されることを確認

### TDD Red（先にテストを書き、失敗を確認する）

- [X] T007 [US2] `tests/composables/useImportExport.test.ts` にインポート機能テストを追加（失敗するテスト）: (1) previewImport() が正常なJSONファイルを受け取り { total, skipped, notes } を返す (2) previewImport() が不正なJSONでエラーをthrow (3) previewImport() が version > 1 のファイルでエラーをthrow (4) previewImport() が必須フィールド（id/brandName）欠損ノートをスキップし errors に追加 (5) executeImport() が既存IDのノートをスキップして skipped をカウント (6) executeImport() が新規ノートをDBに追加して added をカウントを返す (7) executeImport() が写真ありノートの image を Blob に変換して bottleImages に保存し noteId/imageId をリンクする
- [X] T008 [P] [US2] `tests/components/ImportConfirmDialog.test.ts` を新規作成（失敗するテスト）: (1) visible=false で表示されない (2) visible=true でダイアログが表示される (3) totalCount/skippedCount が i18n テンプレートに挿入されて表示される (4) 確認ボタンクリックで confirm イベントが発火する (5) キャンセルボタンクリックで cancel イベントが発火する

### TDD Green（実装して全テストをパスさせる）

- [X] T009 [US2] `src/composables/useImportExport.ts` に `previewImport(file: File)` を実装: `FileReader.readAsText()` → `JSON.parse()` → version チェック（>1でエラー）→ notes 配列の構造バリデーション → `db.tastingNotes.bulkGet(ids)` で重複確認 → `{ total, skipped, notes }` 返却
- [X] T010 [US2] `src/composables/useImportExport.ts` に `executeImport(notes: ExportNote[])` を実装: 各ノートの重複チェック（スキップ）→ 写真あり場合は `fetch(image.data).then(r=>r.blob())` で Blob 変換 → `db.bottleImages.add()` で写真保存 → `db.tastingNotes.add()` でノート保存（createdAt/updatedAt は ISO8601文字列から Date に変換）→ `ImportResult` 返却
- [X] T011 [US2] `src/components/ImportConfirmDialog.vue` を新規作成: Props（visible: boolean, totalCount: number, skippedCount: number）、Emits（confirm, cancel）、`t('import.confirmMessage', { total: totalCount, skipped: skippedCount })` を表示、確認/キャンセルボタン付きモーダルUI（DeleteConfirmDialog.vue のスタイルパターン踏襲）
- [X] T012 [US2] `src/views/SettingsView.vue` にインポートUIを追加: 非表示 `<input type="file" accept=".json" ref>` + 「データをインポート」ボタン（クリックでinputトリガー）→ ファイル選択時に `previewImport()` 呼び出し → `ImportConfirmDialog` で確認 → `executeImport()` 実行 → 結果をダイアログで通知

**Checkpoint**: US2 完了 — ファイル選択 → 確認ダイアログ → インポート → 結果通知のフローが動作する

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: エッジケース補完・エラーハンドリング強化

- [X] T013 `tests/composables/useImportExport.test.ts` にエッジケーステストを追加: (1) エクスポート中のエラー（DB読み込み失敗）で isExporting が false に戻る (2) インポートファイルが notes フィールドを持たない場合のエラー (3) 全ノートが重複（added:0, skipped:N）の場合の正常終了 (4) 写真の Base64 data URL が不正な場合、写真なしとして処理される
- [X] T014 [P] `src/views/SettingsView.vue` のエクスポート・インポートボタンに `isExporting`/`isImporting` 中の disabled 状態を追加し、多重クリックを防止する
- [X] T015 [P] エクスポート完了時のユーザーフィードバック（`t('export.successMessage')` の一時表示）を SettingsView.vue に追加

---

## Dependencies & Execution Order

### フェーズ依存関係

- **Setup (Phase 1)**: 依存なし — 即時開始可能
- **Foundational (Phase 2)**: Phase 1 完了後
- **US1 (Phase 3)**: Phase 2 完了後
- **US2 (Phase 4)**: Phase 2 完了後（US1 と並列可）
- **Polish (Phase 5)**: US1 と US2 の両方が完了後

### ユーザーストーリー間の依存

- **US1（エクスポート）**: Phase 2 完了後に開始可能。US2 に依存しない
- **US2（インポート）**: Phase 2 完了後に開始可能。US1 と独立してテスト可能

### 各フェーズ内の順序

1. TDD Red テストを先に書いてテストが**失敗することを確認**
2. 実装して全テストが通過することを確認
3. Refactor（必要に応じて）

---

## Parallel Example: US1

```bash
# US1 の TDD サイクル:
Task T004: テスト作成（失敗確認）
→ Task T005: composable 実装（テスト通過）
→ Task T006: SettingsView UI 追加（統合確認）
```

## Parallel Example: US2

```bash
# US2 の TDD サイクル（T007/T008 は並列可）:
Task T007: composable テスト追加（並列開始可）
Task T008 [P]: ダイアログテスト作成（並列開始可）
→ T009: previewImport 実装
→ T010: executeImport 実装
→ T011: ImportConfirmDialog 作成
→ T012: SettingsView UI 統合
```

---

## Implementation Strategy

### MVP（US1 のみ）

1. Phase 1: Setup（T001-T002）
2. Phase 2: Foundational（T003）
3. Phase 3: US1 TDD（T004 → T005 → T006）
4. **STOP & VALIDATE**: エクスポート機能を動作確認

### フル実装

1. Setup + Foundational → 基盤完成
2. US1 完成 → MVP デモ可能
3. US2 完成 → フル機能
4. Polish → 品質向上

---

## Notes

- TDD 必須: テストが**赤（失敗）**であることを確認してから実装を開始すること
- 憲法原則 II（テストファースト）は非交渉的
- [P] タスクは別ファイルを操作するため並列実行可
- US1/US2 の SettingsView.vue 変更は同一ファイルのため順次実行（T006 → T012）
- 写真変換は非同期（FileReader）— テストはモックで対応
- `DB`モックは `vi.mock('@/db', ...)` パターンで既存テストと統一
