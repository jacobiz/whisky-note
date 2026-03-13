<template>
  <teleport to="body">
    <div v-if="visible" class="fixed inset-0 z-50 flex flex-col justify-end">
      <!-- オーバーレイ -->
      <div class="absolute inset-0 bg-black/60" @click="emit('close')" />

      <!-- モーダルシート -->
      <div class="relative bg-surface rounded-t-2xl max-h-[85vh] flex flex-col">
        <!-- ヘッダー -->
        <div class="flex items-center justify-between px-4 py-3 border-b border-gold-muted shrink-0">
          <h2 class="text-lg font-bold text-gold">{{ t('glossary.title') }}</h2>
          <button
            type="button"
            aria-label="閉じる"
            class="p-2 text-ink-muted hover:text-ink-secondary transition-colors"
            @click="emit('close')"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- コンテンツ（スクロール可能） -->
        <div class="overflow-y-auto flex-1 p-4 space-y-3">
          <!-- 検索ボックス -->
          <input
            v-model="searchQuery"
            type="search"
            :placeholder="t('glossary.searchPlaceholder')"
            class="w-full bg-surface-elevated border border-gold-muted rounded-lg px-4 py-2.5
                   text-ink-primary placeholder-ink-muted focus:outline-none focus:border-gold
                   focus:ring-1 focus:ring-gold transition-colors text-sm"
          />

          <!-- カテゴリタブ -->
          <div class="flex gap-2 overflow-x-auto pb-1">
            <button
              type="button"
              :class="['shrink-0 px-3 py-1 rounded-full text-xs font-medium transition-colors',
                selectedCategory === null ? 'bg-gold text-surface' : 'bg-surface-elevated border border-gold-muted text-ink-secondary']"
              @click="selectedCategory = null"
            >
              {{ t('glossary.allCategories') }}
            </button>
            <button
              v-for="cat in categories"
              :key="cat"
              type="button"
              :class="['shrink-0 px-3 py-1 rounded-full text-xs font-medium transition-colors',
                selectedCategory === cat ? 'bg-gold text-surface' : 'bg-surface-elevated border border-gold-muted text-ink-secondary']"
              @click="selectedCategory = cat"
            >
              {{ t(`glossary.categories.${cat}`) }}
            </button>
          </div>

          <!-- 用語リスト -->
          <ul v-if="filteredTerms.length > 0" class="space-y-2">
            <li
              v-for="term in filteredTerms"
              :key="term.id"
              class="bg-surface-elevated border border-gold-muted rounded-xl overflow-hidden"
            >
              <button
                type="button"
                class="w-full flex items-center justify-between px-4 py-2.5 text-left"
                @click="toggleTerm(term.id)"
              >
                <span class="text-ink-primary text-sm font-medium">
                  {{ locale === 'ja' ? term.termJa : term.termEn }}
                </span>
                <svg
                  :class="['w-3.5 h-3.5 text-ink-muted transition-transform', activeId === term.id ? 'rotate-180' : '']"
                  xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"
                >
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <div v-show="activeId === term.id" class="px-4 pb-3 border-t border-gold-muted/30">
                <p class="text-ink-secondary text-sm mt-2">
                  {{ locale === 'ja' ? term.definitionJa : term.definitionEn }}
                </p>
              </div>
            </li>
          </ul>
          <p v-else class="text-center text-ink-muted py-8 text-sm">{{ t('glossary.noResults') }}</p>
        </div>
      </div>
    </div>
  </teleport>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useGlossary } from '@/composables/useGlossary'
import type { GlossaryCategory } from '@/data/glossary'

const props = defineProps<{ visible: boolean }>()
const emit = defineEmits<{ close: [] }>()

const { t, locale } = useI18n()
const { filteredTerms, searchQuery, selectedCategory } = useGlossary()
const activeId = ref<string | null>(null)

// モーダルが開くたびに検索・フィルタ状態をリセットする
watch(() => props.visible, (visible) => {
  if (visible) {
    searchQuery.value = ''
    selectedCategory.value = null
    activeId.value = null
  }
})

const categories: GlossaryCategory[] = [
  'tasting-process', 'flavour-wheel', 'mouthfeel', 'finish', 'production', 'region', 'general'
]

function toggleTerm(id: string) {
  activeId.value = activeId.value === id ? null : id
}
</script>
