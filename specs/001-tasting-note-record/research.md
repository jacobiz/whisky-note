# Research: ウィスキーテイスティングノート記録

**Branch**: `001-tasting-note-record` | **Date**: 2026-03-11

## フロントエンドフレームワーク

**Decision**: Vue 3（Composition API）

**Rationale**:
- Vite との統合が最も密接（Evan You が Vite・Vue 双方を維持）
- モバイルバンドルサイズ ~34KB（React の ~43KB より小さい）
- Composition API による Dexie.js ラッパーが直感的
- vue-i18n が日本語コミュニティで広く採用されており、ドキュメントも充実

**Alternatives considered**:
- React: バンドルが大きめだが testing エコシステムは最大。採用しなかった理由: Vue との差は本プロジェクト規模では無視できる。
- Svelte: 最軽量だが svelte-i18n のメンテ状況に懸念あり、テストエコシステムも成熟途上。

---

## スタイリング

**Decision**: Tailwind CSS v3（ダークモード: `class` 戦略）

**Rationale**:
- `dark:` クラスでダークテーマを一貫管理できる
- カスタムカラー（金色アクセント #B8860B など）を `tailwind.config.js` で一元定義
- PurgeCSS 統合により本番バンドルを最小化

**Alternatives considered**:
- CSS Modules + CSS変数: 依存なしでシンプルだが、ダークテーマの管理が煩雑になる。

---

## 状態管理

**Decision**: Pinia v2

**Rationale**:
- Vue 3 公式の状態管理ライブラリ（Vuex の後継）
- 下書き自動保存（FR-012）・言語設定（FR-008）などのグローバル状態が必要
- DevTools 統合・TypeScript サポートが充実
- Composition API ベースでボイラープレートが少ない（シンプル設計原則に適合）

**Alternatives considered**:
- Composition API のみ（useState 相当）: グローバル状態の管理が複数コンポーネント間で煩雑になる。

---

## データベース

**Decision**: Dexie.js v4（IndexedDB ラッパー）

**Rationale**: 憲法にて指定済み。Promise ベース API でコードが読みやすく、TypeScript サポートが優秀。

---

## i18n

**Decision**: vue-i18n v9+

**Rationale**:
- Vue 公式プラグイン。`useI18n()` Composition API で各コンポーネントに統合しやすい
- 日本語ロケールのサポートが充実（数値フォーマット・日付など）
- 翻訳ファイルは `src/i18n/locales/ja.json` / `en.json` の 2 ファイル構成

---

## 画像圧縮

**Decision**: browser-image-compression v2

**Rationale**:
- `maxSizeMB: 0.5` で 500KB 上限を宣言的に設定できる
- Web Worker 対応（非同期・UI ブロッキングなし）
- EXIF 自動除去（プライバシー保護）
- Promise ベース API で Vue Composition API と相性が良い

**Alternatives considered**:
- Canvas API（ライブラリなし）: EXIF 処理を自前実装する必要があり、シンプル設計原則に反する。

---

## PWA

**Decision**: vite-plugin-pwa + Workbox

**Rationale**: Vite エコシステムのデファクトスタンダード。Service Worker 生成・マニフェスト管理を自動化。

---

## テスト

**Decision**: Vitest + @testing-library/vue

**Rationale**:
- Vite と同じ設定ファイルを共有でき、設定コストがゼロに近い
- `@testing-library/vue` でユーザー視点のコンポーネントテストが書きやすい
- 憲法の「Vitest または Jest + Testing Library」に準拠

---

## TypeScript

**Decision**: TypeScript（strict モード）

**Rationale**: 型安全性により Dexie.js スキーマとアプリロジックの整合性を静的に保証できる。
