# Data Model: PWA強化 & ウィスキー用語辞典

**Branch**: `006-pwa-whisky-glossary` | **Date**: 2026-03-12

---

## 概要

このフィーチャーは新規データストア（IndexedDB スキーマ変更）を**持たない**。
既存データはそのまま。新たに追加されるデータは以下の2種類：

1. **GlossaryTerm** — 静的 JSON（`src/data/glossary.json`）、読み取り専用
2. **BeforeInstallPromptEvent** — メモリ内のみ（永続化なし）

---

## 1. GlossaryTerm（用語エントリ）

### TypeScript インターフェース

```ts
// src/data/glossary.ts（型定義）
export type GlossaryCategory =
  | 'tasting-process'   // テイスティングプロセス（外観・香り・味わい・余韻・加水）
  | 'flavour-wheel'     // フレーバーホイール（フルーティ・スモーキー等）
  | 'mouthfeel'         // マウスフィール（粘度・とろみ・アタック等）
  | 'finish'            // フィニッシュ表現（長さ・質感）
  | 'production'        // 製造・熟成・蒸留（カスクストレングス・NAS 等）
  | 'region'            // 産地・蒸留所地域
  | 'general'           // 一般テイスティング用語

export interface GlossaryTerm {
  id: string            // URL-safe なスラッグ（例: "peaty", "cask-strength"）
  termJa: string        // 日本語名称（例: "ピーティ"）
  termEn: string        // 英語名称（例: "Peaty"）
  category: GlossaryCategory
  definitionJa: string  // 日本語定義（1〜3文）
  definitionEn: string  // 英語定義（1〜3文）
  examplesJa?: string[] // 日本語使用例（蒸留所名・銘柄など）
  examplesEn?: string[] // 英語使用例
}

export interface GlossaryData {
  version: 1
  terms: GlossaryTerm[]
}
```

### バリデーション規則
- `id`: kebab-case、英数字とハイフンのみ、一意
- `termJa` / `termEn`: 必須、空文字禁止
- `definitionJa` / `definitionEn`: 必須、500文字以内
- `examplesJa` / `examplesEn`: 任意、各要素100文字以内
- `category`: 上記7値のいずれか

### 初期収録用語一覧（60件）

