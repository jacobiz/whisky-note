import Dexie, { type Table } from 'dexie'
import type { TastingNote, BottleImage, Draft, AppSettings } from './types'

/** WhiskyNote IndexedDB データベース */
class WhiskyNoteDB extends Dexie {
  tastingNotes!: Table<TastingNote, string>
  bottleImages!: Table<BottleImage, string>
  drafts!: Table<Draft, string>
  settings!: Table<AppSettings, string>

  constructor() {
    super('WhiskyNoteDB')
    this.version(1).stores({
      // createdAt インデックス: 一覧の降順ソートに使用
      tastingNotes: 'id, createdAt',
      // noteId インデックス: ノート削除時のカスケード削除に使用
      bottleImages: 'id, noteId',
      drafts: 'id',
      settings: 'id',
    })
  }
}

/** シングルトン DB インスタンス */
export const db = new WhiskyNoteDB()
