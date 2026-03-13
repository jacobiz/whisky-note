# Implementation Plan: PWA強化 & ウィスキー用語辞典

**Branch**: `006-pwa-whisky-glossary` | **Date**: 2026-03-12 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/006-pwa-whisky-glossary/spec.md`

## Summary

PWA の本来要件（オフライン動作・インストール促進）を満たしつつ、アプリ内にウィスキー用語辞典を追加する。
技術的アプローチ: Service Worker 更新を `'prompt'` モードに切り替えてトースト通知を実装、`beforeinstallprompt` イベントを Composable でハンドリングし設定画面にインストールボタンを追加。用語辞典は静的 JSON + Vue ルート（`/glossary`）+ アコーディオン UI で実装する。

---

## Technical Context

**Language/Version**: TypeScript 5.7 + Vue 3.5（Composition API）
**Primary Dependencies**: Vite 6 + vite-plugin-pwa 0.21（既存）、vue-i18n v9、Pinia 2
**Storage**: IndexedDB（Dexie.js 4）— 本フィーチャーでスキーマ変更なし。辞典データは静的 JSON バンドル
**Testing**: Vitest 3 + @testing-library/vue 8
**Target Platform**: PWA（Chrome/Safari/Firefox 最新2バージョン、375px〜）
**Project Type**: モバイルファースト PWA
**Performance Goals**: 辞典検索 < 0.3s、Lighthouse PWA ≥ 90
**Constraints**: オフラインファースト必須、外部通信禁止、IndexedDB スキーマ変更なし
**Scale/Scope**: 用語辞典 60件（初期）、単一ユーザー・デバイスローカル

---

## Constitution Check

*GATE: 実装前に通過必須*

| 原則 | 評価 | 根拠 |
|------|------|------|
| I. ローカルファースト | ✅ PASS | 辞典データは静的JSONバンドル、外部通信なし |
| II. テストファースト | ✅ PASS | 各タスクでテスト先行（TDD）を徹底 |
| III. シンプル設計 | ✅ PASS | Repository パターン・DI コンテナ不使用。composable + 静的JSON のみ |
| IV. モバイル最適化 | ✅ PASS | Service Worker + Manifest 対応が本フィーチャーの主目的 |
| V. 日本語コミュニケーション | ✅ PASS | 全ドキュメント・コメント日本語 |

**Complexity Tracking**: 対象なし（シンプル設計原則違反なし）

---

## Project Structure

### Documentation (this feature)

```text
specs/006-pwa-whisky-glossary/
├── plan.md              ← このファイル
├── research.md          ← Phase 0 出力
├── data-model.md        ← Phase 1 出力
└── tasks.md             ← /speckit.tasks コマンドで生成予定
```

### Source Code（本フィーチャーで新規追加・変更するファイル）

```text
src/
├── data/
│   └── glossary.json                  ← 新規: 用語辞典データ（60件）
│
├── composables/
│   ├── useInstallPrompt.ts            ← 新規: インストールプロンプト管理
│   └── useGlossary.ts                 ← 新規: 辞典検索・カテゴリフィルタ
│
├── components/
│   ├── AppToast.vue                   ← 新規: SW更新トースト（汎用）
│   └── GlossaryModal.vue              ← 新規: ノートフォーム内辞典モーダル
│
├── views/
│   └── GlossaryView.vue               ← 新規: 辞典一覧画面（/glossary）
│
├── router/
│   └── index.ts                       ← 変更: /glossary ルート追加
│
├── i18n/locales/
│   ├── ja.json                        ← 変更: install・glossary キー追加
│   └── en.json                        ← 変更: install・glossary キー追加
│
├── App.vue                            ← 変更: AppToast + useRegisterSW 追加
├── views/HomeView.vue                 ← 変更: 辞典ボタンをヘッダーに追加
├── views/SettingsView.vue             ← 変更: インストールセクション追加
└── components/NoteForm.vue            ← 変更: 辞典モーダルボタン追加

vite.config.ts                         ← 変更: registerType を 'prompt' に
index.html                             ← 変更: Apple Touch Icon メタタグ追加

tests/
├── composables/
│   ├── useInstallPrompt.test.ts       ← 新規
│   └── useGlossary.test.ts            ← 新規
├── components/
│   ├── AppToast.test.ts               ← 新規
│   └── GlossaryModal.test.ts          ← 新規
└── views/
    └── GlossaryView.test.ts           ← 新規
