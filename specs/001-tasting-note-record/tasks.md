# Tasks: ウィスキーテイスティングノート記録

**Input**: Design documents from `/specs/001-tasting-note-record/`
**Prerequisites**: plan.md ✅ / spec.md ✅ / research.md ✅ / data-model.md ✅

**テスト方針**: 憲法原則 II（テストファースト・NON-NEGOTIABLE）に従い、各ユーザーストーリーでテストを実装より先に記述する。TDD サイクル（Red → Green → Refactor）を厳守すること。

## Format: `[ID] [P?] [Story] Description`

- **[P]**: 並列実行可（異なるファイル、依存関係なし）
- **[Story]**: 対応するユーザーストーリー（US1 / US2 / US3）
- ファイルパスは必ず記述すること

---

## Phase 1: Setup（プロジェクト初期化）

**Purpose**: Vue 3 + Vite + TypeScript プロジェクトの土台を構築する

- [X] T001 `npm create vite@latest . -- --template vue-ts` でプロジェクトを初期化し、`package.json` に必要な依存パッケージを追加する（vue-router, pinia, dexie, vue-i18n, browser-image-compression, vite-plugin-pwa）
- [X] T002 Tailwind CSS をセットアップし、ダークテーマ（黒/ネイビー）と金色アクセント（`#B8860B`）のカスタムカラーを `tailwind.config.ts` に定義する。`src/assets/styles/main.css` でダークモード（`class` 戦略）を設定する
- [X] T003 [P] ESLint（`@typescript-eslint`）と Prettier を `eslint.config.ts` / `.prettierrc` に設定する
- [X] T004 [P] Vitest と `@testing-library/vue` を `vitest.config.ts` に設定する（jsdom 環境・カバレッジ設定含む）
- [X] T005 [P] `vite-plugin-pwa` を `vite.config.ts` に設定し、`public/manifest.json`（name: "Whisky Note"、テーマカラー設定）を作成する
- [X] T006 [P] Vue Router 4 を `src/router/index.ts` に設定する（`/`・`/notes/new`・`/notes/:id`・`/notes/:id/edit`・`/settings` のルート定義）
- [X] T007 [P] Pinia を `src/main.ts` に登録し、`src/App.vue` で `<RouterView>` を配置するアプリルートを構成する

---

## Phase 2: Foundational（全ストーリー共通基盤）

**Purpose**: 全ユーザーストーリーが依存する DB スキーマ・型定義・i18n の骨格を確立する

**⚠️ CRITICAL**: このフェーズが完了するまでユーザーストーリーの実装を開始しないこと

- [X] T008 TypeScript エンティティ型を `src/db/types.ts` に定義する（`TastingNote` / `BottleImage` / `Draft` / `AppSettings` インターフェース。data-model.md のフィールド・制約を忠実に反映）
- [X] T009 Dexie.js データベースクラスを `src/db/index.ts` に実装する（`WhiskyNoteDB`、4テーブル定義: `tastingNotes`（index: `createdAt`）/ `bottleImages`（index: `noteId`）/ `drafts` / `settings`。UUID は `crypto.randomUUID()` で生成）
- [X] T010 [P] 日本語翻訳ファイルの骨格を `src/i18n/locales/ja.json` に作成する（全 UI セクションのキー定義: common / notes / form / errors）
- [X] T011 [P] 英語翻訳ファイルの骨格を `src/i18n/locales/en.json` に作成する（ja.json と同一キー構造）
- [X] T012 vue-i18n インスタンスを `src/i18n/index.ts` に設定する（端末ロケール自動検出・未対応言語は `en` フォールバック・`useI18n()` エクスポート）

**Checkpoint**: DB スキーマ・型・i18n 骨格が揃った。ユーザーストーリーの実装を開始できる。

---

## Phase 3: User Story 1 - テイスティングノートの新規作成（Priority: P1）🎯 MVP

**Goal**: ウィスキーテイスティングノートの作成・一覧表示・編集・削除が完全に動作する

**Independent Test**: 銘柄名・外観・香り・味わい・余韻・評価・メモを入力して保存し、一覧に最新順で表示され、編集・削除（確認ダイアログ）が動作することを確認する

### テスト（実装より先に作成し、失敗することを確認する）⚠️ TDD

