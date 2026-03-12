# Research: 記録アプリ UX 拡充

**Date**: 2026-03-12
**Branch**: `003-record-ux-polish`

## 調査項目と決定事項

### 1. ImagePicker の既存画像表示パターン

**Decision**: `existingImageUrl` prop を追加し、`previewUrl`（新規選択）または `existingImageUrl`（既存）のいずれかを表示する

**Rationale**: Vue のリアクティブシステムでは props と local state を分離するのがベストプラクティス。既存画像は IndexedDB から取得した ObjectURL として親（NoteEditView）が管理し、新規選択は ImagePicker 内の local state が管理する。これにより ImagePicker が IndexedDB に直接依存することを避けられる。

**Alternatives considered**:
- ImagePicker 内で imageId を受け取り、DB から直接フェッチ → コンポーネントが DB に依存し単体テストが困難になるため却下
- NoteForm が imageId から URL を解決して渡す → NoteForm も DB 依存になるため却下

---

### 2. 破棄確認の実装パターン

**Decision**: Vue Router の `onBeforeRouteLeave` ガードと標準の `window.confirm` を使用する

**Rationale**: PWA はネイティブの confirm ダイアログを使用でき、カスタムモーダルより実装コストが低い。既存の `DeleteConfirmDialog` コンポーネントはカスタムモーダルだが、ルートリーブガード内では同期的な確認が必要なため `window.confirm` が適切。

**Alternatives considered**:
- カスタムダイアログをルートガード内で使用 → `onBeforeRouteLeave` は同期/Promise return が必要で、カスタムモーダルとの連携が複雑になるため却下
- ブラウザの `beforeunload` イベント → PWA 内のルート遷移には発火しないため却下

---

### 3. 縦長画像表示のアスペクト比

**Decision**: Tailwind の `aspect-[2/3]` クラスを使用（既に 002 で導入済み）

**Rationale**: NoteCard.vue（一覧）と統一した 2:3 比率（幅:高さ）を使用。詳細画面では `max-w-[240px] mx-auto` で画面幅の大半を占めないよう制限し、残りの情報も視認しやすくする。

**Alternatives considered**:
- 固定 px 高さ → 機種間のアスペクト比が崩れるため却下
- 1:1（正方形）→ ボトルの縦長形状に不適合なため却下

---

### 4. ライセンス情報の管理方法

**Decision**: `src/views/LicenseView.vue` 内のインライン定数として管理する

**Rationale**: ライセンス情報は UI のコード変更（依存関係の追加・削除）と同期して手動更新する。自動生成ツール（license-checker 等）の導入はビルド依存を増やすため YAGNI 原則により却下。

**Alternatives considered**:
- license-checker 等で自動生成 → ビルドスクリプト複雑化のため却下
- JSON ファイルとして分離 → 1画面のみで使用するため YAGNI で却下

---

### 5. AppHeader の未保存変更ガードの設計

**Decision**: `onBack`/`onHome` の callback props でガード処理を各 View に委譲する

**Rationale**: AppHeader は「どの変更が未保存か」を知らないため、ガードロジックは各 View が保持すべき。AppHeader はボタン押下を emit/callback で通知するだけに留める（YAGNI）。

**Alternatives considered**:
- AppHeader が `isDirty` prop を受け取り自律的に confirm を表示 → AppHeader が UI 以外の責務を持ちすぎるため却下
- Vuex/Pinia の global dirty state → 現状で必要な複雑さを超えるため却下
