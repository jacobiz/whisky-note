# Research: PWA強化 & ウィスキー用語辞典

**Branch**: `006-pwa-whisky-glossary` | **Date**: 2026-03-12

---

## 1. PWA インストールプロンプト（useInstallPrompt）

### 決定事項
`beforeinstallprompt` イベントを `window` でキャプチャし、`useInstallPrompt.ts` composable として実装する。

### 調査結果
`beforeinstallprompt` はブラウザが PWA インストール可能と判断したとき発火する。
- `.preventDefault()` でデフォルトプロンプトを抑制し、`deferredPrompt` として保持
- ユーザーがボタンを押したとき `deferredPrompt.prompt()` を呼ぶ
- `appinstalled` イベントでインストール済みを検知し、ボタンを非表示にする

```ts
// composable の骨格
const deferredPrompt = ref<BeforeInstallPromptEvent | null>(null)
const canInstall = computed(() => deferredPrompt.value !== null)

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault()
  deferredPrompt.value = e as BeforeInstallPromptEvent
})
window.addEventListener('appinstalled', () => {
  deferredPrompt.value = null
})
```

- iOS Safari は `beforeinstallprompt` 非対応。設定画面に「共有ボタン → ホーム画面に追加」の手順テキストを表示する（`navigator.userAgent` で iOS 判定）

### 代替案（棄却）
- アプリ内バナー表示: ユーザーの Q1 回答で棄却（設定ボタンのみ）

---

## 2. Service Worker 更新通知（updateAvailable トースト）

### 決定事項
`registerType` を `'autoUpdate'` から `'prompt'` に変更し、`vite-plugin-pwa/client` の `useRegisterSW` composable で更新を検知してトーストを表示する。

### 調査結果
現在の `vite.config.ts` では `registerType: 'autoUpdate'` が設定されており、SW は自動でスキップウェイティングする。これを `'prompt'` に変更すると、新 SW は待機状態に留まり `useRegisterSW` の `needRefresh` ref が `true` になる。

```ts
// App.vue で使用
const { needRefresh, updateServiceWorker } = useRegisterSW({
  onRegistered(sw) { /* 登録完了ログ */ },
})
// needRefresh が true のとき AppToast を表示
// ユーザーがトーストをタップ → updateServiceWorker() を呼ぶ
```

vite.config.ts の変更点：
```ts
registerType: 'prompt',  // 'autoUpdate' から変更
```

### 代替案（棄却）
- `'autoUpdate'`（現状）: 即時自動リロードによりフォーム入力中のデータが失われる可能性 → ユーザー Q3 回答で棄却

---

## 3. ホーム画面インストールボタンの配置

### 決定事項
HomeView の既存ヘッダー右端（設定ボタンの左隣）に辞典アイコンボタンを追加する。
SettingsView の「言語設定」セクション直前に「ホーム画面に追加」セクションを追加する。

### 調査結果
HomeView はユニーク：AppHeader コンポーネントを使わず独自ヘッダーを持つ。右端は現状 `<button>` 1個（設定アイコン）。

スペック clarify Q4 の回答「ホーム画面にカードボタン」は実装上、HomeView ヘッダーへのアイコンボタン追加として解釈する（ノート一覧が全画面を占めるため、別途カードエリアを設けると UX が乱れる）。辞典へのメインナビゲーションはヘッダーに絞り本を意味するアイコン（📖 or SVG）を使用する。

---

## 4. 辞典データの形式と配置

### 決定事項
静的 JSON ファイルとして `src/data/glossary.json` に配置し、Vite の静的インポート（`import data from '@/data/glossary.json'`）でバンドルに含める。

### 調査結果
- Vite はデフォルトで JSON ファイルをモジュールとしてバンドルする（ネットワークリクエスト不要）
- `workbox.globPatterns` の変更は不要（JSONはバンドルJS内に含まれる）
- `public/` 配置（fetch が必要）より `src/data/` 配置（バンドル内）の方がオフライン確実性が高い

初期収録数: **60件以上**（`docs/whisky-tasting.md` から抽出）

---

## 5. 辞典モーダルの実装方式

### 決定事項
`GlossaryModal.vue` コンポーネントを `<teleport to="body">` で実装する。`NoteForm.vue` に `showGlossary` ref + `<GlossaryModal>` を追加する（TextareaField の変更は最小化）。

### 調査結果
- `<teleport to="body">` でモーダルを body 直下に描画することで、親の `overflow: hidden` や `z-index` の影響を受けない
- `NoteForm.vue` に専用ボタンを1つ追加する方式を採用（各 TextareaField への改変を避けシンプルに保つ）
  - 「用語辞典を参照」ボタンをフォーム下部（保存ボタン直前）に配置
  - これにより TextareaField.vue の変更が不要

---

## 6. アコーディオン展開の実装

### 決定事項
Vue の `<Transition>` + `v-show` を使ったシンプルなアコーディオンを `GlossaryView.vue` 内で実装する。専用コンポーネントは作成しない（YAGNI）。

### 調査結果
- 1箇所でのみ使用するため、ユーティリティコンポーネント化は不要
- `activeId` ref を1つ持ち、タップで同じ ID なら閉じる・別 ID なら開くトグルロジック

---

## 7. iOS Safari インストール案内

### 決定事項
`navigator.userAgent` の `/iphone|ipad|ipod/i` 判定で iOS を検出し、SettingsView のインストールセクションで条件分岐表示する。

| 判定 | 表示内容 |
|------|----------|
| Android + `canInstall === true` | 「ホーム画面に追加」ボタン |
| iOS Safari | 「共有ボタン（□↑）をタップ → "ホーム画面に追加"を選択」テキスト案内 |
| `canInstall === false`（既インストール済み） | セクション非表示 |

---

## 8. Lighthouse スコア向上のための追加対応

### 調査結果（vite.config.ts 現状確認）
既存の manifest は以下をカバー済み：
- `name`, `short_name`, `description`, `theme_color`, `background_color`
- `display: 'standalone'`, `orientation: 'portrait'`, `start_url`
- 192px/512px アイコン（通常 + maskable）

追加で Lighthouse スコアを上げるために対応：
- `apple-mobile-web-app-capable` meta タグ（`index.html`）
- `apple-touch-icon` リンクタグ（`index.html`）
- `manifest.screenshots` フィールド（任意だがスコア向上）

→ `index.html` に Apple Touch Icon 関連メタタグを追加する。
