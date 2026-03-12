import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useSettingsStore } from '@/stores/settings'
import { i18n } from '@/i18n'
import { db } from '@/db'

describe('言語切り替えの結合テスト', () => {
  beforeEach(async () => {
    setActivePinia(createPinia())
    await db.settings.clear()
  })

  it('設定変更後に i18n のロケールが即座に切り替わること（1秒以内）', async () => {
    const store = useSettingsStore()
    await store.initialize()

    const start = Date.now()
    await store.setLanguage('en')
    const elapsed = Date.now() - start

    expect(i18n.global.locale.value).toBe('en')
    expect(elapsed).toBeLessThan(1000)
  })

  it('ja に切り替えると i18n ロケールが ja になること', async () => {
    const store = useSettingsStore()
    await store.initialize()
    await store.setLanguage('en')

    await store.setLanguage('ja')
    expect(i18n.global.locale.value).toBe('ja')
  })

  it('設定が次回起動後も保持されること', async () => {
    const store1 = useSettingsStore()
    await store1.setLanguage('en')

    // 新インスタンスで復元をシミュレート
    setActivePinia(createPinia())
    const store2 = useSettingsStore()
    await store2.initialize()

    expect(store2.language).toBe('en')
    expect(i18n.global.locale.value).toBe('en')
  })

  it('言語切り替え後もテイスティングコメントデータは変更されないこと（FR-009）', async () => {
    // テイスティングコメントは翻訳対象外（ユーザー入力データ）
    const tastingComment = 'リッチでスモーキーな香り。バニラとキャラメルのニュアンス。'

    // DB に保存（言語切り替えに関係なく同一データを保持）
    const noteId = crypto.randomUUID()
    await db.tastingNotes.add({
      id: noteId,
      brandName: 'Laphroaig 10',
      nose: tastingComment,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    const store = useSettingsStore()
    await store.setLanguage('en')

    // 言語切り替え後もノートデータは変更されていない
    const note = await db.tastingNotes.get(noteId)
    expect(note?.nose).toBe(tastingComment)
  })
})
