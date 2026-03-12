# Tasks: ノート一覧レイアウト変更（縦長サムネイル・1列表示）

**Input**: Design documents from `specs/002-note-list-portrait-layout/`
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, quickstart.md ✅

**TDD必須**: 憲法 II（テストファースト）に従い、実装前にテストを記述し失敗を確認する

## Format: `[ID] [P?] [Story] Description`

- **[P]**: 並列実行可（別ファイル・依存なし）
- **[US1]**: User Story 1（縦長サムネイル＋横並び1列レイアウト）

---

## Phase 1: Setup（環境確認）

**Purpose**: ベースラインの確認と実装前の現状把握

- [X] T001 既存テストを実行してベースラインを確認する（`npm test -- tests/components/NoteList.test.ts`）

---

## Phase 2: Foundational（ブロッキング前提条件）

**Purpose**: このfeatureは既存コンポーネントの改修のみ。新たな基盤インフラ不要。

> Phase 2 タスクなし。Phase 1 完了後、直接 Phase 3 へ進む。

---

## Phase 3: User Story 1 — 縦長サムネイル＋横並びレイアウト（Priority: P1）🎯 MVP

**Goal**: ノート一覧を1行1件・左縦長サムネイル＋右情報エリアの横並びレイアウトで表示する

**Independent Test**: 複数ノートが存在する状態で一覧画面を表示し、各ノートが縦長サムネイル付きの横並び1行レイアウトで表示されることを確認する

### テスト（TDD — 実装前に記述・失敗確認）

> **⚠️ NOTE**: 以下のテストをすべて記述した後、`npm test` で FAIL することを確認してから実装に進む

- [X] T002 [US1] `tests/components/NoteCard.test.ts` を新規作成し、以下のテストケースを記述する:
  1. `note.rating` が設定されているとき、評価数値（例: `92`）が画面に表示されること
  2. `note.rating` が `undefined` のとき、評価エリアが表示されないこと（`queryByText(/\d+/)` が null）
  3. `note.appearance` が空で `note.nose` に値があるとき、`nose` のテキストがプレビューエリアに表示されること（コメント優先順位: appearance → nose → palate → finish → notes）
  4. すべてのコメントフィールドが未入力のとき、プレビューエリアが空白でエラーにならないこと
  5. `note.createdAt` が `new Date('2026-03-12')` のとき、`2026/03/12` 形式の文字列が表示されること
  6. 銘柄名（`note.brandName`）が画面に表示されること
  7. 長いプレビューテキスト（100文字超）が設定されているとき、コメントプレビュー要素に `line-clamp-2` クラスが適用されていること（FR-007: 最大2行省略）
  8. NoteCard をクリックしたとき、`click` イベントが emit されること（FR-008: タップナビゲーション）

- [X] T003 [US1] `tests/components/NoteList.test.ts` を更新し、以下のテストケースを追加する:
  1. ノートが存在するとき、`grid-cols-2` クラスを持つ要素が存在しないこと（2列グリッド廃止の確認）

### 実装

- [X] T004 [US1] `src/components/NoteCard.vue` を改修する:
  - テンプレートを横並びレイアウト（`flex flex-row`）に変更する
  - 左エリア: `w-24 shrink-0 aspect-[2/3] bg-surface-overlay rounded-l-xl overflow-hidden flex items-center justify-center` のコンテナ
  - 画像あり: `<img class="w-full h-full object-contain">` (object-cover → object-contain)
  - 画像なし: `<div class="text-3xl opacity-30">🥃</div>` のプレースホルダー
  - 右エリア: `flex flex-col justify-between flex-1 p-3 min-w-0` のコンテナ
  - 銘柄名: `class="font-semibold text-ink-primary truncate text-sm"`
  - 評価: `v-if="note.rating !== undefined"` で `{{ note.rating }}` を数値のみ表示（`/ 100` 削除）
  - コメントプレビュー: `computed` で `[appearance, nose, palate, finish, notes].find(v => v?.trim()) ?? ''` を返し、`class="line-clamp-2 text-xs text-ink-secondary"` で表示
  - 日付: `toLocaleDateString('ja-JP', { year: 'numeric', month: '2-digit', day: '2-digit' })` に変更（`→ 2026/03/12` 形式）
  - カード全体: `rounded-xl` 維持、`h-32` の固定高さを削除

