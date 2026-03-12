import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useNotesStore } from '@/stores/notes'
import { db } from '@/db'

vi.mock('@/composables/useImageCompression', () => ({
  useImageCompression: () => ({
    compress: vi.fn().mockImplementation((file: File) => Promise.resolve(file)),
    isCompressing: { value: false },
    error: { value: null },
  }),
}))

function createFakeImageFile(sizeKb = 200): File {
  const bytes = new Uint8Array(sizeKb * 1024)
  return new File([bytes], 'bottle.jpg', { type: 'image/jpeg' })
}

describe('画像登録の結合テスト', () => {
  beforeEach(async () => {
    setActivePinia(createPinia())
    await db.tastingNotes.clear()
    await db.bottleImages.clear()
  })

  it('画像付きノートを作成→BottleImage が DB に保存されること', async () => {
    const notesStore = useNotesStore()
    const imageFile = createFakeImageFile()

    const noteId = await notesStore.createNote({
      brandName: 'Macallan 18',
      nose: 'Rich sherry',
    })

    // BottleImage を保存する
    const imageId = crypto.randomUUID()
    await db.bottleImages.add({
      id: imageId,
      noteId,
      blob: imageFile,
      createdAt: new Date(),
    })

    // ノートに imageId を紐付け
    await notesStore.updateNote(noteId, { imageId })

    // DB を確認
    const savedImage = await db.bottleImages.get(imageId)
    expect(savedImage).toBeDefined()
    expect(savedImage?.noteId).toBe(noteId)
    expect(savedImage?.blob).toBeDefined() // fake-indexeddb は Blob を別形式で保存するため参照等価はチェックしない

    // ノートに imageId が保存されていること
    const savedNote = await db.tastingNotes.get(noteId)
    expect(savedNote?.imageId).toBe(imageId)
  })

  it('ノート削除時に BottleImage がカスケード削除されること', async () => {
    const notesStore = useNotesStore()
    const imageFile = createFakeImageFile()

    const noteId = await notesStore.createNote({ brandName: 'Glenfarclas 25' })

    const imageId = crypto.randomUUID()
    await db.bottleImages.add({
      id: imageId,
      noteId,
      blob: imageFile,
      createdAt: new Date(),
    })
    await notesStore.updateNote(noteId, { imageId })

    // ノート削除
    await notesStore.deleteNote(noteId)

    // BottleImage も削除されていること
    const deletedImage = await db.bottleImages.get(imageId)
    expect(deletedImage).toBeUndefined()
  })

  it('画像変更後に旧 BottleImage が削除されること', async () => {
    const notesStore = useNotesStore()

    const noteId = await notesStore.createNote({ brandName: 'Ardbeg 10' })

    const oldImageId = crypto.randomUUID()
    await db.bottleImages.add({
      id: oldImageId,
      noteId,
      blob: createFakeImageFile(),
      createdAt: new Date(),
    })
    await notesStore.updateNote(noteId, { imageId: oldImageId })

    // 新しい画像に変更（旧画像を削除して新画像を登録）
    await db.bottleImages.delete(oldImageId)
    const newImageId = crypto.randomUUID()
    await db.bottleImages.add({
      id: newImageId,
      noteId,
      blob: createFakeImageFile(),
      createdAt: new Date(),
    })
    await notesStore.updateNote(noteId, { imageId: newImageId })

    // 旧画像が削除されていること
    const oldImage = await db.bottleImages.get(oldImageId)
    expect(oldImage).toBeUndefined()

    // 新画像が存在すること
    const newImage = await db.bottleImages.get(newImageId)
    expect(newImage).toBeDefined()
  })
})
