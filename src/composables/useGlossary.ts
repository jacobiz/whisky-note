import { ref, computed } from 'vue'
import glossaryData from '@/data/glossary.json'
import type { GlossaryTerm, GlossaryCategory } from '@/data/glossary'

// terms はモジュールスコープのシングルトン（静的JSONのため全インスタンスで共有して問題なし）
const terms: GlossaryTerm[] = (glossaryData as { version: number; terms: GlossaryTerm[] }).terms

export function useGlossary() {
  // searchQuery / selectedCategory は呼び出しごとに独立したインスタンスを返す
  // （GlossaryView と GlossaryModal が別々の検索状態を持てるようにするため）
  const searchQuery = ref('')
  const selectedCategory = ref<GlossaryCategory | null>(null)

  const filteredTerms = computed(() => {
    let result = terms

    if (selectedCategory.value) {
      result = result.filter(t => t.category === selectedCategory.value)
    }

    const q = searchQuery.value.trim().toLowerCase()
    if (q) {
      result = result.filter(t =>
        t.termJa.toLowerCase().includes(q) ||
        t.termEn.toLowerCase().includes(q) ||
        t.definitionJa.toLowerCase().includes(q) ||
        t.definitionEn.toLowerCase().includes(q)
      )
    }

    return result
  })

  return { terms: computed(() => terms), filteredTerms, searchQuery, selectedCategory }
}
