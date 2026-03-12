# Data Model: ノートリストの検索・ソート機能

**Feature Branch**: `004-search-sort`
**Date**: 2026-03-12

---

## 既存エンティティ（変更なし）

### TastingNote

このフィーチャーでは IndexedDB のスキーマ変更は不要。以下のフィールドを検索・ソートに使用する：

| フィールド | 型 | 用途 |
|-----------|---|------|
| `brandName` | `string` | 検索対象（必須）・ソート対象（名前順） |
| `distillery` | `string \| undefined` | 検索対象（任意） |
| `rating` | `number \| undefined` | ソート対象（評価順）、未設定は末尾扱い |
| `createdAt` | `Date` | ソート対象（日時順） |

---

## 新規状態エンティティ（インメモリ）

### SearchSortState — Pinia ストア

IndexedDB には保存しない。セッション中（ページリロードまで）のみ保持。

| フィールド | 型 | デフォルト | 説明 |
|-----------|---|-----------|------|
| `query` | `string` | `''` | 検索キーワード（空文字 = フィルタなし） |
| `sortOption` | `SortOption` | `'date-desc'` | 現在のソート選択 |

### SortOption 列挙型

```
'date-desc'   — 記録日時：新しい順（デフォルト）
'date-asc'    — 記録日時：古い順
'rating-desc' — 評価：高い順（評価未設定は末尾）
'name-asc'    — 銘柄名：A-Z / あ行順（localeCompare 'ja'）
```

---

## フィルタリング・ソートロジック

`HomeView.vue` の `computed()` として実装（ストアには含めない）：

```
filteredNotes = notesStore.notes
  |> filter by query (brandName OR distillery, case-insensitive, 部分一致)
  |> sort by sortOption
```

**ソート詳細**:
- `date-desc`: `b.createdAt - a.createdAt`（降順）
- `date-asc`: `a.createdAt - b.createdAt`（昇順）
- `rating-desc`: 評価済みを降順 → 未評価を末尾（`undefined` を最大値として扱う逆転ソート）
- `name-asc`: `a.brandName.localeCompare(b.brandName, 'ja')`

---

## i18n キー（新規追加）

`src/i18n/locales/ja.json` および `en.json` に追加するキー：

| キー | 日本語 | 英語 |
|-----|--------|------|
| `search.placeholder` | 銘柄名・蒸留所で検索 | Search by name or distillery |
| `search.clearLabel` | 検索をクリア | Clear search |
| `search.noResults` | 該当するノートが見つかりません | No notes match your search |
| `search.noResultsHint` | 検索条件を変えてみてください | Try a different search term |
| `search.sortLabel` | 並び順 | Sort by |
| `search.sortDateDesc` | 新しい順 | Newest first |
| `search.sortDateAsc` | 古い順 | Oldest first |
| `search.sortRatingDesc` | 評価が高い順 | Highest rated |
| `search.sortNameAsc` | 銘柄名順 | Name (A-Z) |
