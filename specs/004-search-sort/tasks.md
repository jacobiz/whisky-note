# Tasks: ノートリストの検索・ソート機能

**Input**: Design documents from `/specs/004-search-sort/`
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, quickstart.md ✅

**TDD**: プロジェクト憲法 II（テストファースト）に従い、全実装タスクはテスト作成（Red）→ 実装（Green）の順で実行する。

## Format: `[ID] [P?] [Story] Description`

- **[P]**: 並列実行可能（異なるファイル・依存関係なし）
- **[Story]**: 対応するユーザーストーリー（US1, US2）

---

## Phase 1: Setup（既存プロジェクト構成確認）

**Purpose**: 既存コードベースの確認のみ。新規ファイル構造の作成は不要。

- [X] T001 既存コードベースを確認（HomeView, NoteList, notesStore, i18n の構成を把握）

---

## Phase 2: Foundational（全 US の前提となる共通基盤）

**Purpose**: 両ユーザーストーリーが依存する型定義・ストア・i18n キーを整備する

**⚠️ CRITICAL**: このフェーズ完了前に US1/US2 の実装を開始してはならない

- [X] T002 `src/i18n/locales/ja.json` と `en.json` に `search` セクション（9キー）を追加（data-model.md 参照）
- [X] T003 `src/stores/searchSort.ts` を作成し `SortOption` 型と `useSearchSortStore`（query, sortOption）を定義

**Checkpoint**: i18n キーと searchSort ストアが揃った状態。US1/US2 の実装開始可能。

---

## Phase 3: User Story 1 - テキスト検索によるノート絞り込み (Priority: P1) 🎯 MVP

**Goal**: 銘柄名・蒸留所名でリアルタイムにリストを絞り込む。×ボタンでクリアできる。検索0件時は専用メッセージを表示する。

**Independent Test**: 検索バーに文字を入力 → 一致するノートのみ表示 → × でリセット → 全件表示、の一連の動作が機能する

### テスト（TDD: Red フェーズ）

> **IMPORTANT**: 以下のテストを先に作成し、実装前に FAIL することを確認すること

- [X] T004 [P] [US1] `tests/stores/searchSort.test.ts` を新規作成し、query の初期値・更新・リセット、および sortOption の初期値（'date-desc'）・更新のテストを記述（Red）
- [X] T005 [P] [US1] `tests/components/SearchSortBar.test.ts` を新規作成し、検索バー入力・×クリアボタン表示・クリア動作のテストを記述（Red）
- [X] T006 [P] [US1] `tests/components/NoteList.test.ts` に `isFiltered=true` かつ `notes=[]` のとき「該当なし」メッセージが表示されるテストを追加（Red）
- [X] T007 [P] [US1] `tests/views/HomeView.test.ts` を新規作成し、brandName 部分一致・distillery 部分一致・大文字小文字区別なし・クリア後全件復元のフィルタリングテストを記述（Red）

### 実装（TDD: Green フェーズ）

- [X] T008 [US1] `src/stores/searchSort.ts` を完成させ T004 を Green にする（T003 前提）
- [X] T009 [US1] `src/components/SearchSortBar.vue` を新規作成し、検索バー（v-model）と×クリアボタン（query が空でないとき表示）を実装して T005 を Green にする（T002, T008 前提）
- [X] T010 [US1] `src/components/NoteList.vue` に `isFiltered?: boolean` prop を追加し、0件+isFiltered時の「検索結果なし」空状態（`t('search.noResults')` + `t('search.noResultsHint')`）を追加して T006 を Green にする（T002 前提）
- [X] T011 [US1] `src/views/HomeView.vue` に `SearchSortBar` を追加し、`filteredNotes` computed（brandName/distillery 部分一致、大文字小文字を区別しない）を実装して `NoteList` に渡し T007 を Green にする（T008, T009, T010 前提）

**Checkpoint**: US1 完了。検索バー入力→リアルタイム絞り込み→クリアで全件復元、が動作する。

---

## Phase 4: User Story 2 - ノートリストのソート (Priority: P2)

**Goal**: 4種類のソートオプション（日時新しい順・古い順・評価高い順・名前順）を切り替えられる。検索と同時に適用できる。

**Independent Test**: ソートセレクターで「評価が高い順」を選択 → 評価スコア降順で並ぶ。評価未設定ノートは末尾。

