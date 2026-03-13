# Tasks: PWA強化 & ウィスキー用語辞典

**Input**: Design documents from `/specs/006-pwa-whisky-glossary/`
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅

**テストポリシー**: プロジェクト憲法 原則II（テストファースト）に従い、全タスクで TDD（Red → Green → Refactor）を徹底する。

## Format: `[ID] [P?] [Story] Description`

- **[P]**: 並列実行可能（異なるファイル、依存なし）
- **[Story]**: 対応するユーザーストーリー（US1〜US3）
- 各テストタスクは実装タスクの**前**に完了し、失敗を確認してから実装する

---

## Phase 1: Setup（共有基盤）

**Purpose**: フィーチャー全体で必要な設定変更と型定義

- [x] T001 `vite.config.ts` の `registerType` を `'autoUpdate'` から `'prompt'` に変更する
- [x] T002 [P] `index.html` に Apple Touch Icon・PWA メタタグ（`apple-mobile-web-app-capable`, `apple-mobile-web-app-status-bar-style`, `<link rel="apple-touch-icon">`）を追加する
- [x] T003 [P] `src/data/glossary.ts` に `GlossaryCategory`, `GlossaryTerm`, `GlossaryData` 型定義を作成する（`src/data/glossary.ts`）

---

## Phase 2: Foundational（ブロッキング前提条件）

**Purpose**: 全ユーザーストーリーで共有する composable・データ・i18n キーを準備する

**⚠️ CRITICAL**: このフェーズが完了するまでユーザーストーリーの実装を開始しない

- [x] T004 [P] `src/data/glossary.json` を作成する（60件の用語データ、`data-model.md` の用語一覧 + `docs/whisky-tasting.md` / `docs/whisky-tasting-en.md` から定義文を抽出）
- [x] T005 [P] `src/i18n/locales/ja.json` に `pwa`, `install`, `glossary` キーを追加する（`research.md` の plan.md フェーズ C-1 のキー一覧を参照）
- [x] T006 [P] `src/i18n/locales/en.json` に `pwa`, `install`, `glossary` キーを追加する（T005 と並行）
- [x] T007 `tests/composables/useGlossary.test.ts` を作成してテストを記述・失敗確認（検索・カテゴリフィルタ・複合フィルタ・全件返却の6テスト）
- [x] T008 `src/composables/useGlossary.ts` を実装して T007 のテストを通過させる（`src/data/glossary.json` を静的インポート、`searchQuery`, `selectedCategory`, `filteredTerms` を提供）

**Checkpoint**: Foundation ready — ユーザーストーリー実装を開始できる

---

## Phase 3: User Story 1 — アプリをホーム画面にインストールする (Priority: P1) 🎯 MVP

**Goal**: 設定画面に「ホーム画面に追加」ボタン（または iOS 案内）を表示し、ユーザーがアプリをインストールできる

**Independent Test**: `useInstallPrompt` を `vi.spyOn(window, 'addEventListener')` でモックし、`canInstall === true` のとき SettingsView にボタンが表示されることを確認できる

### テスト（実装前に記述・失敗確認）

- [x] T009 [P] [US1] `tests/composables/useInstallPrompt.test.ts` を作成してテストを記述・失敗確認（`beforeinstallprompt` 発火で `canInstall === true`、`promptInstall()` 呼び出し確認、`appinstalled` で `canInstall === false`、iOS UA で `isIos === true`、非 iOS で `isIos === false` の5テスト）

### 実装

- [x] T010 [US1] `src/composables/useInstallPrompt.ts` を実装して T009 のテストを通過させる（`beforeinstallprompt` / `appinstalled` イベントリスナー登録、`canInstall: ComputedRef<boolean>`, `isIos: Ref<boolean>`, `promptInstall()` を提供。`onUnmounted` でリスナー解除）
- [x] T011 [US1] `tests/views/SettingsView.test.ts` にインストールセクションのテストを追加・失敗確認（`canInstall === true` のときボタン表示、クリックで `promptInstall` 呼び出し、`isIos === true` のとき手順案内テキスト表示、両方 false のときセクション非表示の4テスト）
- [x] T012 [US1] `src/views/SettingsView.vue` に `useInstallPrompt` を注入し、「言語設定」セクション直前にインストールセクション（`v-if="canInstall || isIos"`）を追加して T011 のテストを通過させる

**Checkpoint**: User Story 1 完了 — SettingsView でインストールボタン・iOS 案内が表示される

---

