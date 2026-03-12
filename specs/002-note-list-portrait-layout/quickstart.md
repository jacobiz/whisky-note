# Quickstart: ノート一覧レイアウト変更（縦長サムネイル・1列表示）

**Branch**: `002-note-list-portrait-layout` | **Date**: 2026-03-12

---

## 独立テストシナリオ（User Story 1）

### シナリオ 1: 基本レイアウト確認

**前提**: ノートが3件存在する（画像あり1件、画像なし2件）

**テストデータ**:
```ts
const noteWithImage: TastingNote = {
  id: 'note-1',
  brandName: '山崎12年',
  rating: 92,
  appearance: '琥珀色で透明感がある',
  createdAt: new Date('2026/03/10'),
  updatedAt: new Date('2026/03/10'),
  imageId: 'img-1',
}
const noteNoComment: TastingNote = {
  id: 'note-2',
  brandName: '白州18年',
  createdAt: new Date('2026/03/11'),
  updatedAt: new Date('2026/03/11'),
}
const noteAllComments: TastingNote = {
  id: 'note-3',
  brandName: 'グレンリベット21年',
  rating: 88,
  appearance: '薄い黄金色',
  nose: '蜂蜜とバニラ',
  palate: 'フルーティで甘い',
  finish: '長い余韻',
  notes: 'バランスが良い',
  createdAt: new Date('2026/03/12'),
  updatedAt: new Date('2026/03/12'),
}
```

**検証項目**:
1. 各ノートが1行ずつ縦に並ぶ（2列グリッドでない）
2. 各行に縦長（縦:横 = 3:2）のサムネイルエリアが左側にある
3. 画像ありノートにはボトル画像が表示される
4. 画像なしノートにはプレースホルダーアイコンが表示される
5. 銘柄名が右側に表示される（長い場合は1行で「…」省略）
6. 評価が入力済みのノートは数値（例: `92`）が表示される
7. 評価未入力のノートは評価エリアが非表示
8. コメントプレビューは `appearance` → `nose` の優先順で最初の入力済みテキストを表示
9. 日付が `YYYY/MM/DD` 形式（例: `2026/03/10`）で表示される

---

### シナリオ 2: コメントプレビュー優先順位

**前提**: `appearance` が空、`nose` のみ入力済みのノート

**期待**: プレビューに `nose` の冒頭テキストが表示される

**前提**: すべてのコメントフィールドが未入力

**期待**: プレビューエリアは空白（エラーなし）

---

### シナリオ 3: 空状態

**前提**: ノートが0件

**期待**: 空状態メッセージが表示される（既存動作を維持）

---

### シナリオ 4: タップナビゲーション

**前提**: ノートが存在する

**操作**: 任意のノート行をタップ

**期待**: 詳細画面へ遷移する

---

## コンポーネントテスト実行コマンド

```bash
# NoteCard 単体テスト
npm test -- tests/components/NoteCard.test.ts

# NoteList 単体テスト
npm test -- tests/components/NoteList.test.ts

# 全テスト
npm test
```