```

---

## Implementation Phases

### フェーズ A: PWA 基盤強化（SW更新通知 + インストール促進）

**目標**: Lighthouse PWA ≥90 達成、オフライン動作保証、インストールボタン機能

#### A-1: vite.config.ts の registerType 変更

- `registerType: 'autoUpdate'` → `'prompt'` に変更
- 変更により SW は自動スキップウェイティングを停止し、`needRefresh` トリガーが有効になる

#### A-2: AppToast.vue 実装（TDD）

新規汎用トーストコンポーネント。

```
props: message: string, actionLabel?: string
emits: action（アクションボタンクリック）, close（×クリック）
表示位置: 画面下部（safe-area-inset-bottom 考慮）
スタイル: bg-surface-elevated, border-gold-muted, text-ink-primary
```

テスト:
- トーストがメッセージを表示する
- アクションボタンクリックで `action` emit
- × ボタンクリックで `close` emit

#### A-3: App.vue に SW更新トースト追加（TDD）

`useRegisterSW` を App.vue に追加し、`needRefresh === true` のとき AppToast を表示する。
ユーザーがトーストをタップ（`action` emit）すると `updateServiceWorker()` を呼び出してリロード。

```vue
<AppToast
  v-if="needRefresh"
  :message="t('pwa.updateAvailable')"
  :action-label="t('pwa.reload')"
  @action="updateServiceWorker()"
  @close="needRefresh = false"
/>
```

#### A-4: useInstallPrompt.ts 実装（TDD）

```ts
// 公開 API
canInstall: ComputedRef<boolean>   // deferredPrompt !== null
isIos: Ref<boolean>                // iOS Safari 判定
promptInstall: () => Promise<void> // プロンプト表示
```

テスト（jsdom で `beforeinstallprompt` をモック）:
- `beforeinstallprompt` 発火で `canInstall === true`
- `promptInstall()` で `deferredPrompt.prompt()` が呼ばれる
- `appinstalled` 発火で `canInstall === false`
- iOS UA で `isIos === true`

#### A-5: SettingsView にインストールセクション追加（TDD）

`useInstallPrompt` を SettingsView に注入し、`canInstall` または `isIos` が true のときセクションを表示する。

```
canInstall: 「ホーム画面に追加」ボタンを表示
isIos: 「共有ボタン（□↑）→ ホーム画面に追加」テキスト案内を表示
両方 false: セクション非表示
```

テスト:
- `canInstall === true` のとき「ホーム画面に追加」ボタンが表示される
- ボタンクリックで `promptInstall` が呼ばれる
- `canInstall === false && isIos === false` のとき セクションが非表示

#### A-6: index.html に Apple Touch Icon メタタグ追加

```html
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<link rel="apple-touch-icon" href="/whisky-note/icons/icon-192x192.png">
```

---

### フェーズ B: 用語辞典データ整備

**目標**: `src/data/glossary.json` に 60件の用語データを用意し検索・フィルタを実装

#### B-1: glossary.json 作成

`data-model.md` の用語一覧（60件）を JSON として実装する。
各用語: `id, termJa, termEn, category, definitionJa, definitionEn, examplesJa?, examplesEn?`

`docs/whisky-tasting.md` / `docs/whisky-tasting-en.md` から定義文を抽出して充実させる。

#### B-2: useGlossary.ts 実装（TDD）

```ts
// 公開 API（引数: locale: 'ja' | 'en'）
terms: ComputedRef<GlossaryTerm[]>          // 全件
filteredTerms: ComputedRef<GlossaryTerm[]>  // 検索・カテゴリフィルタ適用後
searchQuery: Ref<string>                    // 検索ワード
selectedCategory: Ref<GlossaryCategory | null>
```

検索ロジック: `termJa | termEn | definitionJa | definitionEn` の部分一致（大文字小文字無視）

テスト:
- 全件が返却される
- 検索クエリ「peaty」でフィルタされる
- カテゴリ `'flavour-wheel'` でフィルタされる
- 検索 + カテゴリの複合フィルタ

---

### フェーズ C: 用語辞典 UI（GlossaryView）

**目標**: `/glossary` ルートで辞典閲覧・検索・カテゴリフィルタが動作する

#### C-1: i18n キー追加

```json
"pwa": {
  "updateAvailable": "新しいバージョンが利用可能です",
  "reload": "今すぐ更新"
},
"install": {
  "sectionTitle": "アプリのインストール",
  "addToHomeScreen": "ホーム画面に追加",
  "iosGuide": "Safariの共有ボタン（□↑）→「ホーム画面に追加」をタップ"
},
"glossary": {
  "title": "用語辞典",
  "searchPlaceholder": "用語を検索...",
  "noResults": "該当する用語が見つかりません",
  "allCategories": "すべて",
  "categories": {
    "tasting-process": "テイスティング",
    "flavour-wheel": "フレーバー",
    "mouthfeel": "マウスフィール",
    "finish": "フィニッシュ",
    "production": "製造・熟成",
    "region": "産地",
    "general": "一般"
  }
}
```

ja.json / en.json の両方に追加。

#### C-2: GlossaryView.vue 実装（TDD）

ルート: `/glossary`（lazy import）

UI 構造:
```
<AppHeader title="用語辞典" showBack showHome />
<main>
  <input type="search" v-model="searchQuery" />   ← 検索ボックス
  <カテゴリタブ（水平スクロール）>                  ← 7カテゴリ + "すべて"
  <ul>
    <li v-for="term in filteredTerms">
      ← タップでアコーディオン展開
      <div class="accordion-header"> termJa / termEn </div>
      <div v-show="activeId === term.id">
        definitionJa / definitionEn + examples
      </div>
    </li>
  </ul>
  <p v-if="filteredTerms.length === 0"> {{ t('glossary.noResults') }} </p>