### テスト（TDD: Red フェーズ）

> **IMPORTANT**: 以下のテストを先に作成し、実装前に FAIL することを確認すること

- [X] T012 [P] [US2] `tests/components/SearchSortBar.test.ts` にソート `<select>` の表示・オプション4件・変更イベントのテストを追加（Red）
- [X] T013 [P] [US2] `tests/views/HomeView.test.ts` に4種類のソート（date-desc, date-asc, rating-desc, name-asc）と評価未設定ノートの末尾配置のテストを追加（Red）

### 実装（TDD: Green フェーズ）

- [X] T014 [US2] `src/components/SearchSortBar.vue` にネイティブ `<select>` ソートセレクター（4オプション、i18n ラベル）を追加して T012 を Green にする（T009 前提）
- [X] T015 [US2] `src/views/HomeView.vue` の `filteredNotes` computed にソートロジック（date-desc/asc: createdAt 比較、rating-desc: undefined を末尾扱い、name-asc: localeCompare('ja')）を追加して T013 を Green にする（T011, T014 前提）

**Checkpoint**: US2 完了。検索フィルタ適用後にソートが正しく機能する。

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: 回帰確認・微調整・品質検証

- [X] T016 `npm test` で全テストが通過することを確認し、既存テストへの回帰がないことを検証
- [ ] T017 [P] SearchSortBar の 375px 幅でのレイアウト確認（検索バーとソート select が並んで収まること）
- [ ] T018 quickstart.md のシナリオ 1〜5 を手動で動作確認し全シナリオが期待通りであることを記録

---

## Dependencies & Execution Order

### フェーズ依存関係

- **Phase 1 (Setup)**: 即時開始可能
- **Phase 2 (Foundational)**: Phase 1 完了後 — **Phase 3/4 をブロック**
- **Phase 3 (US1)**: Phase 2 完了後に開始
- **Phase 4 (US2)**: Phase 2 完了後に開始（US1 完了後推奨）
- **Phase 5 (Polish)**: Phase 3 + Phase 4 完了後

### ユーザーストーリー内の依存関係

```
T002 → T003 → T008 → T009 → T011
               ↓              ↑
T002 → T010 ──────────────────┘
T004 ──── (Red) → T008 (Green)
T005 ──── (Red) → T009 (Green)
T006 ──── (Red) → T010 (Green)
T007 ──── (Red) → T011 (Green)
```

### 並列実行の機会

- T004, T005, T006, T007 は互いに独立しており同時実行可能（異なるファイル）
- T012, T013 は互いに独立しており同時実行可能
- T009, T010 は互いに独立しており同時実行可能

---

## Parallel Example

```bash
# Phase 3 テストを並列作成（Red フェーズ）:
Task A: "T004: tests/stores/searchSort.test.ts を作成"
Task B: "T005: tests/components/SearchSortBar.test.ts を作成"
Task C: "T006: tests/components/NoteList.test.ts を更新"
Task D: "T007: tests/views/HomeView.test.ts を作成"

# Phase 3 実装を部分並列（Green フェーズ）:
Task A: "T009: SearchSortBar.vue の検索バーを実装"（T005 Green後）
Task B: "T010: NoteList.vue に isFiltered を追加"（T006 Green後）
# T011（HomeView）は T009 + T010 完了後
```

---

## Implementation Strategy

### MVP（US1 のみ）

1. Phase 1 完了
2. Phase 2 完了（T002, T003）
3. Phase 3 完了（T004〜T011）
4. **停止・検証**: 検索機能を独立してテスト
5. ソート機能なしでリリース可能

### Incremental Delivery

1. Phase 1 + 2 → 基盤完成
2. Phase 3 (US1) → 検索機能 MVP → 独立テスト → デモ
3. Phase 4 (US2) → ソート機能追加 → 独立テスト → デモ
4. Phase 5 → 品質検証

---

## Notes

- [P] タスク = 異なるファイル・依存関係なし（並列実行可能）
- 全テストは実装前に FAIL を確認すること（TDD Red フェーズ）
- 1タスク = 1コミットを目安とする
- `src/stores/searchSort.ts` の `SortOption` 型は SearchSortBar.vue と HomeView.vue で import して使う
- `localeCompare('ja')` で日本語の五十音順ソートを実現する（外部ライブラリ不要）
