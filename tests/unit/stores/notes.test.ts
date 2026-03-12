import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useNotesStore } from '@/stores/notes'

describe('useNotesStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  describe('ノート作成', () => {
    it('有効なデータでノートを作成できる', async () => {
      const store = useNotesStore()
      const id = await store.createNote({ brandName: '山崎12年' })
      expect(id).toBeTruthy()
      const note = await store.getNoteById(id)
      expect(note?.brandName).toBe('山崎12年')
    })

    it('銘柄名が空の場合はエラーをスローする', async () => {
      const store = useNotesStore()
      await expect(store.createNote({ brandName: '' })).rejects.toThrow()
    })

    it('銘柄名が空白のみの場合はエラーをスローする', async () => {
      const store = useNotesStore()
      await expect(store.createNote({ brandName: '   ' })).rejects.toThrow()
    })

    it('同じ銘柄名で複数のノートを作成できる（一意性制約なし）', async () => {
      const store = useNotesStore()
      const id1 = await store.createNote({ brandName: '山崎12年' })
      const id2 = await store.createNote({ brandName: '山崎12年' })
      expect(id1).not.toBe(id2)
    })
  })

  describe('ノート一覧（降順ソート）', () => {
    it('ノートが記録日時の降順で返される', async () => {
      const store = useNotesStore()
      await store.createNote({ brandName: '古いノート' })
      await new Promise((r) => setTimeout(r, 10))
      await store.createNote({ brandName: '新しいノート' })
      await store.loadNotes()
      expect(store.notes[0].brandName).toBe('新しいノート')
      expect(store.notes[1].brandName).toBe('古いノート')
    })
  })

  describe('ノート更新', () => {
    it('ノートの内容を更新できる', async () => {
      const store = useNotesStore()
      const id = await store.createNote({ brandName: '元の銘柄' })
      await store.updateNote(id, { brandName: '更新後の銘柄' })
      const note = await store.getNoteById(id)
      expect(note?.brandName).toBe('更新後の銘柄')
    })
  })

  describe('ノート削除', () => {
    it('ノートを削除できる', async () => {
      const store = useNotesStore()
      const id = await store.createNote({ brandName: '削除対象' })
      await store.deleteNote(id)
      const note = await store.getNoteById(id)
      expect(note).toBeUndefined()
    })
  })
})
