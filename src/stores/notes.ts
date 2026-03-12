import { defineStore } from 'pinia'
import { ref } from 'vue'
import { db } from '@/db'
import type { TastingNote, BottleImage } from '@/db/types'

export const useNotesStore = defineStore('notes', () => {
  /** 一覧（createdAt 降順） */
  const notes = ref<TastingNote[]>([])

  /** 一覧を DB から読み込む（最新順） */
  async function loadNotes(): Promise<void> {
    notes.value = await db.tastingNotes.orderBy('createdAt').reverse().toArray()
  }

  /** ID でノートを取得 */
  async function getNoteById(id: string): Promise<TastingNote | undefined> {
    return db.tastingNotes.get(id)
  }

  /** ノートを新規作成。銘柄名が空の場合はエラーをスロー */
  async function createNote(
    data: Partial<Omit<TastingNote, 'id' | 'createdAt' | 'updatedAt'>>
  ): Promise<string> {
    const brandName = data.brandName?.trim()
    if (!brandName) throw new Error('銘柄名は必須です')

    const now = new Date()
    const note: TastingNote = {
      id: crypto.randomUUID(),
      brandName,
      distillery: data.distillery,
      vintage: data.vintage,
      appearance: data.appearance,
      nose: data.nose,
      palate: data.palate,
      finish: data.finish,
      rating: data.rating,
      notes: data.notes,
      imageId: data.imageId,
      createdAt: now,
      updatedAt: now,
    }
    await db.tastingNotes.add(note)
    return note.id
  }

  /** ノートを更新 */
  async function updateNote(
    id: string,
    data: Partial<Omit<TastingNote, 'id' | 'createdAt'>>
  ): Promise<void> {
    await db.tastingNotes.update(id, { ...data, updatedAt: new Date() })
  }

  /** ノートを削除（BottleImage のカスケード削除を含む） */
  async function deleteNote(id: string): Promise<void> {
    await db.transaction('rw', [db.tastingNotes, db.bottleImages], async () => {
      await db.bottleImages.where('noteId').equals(id).delete()
      await db.tastingNotes.delete(id)
    })
    notes.value = notes.value.filter((n) => n.id !== id)
  }

  /** ボトル画像を保存してノートに紐付ける */
  async function saveImage(noteId: string, blob: File): Promise<string> {
    const note = await db.tastingNotes.get(noteId)
    if (!note) throw new Error('ノートが見つかりません')

    // 既存の画像があれば削除
    if (note.imageId) {
      await db.bottleImages.delete(note.imageId)
    }

    const imageId = crypto.randomUUID()
    const image: BottleImage = {
      id: imageId,
      noteId,
      blob,
      createdAt: new Date(),
    }
    await db.bottleImages.add(image)
    await db.tastingNotes.update(noteId, { imageId, updatedAt: new Date() })
    return imageId
  }

  /** ボトル画像を削除してノートから参照を外す */
  async function deleteImage(noteId: string): Promise<void> {
    const note = await db.tastingNotes.get(noteId)
    if (!note?.imageId) return

    await db.bottleImages.delete(note.imageId)
    await db.tastingNotes.update(noteId, { imageId: undefined, updatedAt: new Date() })
  }

  return { notes, loadNotes, getNoteById, createNote, updateNote, deleteNote, saveImage, deleteImage }
})
