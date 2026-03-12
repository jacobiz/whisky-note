# Data Model: ウィスキーテイスティングノート記録

**Branch**: `001-tasting-note-record` | **Date**: 2026-03-11
**Storage**: IndexedDB（Dexie.js v4）

---

## エンティティ定義

### TastingNote（テイスティングノート）

ウィスキー 1 銘柄に対する 1 回のテイスティング記録。

| フィールド | 型 | 必須 | 制約 |
|-----------|-----|------|------|
| `id` | string (UUID v4) | ✅ | 自動生成、一意 |
| `brandName` | string | ✅ | 最大 100 文字、一意性制約なし |
| `distillery` | string | — | 最大 100 文字 |
| `vintage` | string | — | 最大 20 文字（例: "1990", "NAS"） |
| `appearance` | string | — | 最大 1,000 文字 |
| `nose` | string | — | 最大 1,000 文字 |
| `palate` | string | — | 最大 1,000 文字 |
| `finish` | string | — | 最大 1,000 文字 |
| `rating` | number | — | 0–100 の整数（未設定は null） |
| `notes` | string | — | 最大 1,000 文字（フリーメモ） |
| `imageId` | string \| null | — | BottleImage.id への参照 |
| `createdAt` | Date | ✅ | 自動設定（INSERT 時） |
| `updatedAt` | Date | ✅ | 自動更新（INSERT/UPDATE 時） |

**インデックス**: `createdAt`（降順ソート用）

**一覧表示の並び順**: `createdAt` 降順（最新順・固定）

---

### BottleImage（ボトル画像）

ノートに紐付くサムネイル画像。

| フィールド | 型 | 必須 | 制約 |
|-----------|-----|------|------|
| `id` | string (UUID v4) | ✅ | 自動生成、一意 |
| `noteId` | string | ✅ | TastingNote.id への参照 |
| `blob` | Blob | ✅ | 圧縮済み、最大 500KB |
| `mimeType` | string | ✅ | "image/jpeg" または "image/webp" |
| `createdAt` | Date | ✅ | 自動設定 |

**制約**:
- 1 ノートにつき 1 画像のみ（1:1 関係）
- 保存前に `browser-image-compression` で 500KB 以下に圧縮する
- ノート削除時に対応する BottleImage も削除する（カスケード削除）

---

### Draft（下書き）

保存前の入力中ノート。シングルトン（常に 1 件のみ）。

| フィールド | 型 | 必須 | 制約 |
|-----------|-----|------|------|
| `id` | `'current'` | ✅ | 固定キー（常に同じレコードを上書き） |
| `data` | `Partial<TastingNote>` | ✅ | TastingNote の部分データ |
| `updatedAt` | Date | ✅ | 自動更新 |

**制約**:
- 同時に存在できるのは 1 件のみ
- 新規作成フォームを開始すると前の下書きを上書きする
- ノートを正式保存したら Draft を削除する

---

### AppSettings（アプリ設定）

アプリ全体の設定。シングルトン。

| フィールド | 型 | 必須 | 制約 |
|-----------|-----|------|------|
| `id` | `'settings'` | ✅ | 固定キー |
| `language` | `'ja'` \| `'en'` | ✅ | デフォルト: 端末ロケールに従う |

---

## ライフサイクル / 状態遷移

### TastingNote のライフサイクル

```
[新規作成フォーム入力中]
       ↓ 自動保存（FR-012）
   Draft（'current'）
       ↓ 保存ボタン押下 + バリデーション通過
  TastingNote（保存済み）
       ↓ 編集 → 保存
  TastingNote（更新済み）
       ↓ 削除確認ダイアログ → 承認
      （削除済み）+ BottleImage も削除
```

### Draft のライフサイクル

```
  [新規作成開始]
       ↓ 入力のたびに自動保存
   Draft（'current'）
       ↙             ↘
  正式保存          新規作成開始
  Draft 削除        Draft 上書き（前の下書き消去）
```

---

## Dexie.js スキーマ定義（参考）

```typescript
// src/db/schema.ts
const db = new Dexie('WhiskyNoteDB');
db.version(1).stores({
  tastingNotes: '++id, createdAt',   // id は UUID 文字列を使用するため ++ は不要だが表記上
  bottleImages: 'id, noteId',
  drafts: 'id',
  settings: 'id',
});
```

**注意**: UUID は アプリ側で生成（`crypto.randomUUID()`）し、Dexie の auto-increment は使用しない。

---

## バリデーションルール

| フィールド | ルール |
|-----------|--------|
| `brandName` | 空文字・空白のみは不可（FR-002） |
| `rating` | 0 以上 100 以下の整数、または null |
| `appearance` / `nose` / `palate` / `finish` / `notes` | 各フィールド 1,000 文字以下（FR-013） |
| 画像 Blob | 500KB 以下（圧縮後）（FR-004） |
