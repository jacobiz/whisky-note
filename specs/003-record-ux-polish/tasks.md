# Tasks: 記録アプリ UX 拡充

**Input**: Design documents from `/specs/003-record-ux-polish/`
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, quickstart.md ✅

**Tests**: 憲法 II「テストファースト（NON-NEGOTIABLE）」に従い、全タスクで TDD サイクル（Red → Green → Refactor）を厳守する。テストタスクは必ず実装タスクより先に実行し、Red を確認してから実装に進む。

## Format: `[ID] [P?] [Story] 説明とファイルパス`

- **[P]**: 並列実行可能（別ファイル、依存関係なし）
- **[Story]**: 対応するユーザーストーリー（US1〜US4）

---

## Phase 1: Setup（共通基盤）

**Purpose**: 本機能に必要な追加設定（既存プロジェクト構造は確立済みのため最小限）

- [x] T001 i18n キーに `common.home`（ホームに戻る）・`settings.privacyPolicy`・`settings.licenses` を `src/i18n/locales/ja.json` と `src/i18n/locales/en.json` に追加する

---

## Phase 2: Foundational（ブロッキング前提条件）

**Purpose**: US3（ナビゲーション統一）および全 View の AppHeader 差し替えに必要な共通コンポーネントを先行作成する

**⚠️ CRITICAL**: Phase 3〜6 のナビゲーション統一実装はこのフェーズの完了後に行う

### AppHeader コンポーネントのテスト（Red を確認してから実装）

- [x] T002 [P] `tests/components/AppHeader.test.ts` を新規作成し「showBack=true のとき「← 戻る」ボタンが表示される」テストを記述する（Red を確認）
- [x] T003 [P] `tests/components/AppHeader.test.ts` に「showHome=false のときホームアイコンが表示されない」テストを追加する（Red を確認）
- [x] T004 [P] `tests/components/AppHeader.test.ts` に「onBack prop が渡されたとき戻るボタン押下で onBack が呼ばれる」テストを追加する（Red を確認）
- [x] T005 [P] `tests/components/AppHeader.test.ts` に「onHome prop が渡されたとき、ホームアイコン押下で onHome が呼ばれる」テストを追加する（Red を確認）

### AppHeader コンポーネントの実装

- [x] T006 `src/components/AppHeader.vue` を新規作成する。Props: `title: string`, `showBack?: boolean`（default: true）, `showHome?: boolean`（default: true）, `onBack?: () => void`, `onHome?: () => void`。レイアウト: 左端「← 戻る」ボタン、中央タイトル（flex-1 truncate）、右端ホームアイコン（🏠 SVG）の後に `<slot name="actions" />`（デフォルト空）を配置する

**Checkpoint**: `AppHeader` が全テストをパスすること（T002〜T005 が Green）

---

## Phase 3: User Story 1 — 詳細画面で全入力情報を確認する (Priority: P1) 🎯 MVP

**Goal**: NoteDetailView に記録された全フィールドを漏れなく表示し、ボトル画像を縦長で表示する

**Independent Test**: 全フィールド入力済みのノートを開き、外観・香り・味わい・余韻・メモ・評価・蒸留所・ヴィンテージ・画像がすべて表示されることを確認できる

### テスト（Red → Green）

- [x] T007 [P] [US1] `tests/views/NoteDetailView.test.ts` を新規作成し「全フィールド入力済みのとき appearance/nose/palate/finish/notes/rating/distillery/vintage が表示される」テストを記述する（Red を確認）
- [x] T008 [P] [US1] `tests/views/NoteDetailView.test.ts` に「未入力フィールドは表示されない」テストを追加する（Red を確認）
- [x] T009 [P] [US1] `tests/views/NoteDetailView.test.ts` に「画像コンテナが `.aspect-\\[2/3\\]` クラスを持つ」テストを追加する（Red を確認）

### 実装

- [x] T010 [US1] `src/views/NoteDetailView.vue` のサムネイル表示を `h-48 object-cover` → `aspect-[2/3] w-full max-w-[240px] mx-auto object-contain` に変更する
- [x] T011 [US1] `src/views/NoteDetailView.vue` のヘッダーを `AppHeader` コンポーネントに差し替える（title: `note.brandName`、showBack: true、showHome: true）。既存の編集・削除ボタンは `<template #actions>` スロットに移動して維持する