- [X] T005 [US1] `src/components/NoteList.vue` を改修する:
  - `<div v-else class="grid grid-cols-2 gap-3 p-4">` を `<div v-else class="flex flex-col divide-y divide-gold-muted/20 px-4">` に変更する

**Checkpoint**: この時点で User Story 1 の全テストが通過し、一覧画面が縦長サムネイル＋横並びレイアウトで表示されること

---

## Phase 4: Polish & Cross-Cutting Concerns

**Purpose**: 品質確認と最終検証

- [X] T006 全テストを実行し通過を確認する（`npm test`）
- [ ] T007 375px 幅相当（スマートフォン）でレイアウト崩れがないことを目視確認する（開発サーバー起動: `npm run dev`）
- [ ] T008 画像あり・なし混在の一覧でレイアウトが崩れないことを目視確認する（SC-002 検証）
- [ ] T009 500件のノートを手動で登録または IndexedDB に直接挿入し、一覧画面の表示完了時間が 1.5秒以内であることを確認する（SC-003 性能検証）

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: 依存なし — 即座に開始可能
- **Foundational (Phase 2)**: なし
- **User Story 1 (Phase 3)**: Phase 1 完了後に開始可能
  - T002, T003: 並列実行可（別ファイル）
  - T004, T005: T002/T003 失敗確認後に開始（並列実行可、別ファイル）
- **Polish (Phase 4)**: Phase 3 完了後

### User Story Dependencies

- **User Story 1 (P1)**: 単独完結。他ストーリーへの依存なし

### Within User Story 1

```
T001（ベースライン確認）
  ↓
T002 [P] NoteCard.test.ts 作成
T003 [P] NoteList.test.ts 更新
  ↓ （両テストの FAIL を確認）
T004 [P] NoteCard.vue 改修
T005 [P] NoteList.vue 改修
  ↓
T006 全テスト通過確認
T007 [P] 375px 目視確認
T008 [P] 混在一覧 目視確認
```

### Parallel Opportunities

- T002 と T003 は別ファイル → 並列実行可
- T004 と T005 は別ファイル → 並列実行可
- T007 と T008 は同時実施可

---

## Parallel Example: User Story 1

```bash
# テスト作成フェーズ（並列）:
Task: "NoteCard.test.ts 新規作成（T002）"
Task: "NoteList.test.ts 更新（T003）"

# 実装フェーズ（並列）:
Task: "NoteCard.vue 改修（T004）"
Task: "NoteList.vue 改修（T005）"
```

---

## Implementation Strategy

### MVP（User Story 1 のみ）

1. Phase 1: ベースライン確認（T001）
2. Phase 3 テスト: NoteCard.test.ts + NoteList.test.ts 作成（T002, T003）
3. FAIL 確認後、実装: NoteCard.vue + NoteList.vue 改修（T004, T005）
4. **STOP and VALIDATE**: 全テスト通過 + 目視確認（T006, T007, T008）

---

## Notes

- [P] タスクは別ファイルへの変更で依存関係なし → 並列実行可
- [US1] ラベルはすべて User Story 1 に対応
- `NoteCard.vue` の `object-cover` → `object-contain` 変更により、ボトル全体が見切れずに表示される
- `line-clamp-2` は Tailwind v3.3+ 組み込み（追加プラグイン不要）
- `aspect-[2/3]` は Tailwind v3 の任意値サポートで使用可能
- 既存テスト（NoteList.test.ts の3ケース）は改修後も引き続きパスすること
