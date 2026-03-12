# Implementation Plan: ノートリストの検索・ソート機能

**Branch**: `004-search-sort` | **Date**: 2026-03-12 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/004-search-sort/spec.md`

## Summary

銘柄名・蒸留所名によるリアルタイムテキスト検索と、日時/評価/名前順のソートをノートリスト画面に追加する。検索・ソート状態は Pinia ストアで管理しページ遷移後も保持する。IndexedDB スキーマ変更は不要で、すべてクライアントサイドのインメモリ処理として実装する。

## Technical Context

**Language/Version**: TypeScript 5.x
**Primary Dependencies**: Vue 3 (Composition API), Pinia 2, vue-i18n v9
**Storage**: IndexedDB (Dexie.js 4) — 既存スキーマを読み取りのみ利用。スキーマ変更なし
**Testing**: Vitest + @testing-library/vue
**Target Platform**: PWA (モバイルブラウザ最優先, 375px幅)
**Performance Goals**: フィルタリング完了まで100ms以内（クライアントサイドで十分達成可能）
**Constraints**: オフライン動作必須、外部通信禁止、モバイルファースト
**Scale/Scope**: 数千件のノートをクライアントサイドでフィルタリング可能

## Constitution Check

| 原則 | 判定 | 備考 |
|------|------|------|
| I. ローカルファースト | ✅ PASS | IndexedDB 読み取りのみ。外部通信なし |
| II. テストファースト | ✅ PASS | tasks.md で TDD サイクルを明示 |
| III. シンプル設計 | ✅ PASS | ストア間依存なし。フィルタロジックは HomeView の computed に局所化 |
| IV. モバイル最適化 | ✅ PASS | ネイティブ select・44px タッチターゲット |
| V. 日本語コミュニケーション | ✅ PASS | 全ドキュメント日本語 |

**Gates**: 全て PASS。実装開始可能。

## Project Structure

### Documentation (this feature)

```text
specs/004-search-sort/
├── plan.md              ← このファイル
├── spec.md              ← 機能仕様
├── research.md          ← 技術調査結果
├── data-model.md        ← 状態設計・i18n キー定義
├── quickstart.md        ← テストシナリオ
└── tasks.md             ← /speckit.tasks で生成
```

### Source Code

```text
src/
├── stores/
│   ├── notes.ts             （既存・変更なし）
│   └── searchSort.ts        ★ NEW: query + sortOption 状態管理
├── components/
│   ├── SearchSortBar.vue     ★ NEW: 検索バー + ソート <select>
│   └── NoteList.vue          ★ MODIFIED: isFiltered prop 追加
├── views/
│   └── HomeView.vue          ★ MODIFIED: SearchSortBar 追加 + filtered computed
└── i18n/locales/
    ├── ja.json               ★ MODIFIED: search.* キー追加
    └── en.json               ★ MODIFIED: search.* キー追加

tests/
├── stores/
│   └── searchSort.test.ts    ★ NEW
├── components/
│   ├── SearchSortBar.test.ts ★ NEW
│   └── NoteList.test.ts      ★ MODIFIED: isFiltered シナリオ追加
└── views/
    └── HomeView.test.ts      ★ NEW
```

**Structure Decision**: 既存の単一プロジェクト構成を維持。新規ファイルは最小限（ストア1個、コンポーネント1個）。

## 実装フェーズ

### Phase 1: useSearchSortStore（状態管理）

`src/stores/searchSort.ts` を作成する。

```typescript
// 公開インターフェース
export type SortOption = 'date-desc' | 'date-asc' | 'rating-desc' | 'name-asc'

export const useSearchSortStore = defineStore('searchSort', () => {
  const query = ref<string>('')
  const sortOption = ref<SortOption>('date-desc')
  return { query, sortOption }
})
```

- ストアは状態のみ（query, sortOption）。フィルタロジックは含まない
- `SortOption` 型を export して HomeView と SearchSortBar で共有する

### Phase 2: SearchSortBar コンポーネント

`src/components/SearchSortBar.vue` を作成する。

**責務**:
- テキスト検索バー（placeholder: `t('search.placeholder')`）
- 入力クリアボタン（×）— query が空でないときのみ表示
- ソートオプション `<select>` — 4オプション（i18n ラベル）
- `useSearchSortStore` を直接操作（props/emit を介さない）

**レイアウト**: 検索バーと select を横並び（flex）。375px 幅で両方が収まるよう select 幅を最小化。

### Phase 3: HomeView + NoteList 修正

**HomeView.vue**:

```typescript
const filteredNotes = computed(() => {
  let result = [...notesStore.notes]

  // 検索フィルタ（大文字小文字を区別しない部分一致）
  const q = searchSortStore.query.trim().toLowerCase()
  if (q) {
    result = result.filter(n =>
      n.brandName.toLowerCase().includes(q) ||
      (n.distillery ?? '').toLowerCase().includes(q)
    )
  }

  // ソート
  return sortNotes(result, searchSortStore.sortOption)
})
```

- `<NoteList :notes="filteredNotes" :is-filtered="!!searchSortStore.query.trim()" />`

**NoteList.vue**:

```typescript
defineProps<{ notes: TastingNote[], isFiltered?: boolean }>()
```

- `notes.length === 0 && !isFiltered` → 既存の「🥃 ノートなし」空状態
- `notes.length === 0 && isFiltered` → 「該当なし」空状態（新規 i18n キー）

### Phase 4: i18n

`src/i18n/locales/ja.json` と `en.json` に `search` セクションを追加する：

```json
"search": {
  "placeholder": "銘柄名・蒸留所で検索",
  "clearLabel": "検索をクリア",
  "noResults": "該当するノートが見つかりません",
  "noResultsHint": "検索条件を変えてみてください",
  "sortLabel": "並び順",
  "sortDateDesc": "新しい順",
  "sortDateAsc": "古い順",
  "sortRatingDesc": "評価が高い順",
  "sortNameAsc": "銘柄名順"
}
```

## Complexity Tracking

> 今回は憲法違反となる設計は採用していない

| 違反 | 理由 | 却下した代替 |
|------|------|------------|
| （なし） | — | — |
