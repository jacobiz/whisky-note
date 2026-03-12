import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useNotesStore } from '@/stores/notes'
import { useDraftStore } from '@/stores/draft'

describe('ノートライフサイクル（結合テスト）', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('新規作成 → 一覧確認 → 編集 → 削除 の一連フローが動作する', async () => {
    const notesStore = useNotesStore()

    // 1. 新規作成
    const id = await notesStore.createNote({
      brandName: '山崎12年',
      nose: 'バニラ、蜂蜜',
      rating: 92,
    })
    expect(id).toBeTruthy()

    // 2. 一覧確認（最新順）
    await notesStore.loadNotes()
    expect(notesStore.notes).toHaveLength(1)
    expect(notesStore.notes[0].brandName).toBe('山崎12年')

    // 3. 編集
    await notesStore.updateNote(id, { nose: '更新後: バニラ、オレンジ' })
    const updated = await notesStore.getNoteById(id)
    expect(updated?.nose).toBe('更新後: バニラ、オレンジ')

    // 4. 削除
    await notesStore.deleteNote(id)
    await notesStore.loadNotes()
    expect(notesStore.notes).toHaveLength(0)
  })

  it('下書きが復元される', async () => {
    const draftStore = useDraftStore()

    await draftStore.saveDraft({ brandName: '途中保存', nose: '途中の香り' })
    const draft = await draftStore.loadDraft()
    expect(draft?.data.brandName).toBe('途中保存')
    expect(draft?.data.nose).toBe('途中の香り')
  })

  it('同じ銘柄名で2件作成すると両方一覧に表示される', async () => {
    const store = useNotesStore()
    await store.createNote({ brandName: '山崎12年' })
    await store.createNote({ brandName: '山崎12年' })
    await store.loadNotes()
    expect(store.notes).toHaveLength(2)
  })
})
