import { defineStore } from 'pinia'
import { ref } from 'vue'

/** ソートオプション */
export type SortOption = 'date-desc' | 'date-asc' | 'rating-desc' | 'name-asc'

export const useSearchSortStore = defineStore('searchSort', () => {
  /** 検索キーワード（空文字 = フィルタなし） */
  const query = ref<string>('')

  /** ソートオプション（デフォルト: 新しい順） */
  const sortOption = ref<SortOption>('date-desc')

  return { query, sortOption }
})
