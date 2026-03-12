import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useSearchSortStore } from '@/stores/searchSort'

describe('useSearchSortStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  describe('query', () => {
    it('初期値は空文字である', () => {
      const store = useSearchSortStore()
      expect(store.query).toBe('')
    })

    it('query を更新できる', () => {
      const store = useSearchSortStore()
      store.query = '山崎'
      expect(store.query).toBe('山崎')
    })

    it('query を空文字にリセットできる', () => {
      const store = useSearchSortStore()
      store.query = '山崎'
      store.query = ''
      expect(store.query).toBe('')
    })
  })

  describe('sortOption', () => {
    it('初期値は date-desc である', () => {
      const store = useSearchSortStore()
      expect(store.sortOption).toBe('date-desc')
    })

    it('sortOption を date-asc に更新できる', () => {
      const store = useSearchSortStore()
      store.sortOption = 'date-asc'
      expect(store.sortOption).toBe('date-asc')
    })

    it('sortOption を rating-desc に更新できる', () => {
      const store = useSearchSortStore()
      store.sortOption = 'rating-desc'
      expect(store.sortOption).toBe('rating-desc')
    })

    it('sortOption を name-asc に更新できる', () => {
      const store = useSearchSortStore()
      store.sortOption = 'name-asc'
      expect(store.sortOption).toBe('name-asc')
    })
  })
})
