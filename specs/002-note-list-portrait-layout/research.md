# Research: ノート一覧レイアウト変更（縦長サムネイル・1列表示）

**Branch**: `002-note-list-portrait-layout` | **Date**: 2026-03-12

---

## 決定事項

### 1. 縦長サムネイルの CSS 実装

**Decision**: Tailwind CSS の `aspect-[2/3]` ユーティリティを使用する

**Rationale**:
- Tailwind v3.4 には `aspect-ratio` ユーティリティが組み込み済みで、任意値 `aspect-[2/3]`（width:height = 2:3 = 縦長比率）が使用可能
- 追加プラグイン不要、ビルドサイズへの影響なし
- `object-fit: contain`（Tailwind: `object-contain`）で画像全体を表示し、ボトルが切れない

**Alternatives considered**:
- `padding-top: 150%` ハック（絶対配置）: 動作するが可読性が低い
- 固定 height + width: 機種ごとの画面幅変動に弱い

---

### 2. テキスト省略表示

**Decision**:
- 銘柄名: `truncate`（1行、末尾「…」）
- コメントプレビュー: `line-clamp-2`（最大2行、末尾「…」）

**Rationale**:
- Tailwind v3.3+ に `line-clamp-*` が組み込み済み（`@tailwindcss/line-clamp` プラグイン不要）
- 現在の tailwind.config.ts に `plugins: []` で追加プラグインなし → そのまま利用可能

---

### 3. コメントプレビューの優先順位ロジック

**Decision**: `computed` プロパティで優先フィールドを順に検索し、最初の入力済み値を返す

```
priority: appearance → nose → palate → finish → notes
```

**Rationale**: spec FR-006 に明記。実装は `[note.appearance, note.nose, note.palate, note.finish, note.notes].find(v => v?.trim())` で実現できる

---

### 4. 記録日時フォーマット

**Decision**: `YYYY/MM/DD` 絶対日付形式

**Rationale**: clarify フェーズでユーザーが選択（Option A）

**実装**:
```ts
new Date(note.createdAt).toLocaleDateString('ja-JP', {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
})
// → "2026/03/12"
```

---

### 5. 変更対象ファイルの範囲

**Decision**: 既存の `NoteCard.vue` と `NoteList.vue` を改修する。新コンポーネントは作成しない

**Rationale**:
- 憲法 III（シンプル設計・YAGNI）: 機能追加でなくレイアウト変更のため、既存ファイルの改修が最小変更
- `NoteCard.vue` はこの一覧のみで使用されており、抽象化の必要性なし

**Alternatives considered**:
- `NoteListItem.vue` を新規作成し `NoteCard.vue` を残す: 重複が生まれるため却下
- `NoteCard.vue` を汎用化（portrait/landscape モード切替 prop）: YAGNI違反のため却下

---

### 6. 画像読み込み方式

**Decision**: 既存の `onMounted` + `db.bottleImages.get()` + `URL.createObjectURL()` パターンを踏襲する

**Rationale**:
- 既存実装（`NoteCard.vue`）で実績あり
- IndexedDB から Blob を取得し ObjectURL に変換してメモリリークを防ぐ（`onUnmounted` で revoke）

---

### 7. 総合評価の表示

**Decision**: 数値のみ（例: `85`）、`rating` が `undefined` の場合は評価エリア自体を非表示

**Rationale**: clarify フェーズでユーザーが選択（Option A）
