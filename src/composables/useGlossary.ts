import { ref, computed } from 'vue'
import glossaryData from '@/data/glossary.json'
import type { GlossaryTerm, GlossaryCategory } from '@/data/glossary'

const terms: GlossaryTerm[] = (glossaryData as { version: number; terms: GlossaryTerm[] }).terms

export function useGlossary() {
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