**Checkpoint**: NoteDetailView の全テスト（T007〜T009）が Green であること

---

## Phase 4: User Story 2 — 編集画面で画像を縦長表示・再撮影する (Priority: P2)

**Goal**: ImagePicker を縦長表示に変更し、編集時に既存画像を表示・変更・削除できるようにする

**Independent Test**: 画像付きノートの編集画面を開いたとき、縦長サムネイルが即時表示され、変更・削除操作が完了できることを確認できる

### ImagePicker のテスト（Red → Green）

- [x] T012 [P] [US2] `tests/components/ImagePicker.test.ts` に「existingImageUrl prop を渡したとき img 要素が表示される」テストを追加する（Red を確認）
- [x] T013 [P] [US2] `tests/components/ImagePicker.test.ts` に「画像表示コンテナが縦長アスペクト比（aspect-[2/3] 相当）を持つ」テストを追加する（Red を確認）
- [x] T014 [P] [US2] `tests/components/ImagePicker.test.ts` に「削除ボタン（×）をクリックしたとき update:modelValue で null が emit される」テストを追加する（Red を確認）
- [x] T015 [P] [US2] `tests/components/ImagePicker.test.ts` に「existingImageUrl がある状態で削除後、img が非表示になる」テストを追加する（Red を確認）
- [x] T015b [P] [US2] `tests/components/ImagePicker.test.ts` に「新しい画像を選択後キャンセル（ファイル選択ダイアログを閉じる）した場合、existingImageUrl の画像が維持される」テストを追加する（Red を確認）

### ImagePicker の実装

- [x] T016 [US2] `src/components/ImagePicker.vue` に `existingImageUrl?: string | null` prop を追加し、`previewUrl || existingImageUrl` で画像を表示する
- [x] T017 [US2] `src/components/ImagePicker.vue` の画像コンテナを `h-48` → `aspect-[2/3] max-w-[180px] mx-auto overflow-hidden rounded-xl` に変更する。`object-cover` → `object-contain` に変更する
- [x] T018 [US2] `src/components/ImagePicker.vue` の画像表示時ボタンを変更ボタン（カメラアイコン）と削除ボタン（×）の2ボタン構成に変更する。削除ボタンは既存の `removeImage()` を呼ぶ

### NoteForm のテスト（Red → Green）

- [x] T019 [P] [US2] `tests/components/NoteForm.test.ts` に「initialImageUrl prop が ImagePicker の existingImageUrl に伝播する」テストを追加する（Red を確認）

### NoteForm の実装

- [x] T020 [US2] `src/components/NoteForm.vue` に `initialImageUrl?: string | null` prop を追加し、ImagePicker へ `:existing-image-url="initialImageUrl"` として渡す

### NoteEditView のテスト（Red → Green）

- [x] T021 [P] [US2] `tests/views/NoteEditView.test.ts` を新規作成し「imageId を持つノートの編集画面で img が表示される」テストを記述する（Red を確認）

### NoteEditView の実装

- [x] T022 [US2] `src/views/NoteEditView.vue` の `onMounted` で `imageId` が存在する場合に IndexedDB から blob を取得し `URL.createObjectURL()` で ObjectURL を生成する。`onUnmounted` で `URL.revokeObjectURL()` を呼ぶ
- [x] T023 [US2] `src/views/NoteEditView.vue` の NoteForm に `:initial-image-url="existingImageUrl"` を渡す

**Checkpoint**: ImagePicker・NoteForm・NoteEditView の全テスト（T012〜T021）が Green であること

---

## Phase 5: User Story 3 — ナビゲーション戻るボタンの挙動を統一する (Priority: P3)

**Goal**: 全 View のヘッダーを AppHeader に差し替え、破棄確認を実装してナビゲーションを統一する

**Independent Test**: 各画面で「← 戻る」と「ホームアイコン」がそれぞれ正しい遷移先に移動し、未保存変更ありの場合に破棄確認が表示されることを確認できる

### NoteDetailView ナビゲーションのテスト（Red → Green）

- [x] T024a [P] [US3] `tests/views/NoteDetailView.test.ts` に「ホームアイコンをクリックすると home ルートへ遷移する」テストを追加する（Red を確認）

