import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useDraftStore } from '@/stores/draft'

describe('useDraftStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('下書きを保存できる', async () => {
    const store = useDraftStore()
    await store.saveDraft({ brandName: '下書き中' })
    const draft = await store.loadDraft()
    expect(draft?.data.brandName).toBe('下書き中')
  })

  it('新規作成開始時に前の下書きを上書きする', async () => {
    const store = useDraftStore()
    await store.saveDraft({ brandName: '古い下書き' })
    await store.startNewDraft()
    const draft = await store.loadDraft()
    expect(draft?.data.brandName).toBeUndefined()
  })

  it('正式保存後に下書きを削除できる', async () => {
    const store = useDraftStore()
    await store.saveDraft({ brandName: '保存前' })
    await store.clearDraft()
    const draft = await store.loadDraft()
    expect(draft).toBeUndefined()
  })
})
