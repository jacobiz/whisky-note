# Implementation Plan: ノート一覧レイアウト変更（縦長サムネイル・1列表示）

**Branch**: `002-note-list-portrait-layout` | **Date**: 2026-03-12 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `specs/002-note-list-portrait-layout/spec.md`

## Summary

`NoteList.vue` の2列グリッドを1列レイアウトに変更し、`NoteCard.vue` を縦長サムネイル＋右側情報エリアの横並びレイアウトに改修する。データモデルの変更なし。新規コンポーネント・依存パッケージは不要で、既存ファイルの改修のみで実現する。

## Technical Context

**Language/Version**: TypeScript 5.x / Vue 3 (Composition API)
**Primary Dependencies**: Vue 3, Tailwind CSS 3.4（`aspect-[2/3]`, `line-clamp-2` 組み込み済み）, Dexie.js 4（IndexedDB）
**Storage**: IndexedDB（既存 - BottleImage の読み込みのみ）
**Testing**: Vitest + @testing-library/vue
**Target Platform**: PWA（モバイルブラウザ、375px 最小幅）
**Project Type**: PWA / モバイルアプリ
**Performance Goals**: 500件ノートの一覧表示が 1.5秒以内（SC-003）
**Constraints**: オフライン動作必須、外部API禁止、375px幅対応
**Scale/Scope**: 最大500件ノートの一覧表示

## Constitution Check

| 原則 | 状態 | 備考 |
|------|------|------|
| I. ローカルファースト | ✅ PASS | UIレイアウト変更のみ。外部通信なし |
| II. テストファースト | ✅ PASS | `NoteCard.test.ts`（新規）を実装前に作成。`NoteList.test.ts`（既存）を更新 |
| III. シンプル設計 | ✅ PASS | 既存コンポーネント改修のみ。新規抽象化なし |
| IV. モバイル最適化 | ✅ PASS | 375px基準でレイアウト設計。縦長比率でモバイル向け |
| V. 日本語コミュニケーション | ✅ PASS | コメント・ドキュメント日本語 |

**Gate**: 全項目 PASS → 実装フェーズへ進む

## Project Structure

### Documentation (this feature)

```text
specs/002-note-list-portrait-layout/
├── spec.md          ✅ 完成
├── research.md      ✅ 完成
├── data-model.md    ✅ 完成
├── quickstart.md    ✅ 完成
├── plan.md          ✅ このファイル
├── checklists/
│   └── requirements.md  ✅ 完成
└── tasks.md         （/speckit.tasks で生成）
```

### Source Code（変更対象ファイル）

```text
src/
└── components/
    ├── NoteCard.vue        # 改修: 縦長サムネイル＋横並びレイアウト
    └── NoteList.vue        # 改修: 2列グリッド → 1列フレックス

tests/
└── components/
    ├── NoteCard.test.ts    # 新規: NoteCard のコンポーネントテスト
    └── NoteList.test.ts    # 更新: 既存テストにレイアウト検証を追加
```

**Structure Decision**: 既存の単一プロジェクト構成を維持。新ファイルは `tests/components/NoteCard.test.ts` のみ。

## 実装方針

### NoteList.vue の変更

```diff
- <div v-else class="grid grid-cols-2 gap-3 p-4">
+ <div v-else class="flex flex-col divide-y divide-gold-muted/20">
    <NoteCard ... />
  </div>
```

### NoteCard.vue の変更

現行（縦型カード）→ 新レイアウト（横並び行）:

```text
[縦長サムネイル] [銘柄名（truncate）    ]
[  aspect-[2/3] ] [評価: 92             ]
[  object-contain] [コメントプレビュー  ]
[               ] [2026/03/12           ]
```

**サムネイル**:
- コンテナ: `w-24 shrink-0 aspect-[2/3] bg-surface-overlay rounded-l-xl overflow-hidden`
- 画像あり: `<img class="w-full h-full object-contain">`
- 画像なし: プレースホルダーアイコン（🥃 + opacity-30）

**右側情報エリア**:
- 銘柄名: `font-semibold text-ink-primary truncate`
- 評価: `v-if="note.rating !== undefined"` → `{{ note.rating }}`（数値のみ）
- コメントプレビュー: `line-clamp-2 text-sm text-ink-secondary`（computed で優先順位取得）
- 日付: `text-xs text-ink-muted`（`YYYY/MM/DD` 形式）

### コメントプレビュー computed

```ts
const commentPreview = computed(() =>
  [props.note.appearance, props.note.nose, props.note.palate, props.note.finish, props.note.notes]
    .find(v => v?.trim()) ?? ''
)
```

### 日付フォーマット

```ts
const formattedDate = computed(() =>
  props.note.createdAt.toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
)
// → "2026/03/12"
```

## 実装フェーズ

### Phase 1: Setup（環境確認）
- Tailwind `aspect-[2/3]` と `line-clamp-2` の利用可能確認 ✅（research.md に記録済み）

### Phase 2: テスト作成（TDD - Red フェーズ）
1. `tests/components/NoteCard.test.ts` 新規作成（6テストケース）
2. `tests/components/NoteList.test.ts` 更新（レイアウト検証追加）

### Phase 3: 実装（Green フェーズ）
1. `src/components/NoteCard.vue` 改修
2. `src/components/NoteList.vue` 改修

### Phase 4: リファクタリング・検証
1. 全テスト通過確認
2. 375px幅での目視確認
3. 500件パフォーマンス検証（手動）

## Complexity Tracking

> 憲法違反なし。このテーブルへの記録事項なし。