### NoteEditView ナビゲーション・破棄確認のテスト（Red → Green）

- [x] T024 [P] [US3] `tests/views/NoteEditView.test.ts` に「AppHeader が表示される」テストを追加する（Red を確認）
- [x] T025 [P] [US3] `tests/views/NoteEditView.test.ts` に「フォーム変更後にルート離脱したとき window.confirm が呼ばれる」テストを追加する（vi.spyOn(window, 'confirm') を使用、Red を確認）

### NoteEditView ナビゲーションの実装

- [x] T026 [US3] `src/views/NoteEditView.vue` のヘッダーを `AppHeader` に差し替える（showBack: true、showHome: true）
- [x] T027 [US3] `src/views/NoteEditView.vue` に `onBeforeRouteLeave` を追加し、フォームに未保存変更がある場合は `window.confirm(t('common.discardChanges'))` を表示する。キャンセル時はナビゲーションをブロックする

### NoteCreateView のテスト（Red → Green）

- [x] T028 [P] [US3] `tests/views/NoteCreateView.test.ts` を新規作成し「AppHeader が表示される」テストを記述する（Red を確認）
- [x] T029 [P] [US3] `tests/views/NoteCreateView.test.ts` に「フォーム入力後にルート離脱したとき window.confirm が呼ばれる」テストを追加する（Red を確認）

### NoteCreateView の実装

- [x] T030 [US3] `src/views/NoteCreateView.vue` のヘッダーを `AppHeader` に差し替える（showBack: true、showHome: true）
- [x] T031 [US3] `src/views/NoteCreateView.vue` に `onBeforeRouteLeave` を追加し、フォームに入力がある場合は `window.confirm` による破棄確認を表示する

**Checkpoint**: 全ナビゲーションテスト（T024〜T029）が Green であること

---

## Phase 6: User Story 4 — 設定画面からプライバシーポリシーとライセンスを確認する (Priority: P4)

**Goal**: 設定画面にプライバシーポリシー・ライセンスへのナビゲーションを追加し、静的コンテンツ画面を新規作成する

**Independent Test**: 設定画面から「プライバシーポリシー」・「ライセンス」をタップして各画面が開き、「← 戻る」で設定画面に戻れることを確認できる

### PrivacyPolicyView のテスト（Red → Green）

- [x] T032 [P] [US4] `tests/views/PrivacyPolicyView.test.ts` を新規作成し「プライバシーポリシーの見出しが表示される」テストを記述する（Red を確認）
- [x] T033 [P] [US4] `tests/views/PrivacyPolicyView.test.ts` に「ローカル保存のみ・外部送信なしの説明テキストが存在する」テストを追加する（Red を確認）

### LicenseView のテスト（Red → Green）

- [x] T034 [P] [US4] `tests/views/LicenseView.test.ts` を新規作成し「Vue / Pinia / Dexie.js 等のライブラリ名が表示される」テストを記述する（Red を確認）

### SettingsView のテスト（Red → Green）

- [x] T035 [P] [US4] `tests/views/SettingsView.test.ts` を新規作成し「プライバシーポリシーへのナビゲーション項目が存在する」テストを記述する（Red を確認）
- [x] T036 [P] [US4] `tests/views/SettingsView.test.ts` に「ライセンスへのナビゲーション項目が存在する」テストを追加する（Red を確認）

### ルーターと静的画面の実装

- [x] T037 [US4] `src/router/index.ts` に `/privacy-policy`（name: `privacy-policy`）と `/licenses`（name: `licenses`）のルートを追加する
- [x] T038 [P] [US4] `src/views/PrivacyPolicyView.vue` を新規作成する。AppHeader（title: t('settings.privacyPolicy')、showBack: true、showHome: true）とローカル保存のみ・収集情報なしを明記した静的テキストコンテンツを実装する
- [x] T039 [P] [US4] `src/views/LicenseView.vue` を新規作成する。AppHeader（title: t('settings.licenses')）とコード内定数で定義したライブラリ一覧（Vue、Pinia、Vue Router、vue-i18n、Vite、Dexie.js、Tailwind CSS、browser-image-compression、vite-plugin-pwa、Workbox）を表示する実装をする

### SettingsView の実装

