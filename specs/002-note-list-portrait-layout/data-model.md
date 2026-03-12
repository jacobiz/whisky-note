# Data Model: ノート一覧レイアウト変更（縦長サムネイル・1列表示）

**Branch**: `002-note-list-portrait-layout` | **Date**: 2026-03-12

---

## 変更なし

このfeatureはUIレイアウトの変更のみであり、データモデルへの変更はない。

既存の `TastingNote` エンティティが一覧表示に必要なすべてのフィールドを持っている。

---

## 一覧表示に使用するフィールド（参照）

| フィールド | 型 | 用途 |
|-----------|-----|------|
| `id` | `string` | Vue `v-for` の `:key`、ルーティングパラメーター |
| `brandName` | `string` | 銘柄名（1行省略表示） |
| `rating` | `number \| undefined` | 総合評価（数値表示、undefined なら非表示） |
| `appearance` | `string \| undefined` | コメントプレビュー（優先度1位） |
| `nose` | `string \| undefined` | コメントプレビュー（優先度2位） |
| `palate` | `string \| undefined` | コメントプレビュー（優先度3位） |
| `finish` | `string \| undefined` | コメントプレビュー（優先度4位） |
| `notes` | `string \| undefined` | コメントプレビュー（優先度5位） |
| `imageId` | `string \| undefined` | BottleImage 参照（存在すれば画像読み込み） |
| `createdAt` | `Date` | 記録日時（YYYY/MM/DD 形式で表示） |

## コメントプレビュー優先順位ロジック

```
appearance → nose → palate → finish → notes
最初の入力済み（trim() !== ''）フィールドの冒頭テキストを表示
すべて未入力の場合はプレビューエリアを空白表示
```
