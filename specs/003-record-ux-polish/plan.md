# Implementation Plan: 記録アプリ UX 拡充

**Branch**: `003-record-ux-polish` | **Date**: 2026-03-12 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/003-record-ux-polish/spec.md`

## Summary

詳細画面での全情報表示・編集画面での縦長画像プレビュー・ヘッダーナビゲーション統一・設定画面へのプライバシーポリシー/ライセンス追加という4領域のUX改善を行う。既存の `TastingNote` データスキーマ変更は不要で、Vue コンポーネントの修正・新規追加のみで実現する。中核となる `AppHeader` コンポーネントを新規作成し、各画面のヘッダー実装を共通化する。

## Technical Context

**Language/Version**: TypeScript 5.x
**Primary Dependencies**: Vue 3 (Composition API), Vue Router 4, vue-i18n v9, Tailwind CSS 3.4, Dexie.js 4
**Storage**: IndexedDB（Dexie.js）— 既存スキーマを変更しない
**Testing**: Vitest + @testing-library/vue + @pinia/testing
**Target Platform**: PWA（モバイルファースト、375px 幅基準）
**Project Type**: Mobile PWA
**Performance Goals**: LCP < 2.5s、FID < 100ms、CLS < 0.1
**Constraints**: オフライン動作必須、外部通信禁止、500KB 画像上限維持
**Scale/Scope**: 既存5画面の修正 + 新規3コンポーネント + 新規2画面

## Constitution Check

| 原則 | 状態 | 備考 |
|------|------|------|
| I. ローカルファースト | ✅ PASS | DB スキーマ変更なし。静的コンテンツはコード内定数 |
| II. テストファースト | ✅ PASS | 全タスクで Red→Green→Refactor サイクルを厳守 |
| III. シンプル設計 | ✅ PASS | AppHeader は5画面以上で使用するため抽象化正当化（下記記録）|
| IV. モバイル最適化 | ✅ PASS | aspect-[2/3] による縦長表示、タッチ操作優先設計 |
| V. 日本語コミュニケーション | ✅ PASS | 準拠 |

## Project Structure

### Documentation (this feature)

```text
specs/003-record-ux-polish/
├── plan.md              # このファイル
├── research.md          # Phase 0 出力
├── data-model.md        # Phase 1 出力
├── quickstart.md        # Phase 1 出力
└── tasks.md             # /speckit.tasks コマンド出力
```

### Source Code (repository root)

```text
src/
├── components/
│   ├── AppHeader.vue        # 新規: 共通ヘッダーコンポーネント
│   ├── ImagePicker.vue      # 修正: 縦長表示・既存画像表示・削除ボタン
│   ├── NoteForm.vue         # 修正: initialImageUrl prop 追加
│   ├── NoteCard.vue         # 変更なし
│   ├── NoteList.vue         # 変更なし
│   └── ...（その他変更なし）
├── views/
│   ├── NoteDetailView.vue   # 修正: AppHeader 差し替え・画像縦長化
│   ├── NoteEditView.vue     # 修正: AppHeader・画像URL渡し・破棄確認
│   ├── NoteCreateView.vue   # 修正: AppHeader・破棄確認
│   ├── SettingsView.vue     # 修正: AppHeader・PP/ライセンス項目追加
│   ├── PrivacyPolicyView.vue  # 新規: プライバシーポリシー静的画面
│   └── LicenseView.vue      # 新規: ライセンス情報一覧画面
└── router/
    └── index.ts             # 修正: /privacy-policy, /licenses ルート追加

tests/
├── components/
│   ├── AppHeader.test.ts    # 新規
│   ├── ImagePicker.test.ts  # 修正: 新 prop のテスト追加
│   └── NoteForm.test.ts     # 修正: initialImageUrl のテスト追加
└── views/
    ├── NoteDetailView.test.ts   # 新規
    ├── NoteEditView.test.ts     # 新規
    ├── NoteCreateView.test.ts   # 新規
    ├── SettingsView.test.ts     # 新規
    ├── PrivacyPolicyView.test.ts  # 新規
    └── LicenseView.test.ts      # 新規