- [x] T040 [US4] `src/views/SettingsView.vue` のヘッダーを `AppHeader` に差し替え、「情報」セクションを追加してプライバシーポリシーと ライセンスへの `router.push` ナビゲーションアイテムを実装する

**Checkpoint**: 全 US4 テスト（T032〜T036）が Green であること

---

## Phase 7: Polish & 横断的関心事

**Purpose**: 全ユーザーストーリーに影響する仕上げ作業

- [x] T041 [P] `npm test -- --run` を実行して全テスト（55件+新規追加分）がパスすることを確認する
- [x] T042 [P] `npm run build` を実行してビルドエラーがないことを確認する
- [x] T043 i18n キー `common.discardChanges`（変更を破棄しますか？）を `src/i18n/locales/ja.json` と `en.json` に追加する（T001 で未追加の場合）
- [x] T044 各フェーズの実装をコミットし `master` ブランチへのマージと GitHub Pages へのデプロイを確認する

---

## Dependencies & Execution Order

### フェーズ依存関係

- **Setup（Phase 1）**: 依存なし — 即時開始可能
- **Foundational（Phase 2）**: Phase 1 完了後 — AppHeader は US3〜US4 の全 View 差し替えをブロック
- **US1（Phase 3）**: Phase 1 完了後に開始可能（AppHeader なしで画像修正のみ先行可能）
- **US2（Phase 4）**: Phase 1 完了後に開始可能（AppHeader 不要）
- **US3（Phase 5）**: Phase 2（AppHeader）完了後
- **US4（Phase 6）**: Phase 2（AppHeader）完了後
- **Polish（Phase 7）**: 全フェーズ完了後

### ユーザーストーリー依存関係

- **US1**: Phase 1 完了後に独立して実施可能
- **US2**: Phase 1 完了後に独立して実施可能（US1 と並列可）
- **US3**: Phase 2（AppHeader）完了後
- **US4**: Phase 2（AppHeader）完了後（US3 と並列可）

### TDD サイクル（各タスク内）

1. テストを書く → Red 確認
2. 最小限の実装 → Green 確認
3. リファクタリング → Green 維持

### 並列実行可能なタスク

- T002〜T005（AppHeader テスト群）は並列記述可能
- T007〜T009（US1 テスト群）は並列記述可能
- T012〜T015（ImagePicker テスト群）は並列記述可能
- T032〜T036（US4 テスト群）は並列記述可能
- T038〜T039（PrivacyPolicyView / LicenseView 実装）は並列実施可能

---

## Parallel Example: US2

```bash
# ImagePicker テスト群を並列記述:
T012: existingImageUrl prop の表示テスト
T013: 縦長アスペクト比テスト
T014: 削除ボタン → null emit テスト
T015: 削除後の非表示テスト

# ImagePicker 実装（T012〜T015 が Red 確認後）:
T016: existingImageUrl prop 追加
T017: 縦長コンテナ変更
T018: 変更/削除ボタン構成変更

# NoteForm・NoteEditView は ImagePicker 完了後に直列で実施
```

---

## Implementation Strategy

### MVP First（US1 のみ）

1. Phase 1: Setup（T001）
2. Phase 3: US1（T007〜T011）
3. **STOP & VALIDATE**: 詳細画面で全フィールドが表示されることを確認
4. デプロイ可能な状態

### Incremental Delivery

1. Phase 1 + Phase 2（AppHeader）→ 基盤完成
2. Phase 3（US1）→ 詳細画面改善 → デプロイ/デモ
3. Phase 4（US2）→ 編集画面画像改善 → デプロイ/デモ
4. Phase 5（US3）→ ナビゲーション統一 → デプロイ/デモ
5. Phase 6（US4）→ 法的要件対応 → デプロイ/デモ

---

## Notes

- TDD は憲法 II により NON-NEGOTIABLE。テストの Red 確認なしに実装を開始してはならない
- `window.confirm` のテストには `vi.spyOn(window, 'confirm').mockReturnValue(true/false)` を使用する
- ObjectURL（`blob:` プレフィックス）のメモリリークを防ぐため、`onUnmounted` での `revokeObjectURL` を必ず実装する
- AppHeader の `onBack`/`onHome` は省略時に `router.back()` / `router.push({ name: 'home' })` を実行するデフォルト挙動を持つ
- `[P]` タスクは異なるファイルを対象とし相互依存がないため並列実施可能