</main>
```

テスト:
- 全用語が表示される
- 検索ボックス入力で絞り込まれる
- カテゴリタブクリックでフィルタされる
- 用語タップでアコーディオン展開・再タップで閉じる
- 言語切り替えで表示言語が変わる

#### C-3: Router に /glossary 追加

```ts
{
  path: '/glossary',
  name: 'glossary',
  component: () => import('@/views/GlossaryView.vue'),
}
```

#### C-4: HomeView ヘッダーに辞典ボタン追加

既存ヘッダーの設定ボタン（歯車アイコン）の左隣に本アイコンボタンを追加する。

```vue
<!-- 辞典ボタン（設定ボタン左隣） -->
<button @click="router.push({ name: 'glossary' })" :aria-label="t('glossary.title')">
  <!-- 本アイコン SVG -->
</button>
```

テスト:
- 辞典ボタンが表示される
- クリックで `/glossary` に遷移する

---

### フェーズ D: 辞典モーダル（NoteForm 連携）

**目標**: ノート作成・編集フォームから辞典をモーダルで参照できる

#### D-1: GlossaryModal.vue 実装（TDD）

`<teleport to="body">` を使用したフルスクリーンモーダルシート。

```
props: visible: boolean
emits: close
内部: useGlossary（検索・カテゴリフィルタ）
表示: 画面下から上にスライドアップ（CSS transition）
内容: GlossaryView と同じ検索・カテゴリ・アコーディオン UI
      ヘッダーに「閉じる」ボタン
```

テスト:
- `visible === true` のとき表示される
- 「閉じる」ボタンクリックで `close` emit
- 検索・フィルタが動作する

#### D-2: NoteForm.vue に辞典ボタン追加

保存ボタン（`<button type="submit">`）の直前に「用語辞典を参照」ボタンを追加する。クリックで `showGlossary` ref を `true` にし `<GlossaryModal>` を表示する。

```vue
<!-- 辞典参照ボタン -->
<button type="button" @click="showGlossary = true" class="...">
  📖 {{ t('glossary.title') }}
</button>

<!-- 辞典モーダル -->
<GlossaryModal :visible="showGlossary" @close="showGlossary = false" />
```

テスト:
- 「用語辞典を参照」ボタンが表示される
- クリックで GlossaryModal が表示される
- モーダルを閉じてもフォーム入力値が保持される

---

## テスト計画

| ファイル | テスト数（予測） | カバー範囲 |
|---------|----------------|-----------|
| `useInstallPrompt.test.ts` | 5 | canInstall, isIos, promptInstall |
| `useGlossary.test.ts` | 6 | 全件返却, 検索, カテゴリ, 複合 |
| `AppToast.test.ts` | 4 | 表示, action emit, close emit |
| `GlossaryModal.test.ts` | 5 | 表示切替, close emit, 検索動作 |
| `GlossaryView.test.ts` | 7 | 全件表示, 検索, カテゴリ, アコーディオン, 言語切替 |

既存テスト（変更影響）:
- `SettingsView.test.ts`: インストールセクションのテスト追加
- `HomeView.test.ts` / `NoteCreateView.test.ts` / `NoteEditView.test.ts`: 辞典ボタン関連テスト追加

---

## 実装順序（推奨）

```
A-1 vite.config.ts 変更
  └→ A-2 AppToast.vue（TDD）
       └→ A-3 App.vue SW更新トースト（TDD）
A-4 useInstallPrompt.ts（TDD）
  └→ A-5 SettingsView インストールセクション（TDD）
A-6 index.html Apple メタタグ

B-1 glossary.json 作成
  └→ B-2 useGlossary.ts（TDD）
       └→ C-1 i18n キー追加
            └→ C-2 GlossaryView.vue（TDD）
                 └→ C-3 Router 追加
                      └→ C-4 HomeView 辞典ボタン（TDD）
                           └→ D-1 GlossaryModal.vue（TDD）
                                └→ D-2 NoteForm 辞典ボタン（TDD）
```