## Phase 4: User Story 2 — ネットワーク未接続でもアプリを使用する (Priority: P1)

**Goal**: SW 更新トーストが表示され、ユーザーが手動でリロードできる。オフラインでも全画面が動作する。

**Independent Test**: `useRegisterSW` の `needRefresh` を `ref(true)` でモックし、App.vue に AppToast が表示されアクションクリックで `updateServiceWorker()` が呼ばれることを確認できる

### テスト（実装前に記述・失敗確認）

- [x] T013 [P] [US2] `tests/components/AppToast.test.ts` を作成してテストを記述・失敗確認（メッセージ表示、アクションボタンクリックで `action` emit、× クリックで `close` emit、アクションラベル未指定時にアクションボタン非表示の4テスト）

### 実装

- [x] T014 [US2] `src/components/AppToast.vue` を実装して T013 のテストを通過させる（props: `message: string`, `actionLabel?: string`、emit: `action`, `close`、位置: 画面下部 safe-area-inset-bottom 考慮、スタイル: `bg-surface-elevated border border-gold-muted`）
- [x] T015 [US2] `src/App.vue` に `useRegisterSW`（`vite-plugin-pwa/client`）と AppToast を追加する（`needRefresh === true` のとき AppToast 表示、アクション emit で `updateServiceWorker()` 呼び出し、close emit で `needRefresh = false`）

**Checkpoint**: User Story 2 完了 — SW 更新時にトースト表示・手動リロードが動作する。T001 の `registerType: 'prompt'` と組み合わせてオフライン動作保証

---

## Phase 5: User Story 3 — ウィスキー用語をテイスティング中に調べる (Priority: P2)

**Goal**: `/glossary` ルートで辞典を閲覧・検索・カテゴリ絞り込みできる。ノートフォームからモーダルで辞典を参照できる。

**Independent Test**: `/glossary` に遷移し用語一覧が表示される。「peaty」で検索して絞り込まれる。カテゴリタブで絞り込まれる。用語タップでアコーディオン展開する。

### テスト（実装前に記述・失敗確認）

- [x] T016 [P] [US3] `tests/views/GlossaryView.test.ts` を作成してテストを記述・失敗確認（全用語表示、検索クエリで絞り込み、カテゴリタブで絞り込み、用語タップでアコーディオン展開・再タップで閉じる、言語設定に応じて日英表示切り替わる、noResults 表示の7テスト）
- [x] T017 [P] [US3] `tests/components/GlossaryModal.test.ts` を作成してテストを記述・失敗確認（`visible === true` で表示、`visible === false` で非表示、「閉じる」クリックで `close` emit、検索・カテゴリフィルタが動作するの4テスト）

### 実装

- [x] T018 [US3] `src/views/GlossaryView.vue` を作成して T016 のテストを通過させる（`AppHeader title="glossary.title" showBack showHome`、検索ボックス、カテゴリタブ（水平スクロール、"すべて" + 7カテゴリ）、`useGlossary` でフィルタした `filteredTerms` の ul/li リスト、`activeId` ref でアコーディオン展開、noResults メッセージ）
- [x] T019 [US3] `src/router/index.ts` に `/glossary` ルート（name: `'glossary'`、`GlossaryView` lazy import）を追加する
- [x] T020 [US3] `tests/views/HomeView.test.ts` に辞典ボタン表示・クリックで `/glossary` 遷移のテストを追加・失敗確認（TDD: 実装前にテストを書く）
- [x] T021 [US3] `src/views/HomeView.vue` のヘッダーに辞典ボタン（本アイコン SVG）を設定ボタン左隣に追加して T020 のテストを通過させる。クリックで `router.push({ name: 'glossary' })` に遷移する
- [x] T022 [US3] `src/components/GlossaryModal.vue` を作成して T017 のテストを通過させる（`<teleport to="body">` で body 直下に描画、画面下からスライドアップ CSS transition、GlossaryView と同じ検索・カテゴリ・アコーディオン UI、ヘッダーに「閉じる」ボタン）
- [x] T023 [US3] `tests/components/NoteForm.test.ts` に「用語辞典を参照」ボタン表示・クリックで GlossaryModal 表示・モーダルを閉じてもフォーム値保持のテストを追加・失敗確認（TDD: 実装前にテストを書く）
- [x] T024 [US3] `src/components/NoteForm.vue` に辞典モーダルボタン（「📖 用語辞典を参照」）と `<GlossaryModal>` を追加して T023 のテストを通過させる（保存ボタン直前に配置、`showGlossary` ref で表示制御）