- [X] T013 [P] [US1] `tests/unit/stores/notes.test.ts` に notes Pinia ストアの単体テストを作成する（create / update / delete / list 降順ソート / 銘柄名バリデーション のケース）
- [X] T014 [P] [US1] `tests/unit/stores/draft.test.ts` に draft Pinia ストアの単体テストを作成する（自動保存 / アプリ再起動後の復元 / 新規作成時の上書き のケース）
- [X] T015 [P] [US1] `tests/components/NoteForm.test.ts` に NoteForm コンポーネントテストを作成する（銘柄名必須バリデーション / 各フィールド 1,000 文字制限 / 保存ボタン制御 のケース）
- [X] T016 [P] [US1] `tests/components/NoteList.test.ts` に NoteList コンポーネントテストを作成する（空リスト表示 / 複数ノートの降順表示 / 削除確認ダイアログ のケース）
- [X] T017 [US1] `tests/integration/note-lifecycle.test.ts` にノートライフサイクルの結合テストを作成する（新規作成 → 一覧確認 → 編集 → 削除 の一連フロー）

### 実装

- [X] T018 [P] [US1] notes Pinia ストアを `src/stores/notes.ts` に実装する（TastingNote CRUD・一覧降順取得・銘柄名バリデーション・BottleImage カスケード削除）
- [X] T019 [P] [US1] draft Pinia ストアを `src/stores/draft.ts` に実装する（入力変更時の自動保存・IndexedDB との同期・新規作成時の上書き・正式保存後の削除）
- [X] T020 [US1] NoteForm コンポーネントを `src/components/NoteForm.vue` に実装する（全フィールド入力 UI・銘柄名必須バリデーション・各フィールド 1,000 文字カウンター表示・下書き自動保存連携）
- [X] T021 [P] [US1] NoteCard コンポーネントを `src/components/NoteCard.vue` に実装する（サムネイル画像表示エリア・銘柄名・評価・記録日時の表示。ダークテーマ・金色アクセント適用）
- [X] T022 [US1] NoteList コンポーネントを `src/components/NoteList.vue` に実装する（NoteCard のリスト表示・空リスト状態の表示・削除ボタン）
- [X] T023 [P] [US1] DeleteConfirmDialog コンポーネントを `src/components/DeleteConfirmDialog.vue` に実装する（確認メッセージ・承認/キャンセルボタン・ダークテーマ対応）
- [X] T024 [US1] HomeView を `src/views/HomeView.vue` に実装する（NoteList 表示・新規作成ボタン・ヘッダー）
- [X] T025 [US1] NoteCreateView を `src/views/NoteCreateView.vue` に実装する（NoteForm 配置・保存後に HomeView へリダイレクト・下書き復元）
- [X] T026 [US1] NoteEditView を `src/views/NoteEditView.vue` に実装する（既存ノートデータを NoteForm に注入・保存後に NoteDetailView へリダイレクト）
- [X] T027 [P] [US1] NoteDetailView を `src/views/NoteDetailView.vue` に実装する（各フィールドの読み取り専用表示・編集ボタン・削除ボタン + DeleteConfirmDialog 連携）

**Checkpoint**: US1 完了。ノートの作成・一覧・編集・削除が独立して動作することを T017 の結合テストで確認する。

---

## Phase 4: User Story 2 - ボトル画像の登録（Priority: P2）

**Goal**: カメラ/フォトライブラリからボトル画像を選択し、500KB 以下に圧縮してノートのサムネイルとして登録・表示できる

**Independent Test**: ノート作成時に画像を選択し、一覧・詳細画面にサムネイルが表示され、画像の変更・削除が動作することを確認する

### テスト（実装より先に作成し、失敗することを確認する）⚠️ TDD

- [X] T028 [P] [US2] `tests/unit/composables/useImageCompression.test.ts` に useImageCompression の単体テストを作成する（500KB 超の画像が圧縮されること / 500KB 以下の画像はそのまま通ること / 破損ファイルのエラーハンドリング のケース）
- [X] T029 [P] [US2] `tests/components/ImagePicker.test.ts` に ImagePicker コンポーネントテストを作成する（カメラ/ライブラリ選択の UI / 権限拒否時のエラーメッセージ / 画像選択後のプレビュー表示 のケース）
- [X] T030 [US2] `tests/integration/image-registration.test.ts` に画像登録の結合テストを作成する（画像選択 → 圧縮 → ノートへの紐付け → 一覧サムネイル表示 の一連フロー）

### 実装

