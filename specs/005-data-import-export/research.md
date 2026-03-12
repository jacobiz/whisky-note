# Research: データ インポート・エクスポート機能

**Branch**: `005-data-import-export` | **Date**: 2026-03-12

---

## Decision 1: エクスポートファイル形式

**Decision**: JSONファイル（Base64エンコードで写真を埋め込み）
**Rationale**: ZIP形式はJSZip等の外部ライブラリが必要（現在未導入）。プロジェクト憲法のシンプル設計原則（YAGNI）に従い、追加依存なしで実現できるBase64埋め込みJSONを採用。ブラウザネイティブの`FileReader.readAsDataURL()`と`fetch(dataUrl).then(r => r.blob())`で可逆変換できる。
**Alternatives considered**:
- ZIP（JSON + 画像ファイル）: ユーザーが展開操作を要するか、JSZipライブラリ追加が必要。シンプル設計原則に反する
- テキストのみJSON: 写真を復元できないため、完全バックアップの要件を満たさない

---

## Decision 2: ブラウザダウンロード機構

**Decision**: `URL.createObjectURL(blob)` + 一時`<a download>`要素クリック
**Rationale**: File System Access API（`showSaveFilePicker()`）はSafari（iOS）でサポートが不安定。PWAの主要ターゲットであるiOSを確実にサポートするため、`<a download>`方式を採用。既存の`useBottleImage.ts`でも`URL.createObjectURL`が使われており、パターンが統一される。
**Alternatives considered**:
- `showSaveFilePicker()`: iOS Safari未対応のため却下

---

## Decision 3: インポート入力機構

**Decision**: `<input type="file" accept=".json">` 要素
**Rationale**: すべてのモバイルブラウザで動作する標準HTML要素。iOS Safariでもファイルアプリ・写真ライブラリへのアクセスが可能。
**Alternatives considered**:
- ドラッグ&ドロップ: デスクトップ前提で、モバイルファーストの原則に合わない

---

## Decision 4: ロジックの配置場所

**Decision**: `src/composables/useImportExport.ts` コンポーザブル
**Rationale**: 既存の`useImageCompression.ts`・`useCamera.ts`等と同じパターン。状態を持たない純粋なビジネスロジックであり、Pinia storeに入れるよりコンポーザブルが適切。Repositoryパターン・Serviceクラスは憲法により禁止（明確な必要性がない限り）。
**Alternatives considered**:
- Pinia storeアクション: エクスポート/インポートはセッション状態を持たないため不適切
- サービスクラス（`importExportService.ts`）: 憲法III（シンプル設計）に反する。1箇所でしか使わない

---

## Decision 5: 写真データ変換

**Decision**: `Blob` → Base64 data URL（`FileReader.readAsDataURL()`）→ JSON保存
復元時: Base64 data URL → `fetch(url).then(r => r.blob())` → `Blob`
**Rationale**: ブラウザ標準APIのみで実現可能。`Blob`オブジェクトはJSONシリアライズ不可のため変換が必要。`FileReader`は非同期APIで、全ノードの写真変換は`Promise.all()`で並列処理する。
**Note**: Base64変換でファイルサイズが約33%増加する（500KB写真→約667KB）。100枚で最大~67MB。

---

## Decision 6: インポートの重複判定

**Decision**: ノードIDベースの重複判定（`TastingNote.id`でIndexedDB存在確認）
**Rationale**: IDはUUID v4で生成されており、同一アプリから出力されたデータの重複判定に適切。インポート前にすべてのIDを一括チェックし、重複分はスキップしてカウントする。

---

## Decision 7: エクスポートJSON構造

```json
{
  "version": 1,
  "exportedAt": "2026-03-12T00:00:00.000Z",
  "notes": [
    {
      "id": "uuid-v4",
      "brandName": "山崎12年",
      "distillery": "サントリー山崎蒸溜所",
      "vintage": "NAS",
      "appearance": "...",
      "nose": "...",
      "palate": "...",
      "finish": "...",
      "rating": 90,
      "notes": "...",
      "createdAt": "2026-01-01T00:00:00.000Z",
      "updatedAt": "2026-01-01T00:00:00.000Z",
      "image": {
        "mimeType": "image/jpeg",
        "data": "data:image/jpeg;base64,..."
      }
    }
  ]
}
```

`image`フィールドは写真なしの場合は`null`または省略。

---

## Decision 8: UIのエントリーポイント

**Decision**: SettingsView.vue に新しい「データ管理」セクションを追加
**Rationale**: エクスポート・インポートはデータ管理操作であり、既存の「言語設定」「情報」とは性格が異なる独立したセクションが適切。既存のレイアウトパターン（`bg-surface-elevated border border-gold-muted rounded-xl`）を踏襲する。

---

## Decision 9: インポート確認ダイアログの実装

**Decision**: `ImportConfirmDialog.vue` を新規作成（`DeleteConfirmDialog.vue` を参考）
**Rationale**: 既存の`DeleteConfirmDialog.vue`のパターンを踏襲。件数表示のために専用コンポーネントが必要（汎用化より明確性を優先）。
**Content**: 「〇件のノートを追加します（〇件は既に存在するためスキップ）。続行しますか？」

---

## Decision 10: インポート結果通知

**Decision**: インポート完了後にアラートダイアログ（`window.alert`相当の結果表示）またはインライン成功メッセージ
**Rationale**: 既存の成功通知パターンがないため、シンプルにインポート完了後に「〇件のノートを追加しました」という結果をダイアログ表示する。Toastシステムは未導入であり、追加しない（YAGNI）。
**Alternatives considered**:
- Toast通知: Toast UIシステムが未導入のため却下
