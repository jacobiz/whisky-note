# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**whisky-note** は、ウィスキーテイスティングノートを記録・管理するためのオフラインファーストPWAです。現在は実装前の仕様・設計フェーズにあります（ソースコードはまだ存在しません）。

## Development Commands

package.json にスクリプトが追加され次第、以下のコマンドが利用可能になる予定です:

```bash
npm run dev          # 開発サーバー起動（ポート5173）
npm run build        # プロダクションビルド
npm test             # テスト実行（Vitest）
npm run test:ui      # Vitest UI モード
npm run lint         # ESLint
npm run format       # Prettier
```

## Architecture

- **Platform**: Progressive Web App（PWA）— Service Worker + Web App Manifest 必須
- **Framework**: Vue 3（Composition API）+ Vite 6 + TypeScript（strict モード）
- **State**: Pinia 2（グローバル状態管理）
- **Data**: IndexedDB（Dexie.js 4）のみ。外部API・クラウド同期は禁止
- **i18n**: vue-i18n v9+（日本語/英語、`src/i18n/locales/ja.json` / `en.json`）
- **Styling**: Tailwind CSS 3（ダークテーマ + 金色アクセント、`class` 戦略）
- **Image**: browser-image-compression 2（500KB上限、Web Worker 使用）
- **PWA**: vite-plugin-pwa + Workbox
- **Test**: Vitest + @testing-library/vue
- **Package Manager**: npm

## Project Constitution (Non-Negotiable Principles)

プロジェクト憲法（`.specify/memory/constitution.md`）が全ての意思決定の基準です。主要原則：

1. **ローカルファースト**: データはデバイス上のみ（IndexedDB / localStorage）
2. **テストファースト**: 実装前にテストを書く（TDD: Red → Green → Refactor）
3. **シンプル設計**: YAGNI原則。Repository パターン・DIコンテナ・Factoryパターンは禁止（正当化が必要）
4. **モバイル最適化**: 375px基準、タッチファースト。LCP <2.5s / FID <100ms / CLS <0.1 / Lighthouse PWA ≥90
5. **日本語コミュニケーション**: ドキュメント・コードコメント・コミットメッセージはすべて日本語

## Development Workflow (Speckit)

このプロジェクトはSpec-Kitを使った仕様駆動開発を採用しています。機能追加の流れ：

1. `/speckit.specify` — 機能説明からspec.mdを生成
2. `/speckit.clarify` — 曖昧点を解消してspecを補強
3. `/speckit.plan` — plan.mdを生成（アーキテクチャ・データモデル・実装フェーズ）
4. `/speckit.tasks` — tasks.mdを生成（粒度の細かいタスクリスト）
5. `/speckit.analyze` — 成果物間の整合性を検証
6. `/speckit.implement` — TDDサイクルでタスクを実装

各機能の仕様・計画・タスクは `specs/` 配下に格納されます。

## Branch Strategy

- `main`: プロダクション
- `feature/###-name`: 機能追加
- `fix/###-name`: バグ修正
- 1タスク ≈ 1コミット。全テストがパスしてからマージ

## Key Reference Files

- **プロジェクト憲法**: `.specify/memory/constitution.md`
- **機能仕様（001）**: `specs/001-tasting-note-record/` — spec.md / plan.md / data-model.md / research.md
- **ウィスキーテイスティング知識ベース**: `docs/whisky-tasting.md` / `docs/whisky-tasting-en.md`
- **Speckit コマンド定義**: `.claude/commands/`

## Active Technologies
- TypeScript 5.x / Vue 3 (Composition API) + Vue 3, Tailwind CSS 3.4（`aspect-[2/3]`, `line-clamp-2` 組み込み済み）, Dexie.js 4（IndexedDB） (002-note-list-portrait-layout)
- IndexedDB（既存 - BottleImage の読み込みのみ） (002-note-list-portrait-layout)

## Recent Changes
- 002-note-list-portrait-layout: Added TypeScript 5.x / Vue 3 (Composition API) + Vue 3, Tailwind CSS 3.4（`aspect-[2/3]`, `line-clamp-2` 組み込み済み）, Dexie.js 4（IndexedDB）