| id | termJa | termEn | category |
|----|--------|--------|----------|
| `appearance` | 外観 | Appearance | tasting-process |
| `nose` | 香り（ノーズ） | Nose | tasting-process |
| `palate` | 味わい（パレート） | Palate | tasting-process |
| `finish` | 余韻（フィニッシュ） | Finish | tasting-process |
| `nosing` | ノージング | Nosing | tasting-process |
| `neat` | ニート（ストレート） | Neat | tasting-process |
| `water-drop` | 加水 | Adding Water | tasting-process |
| `legs` | レッグス | Legs | tasting-process |
| `pale-gold` | 淡い黄金色 | Pale Gold | tasting-process |
| `amber` | 琥珀色 | Amber | tasting-process |
| `copper` | 銅色 | Copper | tasting-process |
| `mahogany` | マホガニー | Mahogany | tasting-process |
| `peaty` | ピーティ | Peaty | flavour-wheel |
| `smoky` | スモーキー | Smoky | flavour-wheel |
| `phenolic` | フェノリック | Phenolic | flavour-wheel |
| `medicinal` | メディシナル | Medicinal | flavour-wheel |
| `iodine` | ヨード | Iodine | flavour-wheel |
| `fruity` | フルーティ | Fruity | flavour-wheel |
| `citrus` | シトラス | Citrus | flavour-wheel |
| `dried-fruit` | ドライフルーツ | Dried Fruit | flavour-wheel |
| `floral` | フローラル | Floral | flavour-wheel |
| `vanilla` | バニラ | Vanilla | flavour-wheel |
| `honey` | ハニー | Honey | flavour-wheel |
| `caramel` | キャラメル | Caramel | flavour-wheel |
| `toffee` | トフィー | Toffee | flavour-wheel |
| `chocolate` | チョコレート | Chocolate | flavour-wheel |
| `spicy` | スパイシー | Spicy | flavour-wheel |
| `pepper` | ペッパー | Pepper | flavour-wheel |
| `cereal` | シリアル | Cereal | flavour-wheel |
| `malty` | モルティ | Malty | flavour-wheel |
| `grassy` | グラッシー | Grassy | flavour-wheel |
| `nutty` | ナッティ | Nutty | flavour-wheel |
| `oaky` | オーキー | Oaky | flavour-wheel |
| `woody` | ウッディ | Woody | flavour-wheel |
| `sulphury` | サルファリー | Sulphury | flavour-wheel |
| `mouthfeel` | マウスフィール | Mouthfeel | mouthfeel |
| `oily` | オイリー | Oily | mouthfeel |
| `creamy` | クリーミー | Creamy | mouthfeel |
| `thin` | 軽い（シン） | Thin | mouthfeel |
| `full-bodied` | ふくよか（フルボディ） | Full-Bodied | mouthfeel |
| `attack` | アタック | Attack | mouthfeel |
| `short-finish` | ショートフィニッシュ | Short Finish | finish |
| `medium-finish` | ミディアムフィニッシュ | Medium Finish | finish |
| `long-finish` | ロングフィニッシュ | Long Finish | finish |
| `very-long-finish` | ベリーロングフィニッシュ | Very Long Finish | finish |
| `warming` | ウォーミング | Warming | finish |
| `drying` | ドライイング | Drying | finish |
| `single-malt` | シングルモルト | Single Malt | production |
| `blended-malt` | ブレンデッドモルト | Blended Malt | production |
| `blended-scotch` | ブレンデッドスコッチ | Blended Scotch | production |
| `cask-strength` | カスクストレングス | Cask Strength | production |
| `non-chill-filtered` | ノンチルフィルタード | Non-Chill Filtered | production |
| `age-statement` | エイジステートメント | Age Statement | production |
| `nas` | NAS（ノーエイジステートメント） | NAS | production |
| `ex-bourbon` | バーボン樽 | Ex-Bourbon Cask | production |
| `sherry-cask` | シェリー樽 | Sherry Cask | production |
| `double-matured` | ダブルマチュアード | Double Matured | production |
| `angels-share` | エンジェルズシェア | Angel's Share | production |
| `speyside` | スペイサイド | Speyside | region |
| `islay` | アイラ | Islay | region |
| `highlands` | ハイランド | Highlands | region |
| `lowlands` | ローランド | Lowlands | region |
| `campbeltown` | キャンベルタウン | Campbeltown | region |
| `dram` | ドラム（一杯） | Dram | general |
| `expression` | エクスプレッション | Expression | general |
| `distillery` | 蒸留所 | Distillery | general |

---

## 2. BeforeInstallPromptEvent（メモリ内状態）

### TypeScript 型拡張

```ts
// src/composables/useInstallPrompt.ts 内で定義
interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[]
  readonly userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
  prompt(): Promise<void>
}
```

### 状態一覧

| 状態 | 型 | 説明 |
|------|----|------|
| `deferredPrompt` | `BeforeInstallPromptEvent \| null` | キャプチャしたインストールイベント |
| `canInstall` | `boolean`（computed） | `deferredPrompt !== null` |
| `isIos` | `boolean` | iOS Safari 判定（`/iphone\|ipad\|ipod/i` UA マッチ） |

---

## 3. SW更新状態（メモリ内状態）

`vite-plugin-pwa/client` の `useRegisterSW` が提供する ref をそのまま使用。独自定義不要。

```ts
const { needRefresh, updateServiceWorker } = useRegisterSW()
// needRefresh: Ref<boolean> — true のときトースト表示
// updateServiceWorker: () => Promise<void> — タップ時に呼び出し
```

---

## 4. 既存データとの関係

- GlossaryTerm は IndexedDB に保存しない（読み取り専用 JSON）
- TastingNote, BottleImage, AppSettings の既存スキーマは変更なし
