# Research: ノートリストの検索・ソート機能

**Feature Branch**: `004-search-sort`
**Date**: 2026-03-12

---

## Decision 1: 検索・ソート状態の保持場所

**Decision**: 専用の Pinia ストア `useSearchSortStore` に `query` と `sortOption` を管理する。

**Rationale**: ノート詳細から一覧に戻った際に状態を維持する要件（FR-011, FR-012）を満たすには、Vue コンポーネントのローカル状態ではなくセッション全体で生存する Pinia ストアが適切。既存の `useSettingsStore` と同じパターンを採用することで学習コストが最小。

**Alternatives considered**:
- `HomeView.vue` のローカル `ref` — ページを離れると状態がリセットされるため要件を満たさない
- `useNotesStore` 内に統合 — ノート CRUD と検索/ソート状態は責務が異なる。単一責任原則に反する
- composable として抽出 — composable は `setup()` 呼び出しのたびにインスタンスが生成されるため、ページ間で状態が共有されない

---

## Decision 2: フィルタリング・ソートロジックの配置場所

**Decision**: フィルタリング・ソートの計算は `HomeView.vue` の `computed()` として実装する。`useSearchSortStore` は状態（`query`, `sortOption`）のみを持ち、ロジックを含まない。

**Rationale**: フィルタリングは `notesStore.notes`（ストア A）と `searchSortStore.query`（ストア B）の2つに依存する。どちらかのストアに計算ロジックを持たせるとストア間依存が生まれる。現状このロジックは `HomeView.vue` 1か所でしか使われないため、YAGNI に従い HomeView のコンポーネントスコープに置くのが最小複雑度。

**Alternatives considered**:
- `useSearchSortStore` 内に computed として統合 — `notesStore` への依存が生まれ、ストア結合度が上がる
- 独立した composable `useFilteredNotes` — 呼び出し箇所が1か所のためオーバーエンジニアリング（憲法 III「シンプル設計」違反）

---

## Decision 3: 日本語文字列ソートの比較方法

**Decision**: 銘柄名ソートには `localeCompare('ja')` を使用する。

**Rationale**: JavaScript の `<` / `>` 演算子は Unicode コードポイント順で比較するため、ひらがな・カタカナ・漢字の混在環境では期待通りに並ばない。`String.prototype.localeCompare(other, 'ja')` は日本語ロケールの辞書順で比較でき、ブラウザ（V8/JavaScriptCore/SpiderMonkey 最新2バージョン）でサポートされている。

**Alternatives considered**:
- ライブラリ（`Intl.Collator`）の明示的インスタンス化 — `localeCompare` は内部で `Intl.Collator` を使用しており、追加ライブラリ不要
- ひらがな変換の前処理 — 過剰な複雑度でYAGNI違反

---

## Decision 4: SearchSortBar コンポーネントの設計

**Decision**: 新コンポーネント `SearchSortBar.vue` として検索バーとソートセレクターを1つにまとめる。`v-model` ではなく emit で `HomeView` 経由で `searchSortStore` を更新する（ストアを直接操作）。

**Rationale**: `HomeView` で `searchSortStore` を直接 import して SearchSortBar に双方向バインディングするより、コンポーネント内から直接ストアを操作する方が Vue 3 + Pinia のイディオムに合致し、シンプル。既存の `NoteForm.vue` が `useDraftStore` を直接操作するパターンと統一。

---

## Decision 5: NoteList の空状態の分岐

**Decision**: `NoteList.vue` に `isFiltered: boolean` prop を追加し、0件時の表示を切り替える。

**Rationale**: 「ノートが1件もない」（新規ユーザー）と「検索条件にヒットしない」は原因が異なり、ユーザーに促すアクションも違う（ノート作成 vs 検索条件変更）。既存の `notes.length === 0` 判定に `isFiltered` 分岐を加えるだけで最小変更で対応可能。

**Alternatives considered**:
- `emptyType: 'no-notes' | 'no-results'` prop — 将来的な拡張性はあるが現状2種類しかないため過剰
- `HomeView` に空状態を移動して `NoteList` から削除 — 既存のテストを大きく変更する必要があり、変更コストが高い