```

**Structure Decision**: 単一 SPA（既存構造を踏襲）。新規ファイルは既存の `components/` / `views/` ディレクトリに追加。

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|--------------------------------------|
| AppHeader コンポーネント化 | 5画面で同一ヘッダーロジック（戻る・ホーム・未保存ガード）が必要 | 各画面にコピーすると変更時に5箇所修正が必要になり保守不能 |

## Implementation Phases

### Phase A: 詳細画面の全情報表示 (P1)

**対象ファイル**: `src/views/NoteDetailView.vue`

**変更内容**:
- 画像表示を `h-48 object-cover` → `aspect-[2/3] w-full object-contain` に変更（縦長ポートレート統一）
- 全フィールドの表示確認（現在表示されていない `style` フィールドは `TastingNote` スキーマに存在しないため不要）
- 実際に欠けているフィールドが spec に存在しないことを確認済み — 画像表示スタイルの修正が主な変更

**テスト先行**:
- 詳細画面が全入力フィールド（appearance, nose, palate, finish, notes, rating, distillery, vintage）を表示するテスト
- 未入力フィールドが非表示になるテスト
- 画像が縦長アスペクト比で表示されるテスト

### Phase B: AppHeader 共通コンポーネント (P3 の前提)

**対象ファイル**: `src/components/AppHeader.vue`（新規）

**Props**:
```
title: string           — ヘッダータイトル
showBack?: boolean      — 戻るボタン表示（デフォルト: true）
showHome?: boolean      — ホームアイコン表示（デフォルト: true）
onBack?: () => void     — 戻るボタンのカスタムハンドラ（省略時は router.back()）
onHome?: () => void     — ホームアイコンのカスタムハンドラ（省略時は router.push home）
```

**レイアウト**:
```
[← 戻る]  [タイトル（truncate）]  [ホームアイコン]
左端       中央 flex-1            右端
```

**テスト先行**:
- showBack=true のとき戻るボタンが表示されるテスト
- showHome=false のときホームアイコンが非表示になるテスト
- onBack prop を渡したとき router.back() の代わりに呼ばれるテスト

### Phase C: ImagePicker 縦長表示・既存画像・削除 (P2)

**対象ファイル**: `src/components/ImagePicker.vue`

**新規 Props**:
```
existingImageUrl?: string | null  — 編集時の既存画像 URL（Object URL）
```

**変更内容**:
- `previewUrl || existingImageUrl` が真のとき画像サムネイルを表示
- サムネイルのコンテナを `h-48` → `aspect-[2/3] max-w-[180px] mx-auto` に変更
- 画像表示中に「変更」ボタン（カメラアイコン）と「削除」ボタン（×）を重ねて表示
- 画像削除時: `previewUrl` をリセットし `emit('update:modelValue', null)` を発火

**テスト先行**:
- existingImageUrl が渡されたとき既存画像が表示されるテスト
- 変更ボタンをタップしたときファイル入力が起動するテスト
- 削除ボタンをタップしたとき null が emit されるテスト

### Phase D: NoteForm・NoteEditView 画像連携 (P2)

**対象ファイル**: `src/components/NoteForm.vue`、`src/views/NoteEditView.vue`

**NoteForm の変更**:
- `initialImageUrl?: string | null` prop を追加
- ImagePicker に `:existing-image-url="initialImageUrl"` を渡す

**NoteEditView の変更**:
- `onMounted` で既存の `imageId` から IndexedDB 経由で画像 blob を取得し ObjectURL を生成
- NoteForm に `:initialImageUrl="existingImageUrl"` を渡す
- AppHeader に差し替え（← 戻る + ホームアイコン）
- `onBeforeRouteLeave` で未保存変更がある場合に破棄確認ダイアログを表示

### Phase E: ナビゲーション統一 (P3)

**対象ファイル**: 全 View（NoteDetailView, NoteCreateView, SettingsView）

**変更内容**:
- 各画面のインラインヘッダーを `AppHeader` コンポーネントに差し替え
- NoteCreateView に `onBeforeRouteLeave` 破棄確認を追加
- SettingsView で showBack=true、showHome=true に設定

### Phase F: 設定画面 + 静的コンテンツ画面 (P4)

**対象ファイル**: `src/views/SettingsView.vue`、新規 `PrivacyPolicyView.vue`、`LicenseView.vue`

**SettingsView の変更**:
- 「情報」セクションを追加し、プライバシーポリシー・ライセンスへのナビゲーションリストを配置

**PrivacyPolicyView（新規）**:
- AppHeader（タイトル: 「プライバシーポリシー」、showBack: true、showHome: true）
- 静的テキストコンテンツ（ローカル保存のみ・外部送信なし・収集情報なしの説明）

**LicenseView（新規）**:
- AppHeader（タイトル: 「ライセンス」）
- コード内定数で管理するライブラリ一覧（Vue, Pinia, Vite, Dexie, vue-i18n, Tailwind 等）

**Router の変更**:
```
{ path: '/privacy-policy', name: 'privacy-policy', component: PrivacyPolicyView }
{ path: '/licenses', name: 'licenses', component: LicenseView }
```
