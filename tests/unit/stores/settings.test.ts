import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useSettingsStore } from '@/stores/settings'
import { db } from '@/db'

describe('settings ストア', () => {
  beforeEach(async () => {
    setActivePinia(createPinia())
    await db.settings.clear()
  })

  it('initialize: DB に設定がない場合は端末ロケールを使用すること', async () => {
    const store = useSettingsStore()
    await store.initialize()
    expect(['ja', 'en']).toContain(store.language)
  })

  it('initialize: DB に保存済みの言語設定を復元すること', async () => {
    await db.settings.put({ id: 'settings', language: 'en' })

    const store = useSettingsStore()
    await store.initialize()
    expect(store.language).toBe('en')
  })

  it('setLanguage: 言語を変更して DB に永続化すること', async () => {
    const store = useSettingsStore()
    await store.initialize()

    await store.setLanguage('en')
    expect(store.language).toBe('en')

    const saved = await db.settings.get('settings')
    expect(saved?.language).toBe('en')
  })

  it('setLanguage: ja に変更できること', async () => {
    const store = useSettingsStore()
    await store.initialize()

    await store.setLanguage('ja')
    expect(store.language).toBe('ja')

    const saved = await db.settings.get('settings')
    expect(saved?.language).toBe('ja')
  })

  it('再起動後（新しいストアインスタンス）でも設定が復元されること', async () => {
    const store1 = useSettingsStore()
    await store1.setLanguage('en')

    // 新しい Pinia インスタンスでリセット
    setActivePinia(createPinia())
    const store2 = useSettingsStore()
    await store2.initialize()

    expect(store2.language).toBe('en')
  })
})
