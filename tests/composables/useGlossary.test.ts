import { describe, it, expect } from 'vitest'
import { useGlossary } from '@/composables/useGlossary'

describe('useGlossary', () => {
  it('全件返却: 検索なし・カテゴリ未選択で全用語を返す', () => {
    const { filteredTerms, searchQuery, selectedCategory } = useGlossary()
    searchQuery.value = ''
    selectedCategory.value = null
    expect(filteredTerms.value.length).toBeGreaterThan(0)
  })

  it('検索: "peaty" で絞り込まれる', () => {
    const { filteredTerms, searchQuery } = useGlossary()
    searchQuery.value = 'peaty'
    expect(filteredTerms.value.length).toBeGreaterThan(0)
    expect(filteredTerms.value.every(t =>
      t.termEn.toLowerCase().includes('peaty') ||
      t.termJa.includes('peaty') ||
      t.definitionJa.toLowerCase().includes('peaty') ||
      t.definitionEn.toLowerCase().includes('peaty')
    )).toBe(true)
  })

  it('カテゴリフィルタ: flavour-wheel カテゴリで絞り込まれる', () => {
    const { filteredTerms, selectedCategory } = useGlossary()
    selectedCategory.value = 'flavour-wheel'
    expect(filteredTerms.value.length).toBeGreaterThan(0)
    expect(filteredTerms.value.every(t => t.category === 'flavour-wheel')).toBe(true)
  })

  it('複合フィルタ: カテゴリ + 検索の組み合わせ', () => {
    const { filteredTerms, searchQuery, selectedCategory } = useGlossary()
    selectedCategory.value = 'production'
    searchQuery.value = 'cask'
    expect(filteredTerms.value.every(t => t.category === 'production')).toBe(true)
  })

  it('大文字小文字を区別しない検索', () => {
    const { filteredTerms, searchQuery } = useGlossary()
    searchQuery.value = 'PEATY'
    const upper = filteredTerms.value.length
    searchQuery.value = 'peaty'
    const lower = filteredTerms.value.length
    expect(upper).toBe(lower)
  })

  it('存在しない検索ワードで空配列を返す', () => {
    const { filteredTerms, searchQuery } = useGlossary()
    searchQuery.value = 'xyzzy_nonexistent_term_12345'
    expect(filteredTerms.value.length).toBe(0)
  })
})