- [X] T031 [P] [US2] useImageCompression composable を `src/composables/useImageCompression.ts` に実装する（browser-image-compression を使用・maxSizeMB: 0.5・useWebWorker: true・エラーハンドリング）
- [X] T032 [P] [US2] useCamera composable を `src/composables/useCamera.ts` に実装する（`<input type="file" accept="image/*" capture="environment">` を使ったカメラ/ライブラリ選択・権限エラーハンドリング）
- [X] T033 [US2] ImagePicker コンポーネントを `src/components/ImagePicker.vue` に実装する（カメラ撮影/ライブラリ選択の UI・選択後プレビュー表示・画像削除ボタン）
- [X] T034 [US2] NoteForm に ImagePicker を統合する（`src/components/NoteForm.vue` を更新：ImagePicker を配置・選択画像を圧縮して notes ストアに渡す）
- [X] T035 [US2] notes ストアに BottleImage CRUD を追加する（`src/stores/notes.ts` を更新：画像の保存・取得・更新・削除。TastingNote 削除時のカスケード削除）
- [X] T036 [P] [US2] NoteCard にサムネイル表示を追加する（`src/components/NoteCard.vue` を更新：BottleImage の blob を ObjectURL に変換して `<img>` タグで表示。画像なし時のプレースホルダー表示）
- [X] T037 [P] [US2] NoteDetailView に画像表示を追加する（`src/views/NoteDetailView.vue` を更新：ボトル画像を上部に表示）

**Checkpoint**: US2 完了。画像登録・表示・変更・削除が独立して動作することを T030 の結合テストで確認する。

---

## Phase 5: User Story 3 - 日本語／英語の切り替え（Priority: P3）

**Goal**: 端末ロケール自動検出と手動切り替えにより、全 UI が日本語/英語で表示される

**Independent Test**: 言語を日本語 → 英語に切り替え、全 UI ラベル・エラーメッセージが英語に切り替わり、設定が再起動後も保持されることを確認する

### テスト（実装より先に作成し、失敗することを確認する）⚠️ TDD

- [X] T038 [P] [US3] `tests/unit/stores/settings.test.ts` に settings Pinia ストアの単体テストを作成する（言語設定の保存・IndexedDB 永続化・再起動後の復元 のケース）
- [X] T039 [P] [US3] `tests/unit/i18n/locale-detection.test.ts` にロケール自動検出のテストを作成する（日本語ロケール → ja / 英語ロケール → en / 未対応ロケール → en フォールバック のケース）
- [X] T040 [US3] `tests/integration/language-switching.test.ts` に言語切り替えの結合テストを作成する（設定変更後 1 秒以内に全 UI が切り替わること / 設定が次回起動後も保持されること / **ユーザーが入力済みのテイスティングコメントが言語切り替え後も変更されないこと**（FR-009））

### 実装

- [X] T041 [P] [US3] settings Pinia ストアを `src/stores/settings.ts` に実装する（language の読み書き・AppSettings への IndexedDB 永続化・初期化時の端末ロケール自動検出）
- [X] T042 [US3] `src/i18n/locales/ja.json` に全 UI テキストの翻訳キーを記入する（common: ボタン類 / notes: ノート項目ラベル（外観・香り・味わい・余韻など）/ form: プレースホルダー / errors: バリデーションメッセージ）
- [X] T043 [US3] `src/i18n/locales/en.json` に全 UI テキストの翻訳キーを記入する（ja.json と同一キー構造。Appearance / Nose / Palate / Finish など英語テイスティング用語を使用）
- [X] T044 [US3] `src/i18n/index.ts` を更新して settings ストアと連携させる（settings.language の変更を `locale.value` に反映・初回ロケール自動検出ロジック）
- [X] T045 [P] [US3] LanguageToggle コンポーネントを `src/components/LanguageToggle.vue` に実装する（日本語/English の切り替えボタン・現在の言語を強調表示）
- [X] T046 [US3] SettingsView を `src/views/SettingsView.vue` に実装する（LanguageToggle を配置・設定画面のレイアウト）
- [X] T047 [US3] NoteForm に i18n キーを適用する（`src/components/NoteForm.vue` を更新：全ラベル・プレースホルダー・エラーメッセージを `t()` に置換）
- [X] T048 [US3] NoteList・NoteCard・DeleteConfirmDialog に i18n キーを適用する（各コンポーネントの日本語ハードコード文字列を `t()` に置換）
- [X] T049 [US3] HomeView・NoteDetailView・SettingsView の i18n を完成させる（全テキストを `t()` に置換・SettingsView へのナビゲーションを追加）

**Checkpoint**: US3 完了。言語切り替えが全 UI に反映されることを T040 の結合テストで確認する。

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: PWA 要件・パフォーマンス・デザイン品質の最終仕上げ

