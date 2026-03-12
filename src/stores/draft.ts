import { defineStore } from 'pinia'
import { ref } from 'vue'
import { db } from '@/db'
import type { Draft, TastingNote } from '@/db/types'

export const useDraftStore = defineStore('draft', () => {
  const currentDraft = ref<Draft | undefined>(undefined)

  /** 下書きを DB から読み込む */
  async function loadDraft(): Promise<Draft | undefined> {
    const draft = await db.drafts.get('current')
    currentDraft.value = draft
    return draft
  }

  /** 下書きを保存（常に1件のみ・上書き） */
  async function saveDraft(
    data: Partial<Omit<TastingNote, 'id' | 'createdAt' | 'updatedAt'>>
  ): Promise<void> {
    const draft: Draft = {
      id: 'current',
      data,
      updatedAt: new Date(),
    }
    await db.drafts.put(draft)
    currentDraft.value = draft
  }

  /** 新規作成開始: 前の下書きを空で上書き */
  async function startNewDraft(): Promise<void> {
    await saveDraft({})
  }

  /** 下書きを削除（正式保存後に呼ぶ） */
  async function clearDraft(): Promise<void> {
    await db.drafts.delete('current')
    currentDraft.value = undefined
  }

  return { currentDraft, loadDraft, saveDraft, startNewDraft, clearDraft }
})
