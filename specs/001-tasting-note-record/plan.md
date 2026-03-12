# Implementation Plan: ウィスキーテイスティングノート記録

**Branch**: `001-tasting-note-record` | **Date**: 2026-03-11 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-tasting-note-record/spec.md`

## Summary

ウィスキーテイスティングノートの記録・閲覧・編集・削除機能を実装する。Vue 3 + Vite + TypeScript をベースとし、IndexedDB（Dexie.js）によるオフラインファーストのデータ永続化、スマートフォンカメラからのボトル画像登録（500KB 圧縮）、日本語/英語の多言語対応、ダークテーマ（黒/ネイビー + 金色アクセント）の高級感あるデザインを実現する。

## Technical Context

**Language/Version**: TypeScript 5.x / Node.js 22 LTS
**Primary Dependencies**: Vue 3, Vite 6, Pinia 2, vue-i18n 9, Dexie.js 4, Tailwind CSS 3, browser-image-compression 2, vite-plugin-pwa
**Storage**: IndexedDB（Dexie.js 経由）— クラウド・外部 DB 禁止
**Testing**: Vitest + @testing-library/vue + @vitest/coverage-v8
**Target Platform**: PWA（モバイルブラウザ優先 / Chrome・Safari・Firefox 最新2バージョン）
**Project Type**: モバイルファースト PWA（Single Page Application）
**Performance Goals**: LCP < 2.5s、FID < 100ms、CLS < 0.1、Lighthouse PWA スコア ≥ 90
**Constraints**: 全機能オフライン動作必須、IndexedDB のみ、最小サポート幅 375px
**Scale/Scope**: シングルユーザー、目標 500+ ノート対応、5 画面相当

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| 原則 | ゲート | 状態 | 備考 |
|------|--------|------|------|
| I. ローカルファースト | IndexedDB のみ使用、外部 API・クラウド通信なし | ✅ PASS | Dexie.js + BottleImage の Blob 保存で完結 |
| II. テストファースト | Vitest + @testing-library/vue で TDD サイクルを実施 | ✅ PASS | tasks.md で各タスクにテスト先行を明記する |
| III. シンプル設計 | Repository パターン・DI コンテナなし、Pinia のみ | ✅ PASS | Pinia は YAGNI の範囲内（グローバル状態が必要） |
| IV. モバイル最適化 | vite-plugin-pwa + Workbox、375px 対応 | ✅ PASS | マニフェスト・Service Worker 必須 |
| V. 日本語コミュニケーション | コメント・ドキュメント・コミットは日本語 | ✅ PASS | 本 plan.md を含む全成果物が日本語 |

## Project Structure

### Documentation (this feature)

```text
specs/001-tasting-note-record/
├── plan.md          # このファイル（/speckit.plan コマンド出力）
├── research.md      # Phase 0 出力（技術選定根拠）
├── data-model.md    # Phase 1 出力（エンティティ・スキーマ定義）
├── checklists/
│   └── requirements.md
└── tasks.md         # Phase 2 出力（/speckit.tasks コマンドで生成）
```

### Source Code (repository root)

```text
src/
├── main.ts                  # アプリエントリーポイント
├── App.vue                  # ルートコンポーネント
├── db/
│   ├── index.ts             # Dexie.js DB インスタンス・スキーマ定義
│   └── types.ts             # DB エンティティの TypeScript 型
├── stores/
│   ├── notes.ts             # Pinia: TastingNote CRUD + 一覧状態
│   ├── draft.ts             # Pinia: 下書き自動保存
│   └── settings.ts          # Pinia: 言語設定
├── composables/
│   ├── useImageCompression.ts  # browser-image-compression ラッパー
│   └── useCamera.ts            # カメラ/フォトライブラリ選択
├── i18n/
│   ├── index.ts             # vue-i18n インスタンス設定
│   └── locales/
│       ├── ja.json          # 日本語翻訳
│       └── en.json          # 英語翻訳
├── components/
│   ├── NoteList.vue         # ノート一覧（サムネイル・銘柄名・評価・日付）
│   ├── NoteCard.vue         # 一覧の各ノートカード
│   ├── NoteForm.vue         # 新規作成・編集フォーム
│   ├── ImagePicker.vue      # カメラ/ライブラリ選択 UI
│   ├── DeleteConfirmDialog.vue  # 削除確認ダイアログ
│   └── LanguageToggle.vue   # 言語切り替え UI
├── views/
│   ├── HomeView.vue         # ノート一覧画面
│   ├── NoteCreateView.vue   # 新規作成画面
│   ├── NoteEditView.vue     # 編集画面
│   ├── NoteDetailView.vue   # 詳細画面
│   └── SettingsView.vue     # 設定画面（言語切り替え）
└── assets/
    └── styles/
        └── main.css         # Tailwind CSS エントリーポイント

public/
├── manifest.json            # PWA マニフェスト
└── icons/                   # PWA アイコン各サイズ

tests/
├── unit/
│   ├── stores/              # Pinia ストアの単体テスト
│   ├── composables/         # Composition 関数の単体テスト
│   └── db/                  # DB 操作ロジックのテスト
├── components/
│   ├── NoteList.test.ts
│   ├── NoteForm.test.ts
│   └── ...
└── integration/
    └── note-lifecycle.test.ts  # ノートの作成〜削除の結合テスト
```

**Structure Decision**: PWA 単一プロジェクト構成（フロントエンドのみ）。バックエンドなし。

## Complexity Tracking

> 憲法違反なし。Complexity Tracking の記録事項はありません。