- [X] T050 [P] PWA アイコンセットを `public/icons/` に配置し、`manifest.json` の `icons` 配列を更新する（192px・512px・maskable 各サイズ）
- [X] T051 [P] Tailwind CSS のデザイントークンを精査する（`tailwind.config.ts` のカラーパレット・フォント・シャドウ設定を高級感のあるデザインに調整）
- [X] T052 Workbox Service Worker のオフラインキャッシュ戦略を確認する（`vite.config.ts` の workbox 設定でアプリシェルをプリキャッシュ・オフライン動作を手動検証）
- [X] T053 [P] Lighthouse PWA 監査を実行し、スコア 90 以上を達成する（不足項目を修正）
- [X] T054 [P] `npm test -- --coverage` を実行し、カバレッジレポートを確認する（主要ストア・コンポーネントのカバレッジ目標: 80% 以上）46テスト全PASS
- [ ] T055 500件ノートでの一覧表示パフォーマンスを検証する（SC-003: 1.5秒以内の要件確認。必要に応じて仮想スクロールを検討）
- [ ] T056 [P] 新規ノート作成の所要時間を手動シナリオテストで検証する（SC-001: 銘柄名・各フィールド・評価を入力して保存完了まで 2 分以内であること）
- [ ] T057 [P] ボトル画像の登録所要時間を手動シナリオテストで検証する（SC-002: 画像選択から保存完了まで 30 秒以内であること）

---

## Dependencies & Execution Order

### フェーズ間の依存関係

- **Phase 1（Setup）**: 依存なし — 即座に開始可能
- **Phase 2（Foundational）**: Phase 1 の完了が必要 — **全ユーザーストーリーをブロック**
- **Phase 3（US1）**: Phase 2 の完了が必要
- **Phase 4（US2）**: NoteForm・NoteCard を拡張するため US1 実装後を推奨するが、US2 のテスト（T028–T030）は US1 コンポーネントをモックすれば独立して実行可能
- **Phase 5（US3）**: Phase 2 の完了が必要（Phase 3・4 と並行可能だが i18n キーの後付けが発生）
- **Phase 6（Polish）**: 全ユーザーストーリーの完了が必要

### ユーザーストーリー内の順序

```
[P] テストを作成（失敗確認）
      ↓
[P] モデル・ストア実装（テスト通過）
      ↓
コンポーネント実装（ストアに依存）
      ↓
ビュー（コンポーネントに依存）
      ↓
Checkpoint: 結合テストで独立動作を確認
```

### 並列実行の機会

- Phase 1: T003 / T004 / T005 / T006 / T007 は並列実行可
- Phase 2: T010 / T011 は並列実行可
- Phase 3 テスト群: T013 / T014 / T015 / T016 は並列実行可
- Phase 3 実装: T018 / T019 は並列実行可。T021 / T023 / T024 は並列実行可

---

## Parallel Example: User Story 1

```bash
# テスト群を並列作成（全て失敗することを確認）:
T013: tests/unit/stores/notes.test.ts
T014: tests/unit/stores/draft.test.ts
T015: tests/components/NoteForm.test.ts
T016: tests/components/NoteList.test.ts

# ストアを並列実装（テストが通過することを確認）:
T018: src/stores/notes.ts
T019: src/stores/draft.ts
```

---

## Implementation Strategy

### MVP First（User Story 1 のみ）

1. Phase 1: Setup を完了
2. Phase 2: Foundational を完了（**全ストーリーをブロック**）
3. Phase 3: User Story 1 を完了
4. **STOP & VALIDATE**: ノートの CRUD が単独で動作することを確認
5. デモ・レビュー可能な状態

### Incremental Delivery

1. Setup + Foundational → 基盤完成
2. US1 完了 → MVP デモ可能（テキストのみのテイスティングノート）
3. US2 完了 → 画像付きノートでデモ
4. US3 完了 → 多言語対応でデモ
5. Polish → Lighthouse PWA ≥90 達成

---

## バグ修正記録（実装後の手動検証で発見）

- **BUG-001** [修正済み] `HomeView.vue` の FAB が表示されない → `note-new`（存在しないルート名）を `note-create` に修正
- **BUG-002** [修正済み] 画像圧縮中に保存ボタンを押すと未保存のまま遷移する → `ImagePicker` が `update:compressing` イベントを emit し、`NoteForm` が圧縮中は保存ボタンを `disabled` にするよう修正（FR-016 として spec.md に追記）

---

## Notes

- `[P]` タスク = 異なるファイル・依存関係なしで並列実行可
- `[US?]` ラベルでタスクとユーザーストーリーのトレーサビリティを確保
- **テストは必ず実装より先に書き、Red を確認してから Green にすること（憲法原則 II）**
- コミットは 1 タスク = 1 コミットを目安とする
- 各 Checkpoint でユーザーストーリーの独立動作を確認してから次フェーズへ進む
- 憲法違反を発見した場合は `plan.md` の Complexity Tracking に記録し、ユーザーに報告すること
