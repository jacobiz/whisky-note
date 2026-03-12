# Quickstart: 記録アプリ UX 拡充

**Date**: 2026-03-12
**Branch**: `003-record-ux-polish`

## 前提条件

- Node.js 20+
- npm
- ブランチ `003-record-ux-polish` にチェックアウト済み

## セットアップ

```bash
# 依存関係インストール
npm ci --legacy-peer-deps

# 開発サーバー起動
npm run dev
# → http://localhost:5173/whisky-note/
```

## 開発サイクル（TDD）

```bash
# テスト監視モード（実装前にテストを書いて Red を確認）
npm test

# 特定テストのみ実行
npm test -- tests/components/AppHeader.test.ts
npm test -- tests/components/ImagePicker.test.ts
npm test -- tests/views/NoteDetailView.test.ts

# 全テスト実行
npm test -- --run
```

## 実装順序

1. **Phase A** — `NoteDetailView` の画像縦長化・テスト作成
2. **Phase B** — `AppHeader` コンポーネント新規作成・テスト作成
3. **Phase C** — `ImagePicker` の縦長表示・既存画像・削除対応・テスト更新
4. **Phase D** — `NoteForm` / `NoteEditView` の画像連携・テスト作成
5. **Phase E** — 全 View への `AppHeader` 差し替え・破棄確認・テスト作成
6. **Phase F** — 設定画面拡充・`PrivacyPolicyView` / `LicenseView` 新規作成・テスト作成

## 主要ファイルマップ

| 変更種別 | ファイル |
|---------|---------|
| 新規コンポーネント | `src/components/AppHeader.vue` |
| 修正コンポーネント | `src/components/ImagePicker.vue` |
| 修正コンポーネント | `src/components/NoteForm.vue` |
| 修正 View | `src/views/NoteDetailView.vue` |
| 修正 View | `src/views/NoteEditView.vue` |
| 修正 View | `src/views/NoteCreateView.vue` |
| 修正 View | `src/views/SettingsView.vue` |
| 新規 View | `src/views/PrivacyPolicyView.vue` |
| 新規 View | `src/views/LicenseView.vue` |
| 修正 Router | `src/router/index.ts` |

## 検証方法

```bash
# 全テスト通過確認
npm test -- --run

# ビルド確認
npm run build

# 型チェック
npm run build  # vue-tsc が内包
```

## 注意事項

- `ImagePicker` の `existingImageUrl` prop は `ObjectURL`（`blob:` URL）を受け取る。IndexedDB の `blob` からは `URL.createObjectURL()` で生成する
- ObjectURL はコンポーネントの `onUnmounted` で必ず `URL.revokeObjectURL()` を呼んで解放する
- `onBeforeRouteLeave` での破棄確認は `window.confirm` を使用する（テスト時は `vi.spyOn(window, 'confirm')` でモック）
- プライバシーポリシーの本文テキストは `src/views/PrivacyPolicyView.vue` に直接記述する