**Checkpoint**: User Story 3 完了 — 辞典が閲覧・検索できる。ノートフォームからモーダル参照できる

---

## Phase 6: Polish & クロスカッティング

**Purpose**: 品質確認・スタイル統一・最終検証

- [x] T025 [P] 全テストを実行して 82件（既存）+ 新規テストがすべて通過することを確認する（`npm test`）→ 168件全通過
- [x] T026 [P] `npm run build` でビルドエラーがないことを確認する → ビルド成功（SW生成含む）
- [x] T027 `src/views/GlossaryView.vue` と `src/components/GlossaryModal.vue` のスタイルをデザインシステム（`bg-surface-elevated`, `border-gold-muted`, `text-gold`, `text-ink-primary` 等）に統一する
- [x] T028 [P] `src/data/glossary.json` の全用語の `definitionJa` / `definitionEn` が空文字でないことを確認し、不足分を `docs/whisky-tasting.md` から補完する → 89件収録、全件定義文あり
- [x] T029 `npm run build` 後、`npm run preview` でローカルプレビューを起動し、Chrome DevTools の Lighthouse（PWA 監査）を実行してスコア 90 以上を確認する（SC-002 達成確認）。未達の場合は不足項目を特定して修正する

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: 依存なし — 即時開始可能
- **Foundational (Phase 2)**: Phase 1 完了後 — T001（registerType 変更）が完了してから T007/T008 を開始
- **US1 (Phase 3)**: Phase 2 完了後（T005/T006 の i18n キーが必要）
- **US2 (Phase 4)**: Phase 1 完了後（T001 の registerType 変更が前提）、Phase 2 と並行可能
- **US3 (Phase 5)**: Phase 2 完了後（T007/T008 の useGlossary が必要）
- **Polish (Phase 6)**: 全フェーズ完了後

### User Story Dependencies

| ストーリー | 前提 | 他ストーリーへの依存 |
|-----------|------|---------------------|
| US1 インストール | T005/T006 i18n | なし |
| US2 SW更新トースト | T001 registerType | なし（US1 と並行可能） |
| US3 用語辞典 | T005/T006 i18n + T007/T008 useGlossary | なし（US1/US2 と並行可能） |

### Parallel Opportunities

```bash
# Phase 1（並行可能）
T001 vite.config.ts 変更
T002 index.html メタタグ追加
T003 型定義作成

# Phase 2（並行可能）
T004 glossary.json 作成
T005 ja.json i18n 追加
T006 en.json i18n 追加
↓ T007/T008 は T004 完了後

# Phase 3/4/5 テスト（並行可能）
T009 useInstallPrompt テスト
T013 AppToast テスト
T016 GlossaryView テスト
T017 GlossaryModal テスト
```

---

## Implementation Strategy

### MVP First（Phase 1 + 2 + US2 のみ）

1. Phase 1 Setup 完了（T001〜T003）
2. Phase 2 Foundational 完了（T004〜T008）
3. Phase 4: US2 SW更新トースト完了（T013〜T015）
4. **STOP and VALIDATE**: オフライン動作・Lighthouse スコアを確認
5. → その後 US1（インストールボタン）→ US3（辞典）の順に追加

### 推奨実装順（1人開発）

```
T001 → T002/T003/T004/T005/T006（並行）
  → T007 → T008（useGlossary TDD）
  → T009 → T010（useInstallPrompt TDD）
  → T011 → T012（SettingsView インストール TDD）
  → T013 → T014 → T015（AppToast TDD）
  → T016/T017（GlossaryView/GlossaryModal テスト並行）
  → T018 → T019 → T020 → T021（GlossaryView）
  → T022 → T023 → T024（GlossaryModal + NoteForm）
  → T025/T026/T027/T028（Polish 並行）
```

---

## Notes

- `[P]` タスク = 異なるファイル、依存なし → 並行実行可能
- TDD を厳守: テストを書いて**失敗を確認**してから実装する
- `vite-plugin-pwa/client` の `useRegisterSW` は `vite-plugin-pwa` v0.21 以降で利用可能（既にインストール済み）
- `beforeinstallprompt` は jsdom で発火しないため、テストでは `vi.spyOn(window, 'addEventListener')` でモックする
- iOS Safari でのインストール (`beforeinstallprompt` 非対応) は `isIos` フラグで分岐して案内テキストを表示する
- 既存の 82件テストが引き続きすべて通過することを各フェーズ完了時に確認する
