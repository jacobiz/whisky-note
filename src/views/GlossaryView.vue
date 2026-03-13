<template>
  <div class="min-h-screen bg-surface">
    <AppHeader :title="t('glossary.title')" :show-back="true" :show-home="true" />

    <main class="p-4 space-y-4 pb-safe">
      <!-- 検索ボックス -->
      <div class="relative">
        <input
          v-model="searchQuery"
          type="search"
          :placeholder="t('glossary.searchPlaceholder')"
          class="w-full bg-surface-elevated border border-gold-muted rounded-lg px-4 py-3
                 text-ink-primary placeholder-ink-muted focus:outline-none focus:border-gold
                 focus:ring-1 focus:ring-gold transition-colors"
        />
      </div>

      <!-- カテゴリタブ -->
      <div class="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        <button
          type="button"
          :class="['shrink-0 px-3 py-1.5 rounded-full text-sm font-medium transition-colors',
            selectedCategory === null
              ? 'bg-gold text-surface'
              : 'bg-surface-elevated border border-gold-muted text-ink-secondary hover:text-ink-primary']"
          @click="selectedCategory = null"
        >
          {{ t('glossary.allCategories') }}
        </button>
        <button
          v-for="cat in categories"
          :key="cat"
          type="button"
          :class="['shrink-0 px-3 py-1.5 rounded-full text-sm font-medium transition-colors',
            selectedCategory === cat
              ? 'bg-gold text-surface'
              : 'bg-surface-elevated border border-gold-muted text-ink-secondary hover:text-ink-primary']"
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
          <!-- アコーディオンヘッダー -->
          <button
            type="button"
            class="w-full flex items-center justify-between px-4 py-3 text-left"
            @click="toggleTerm(term.id)"
          >
            <div>
              <span class="text-ink-primary font-medium">
                {{ locale === 'ja' ? term.termJa : term.termEn }}
              </span>
              <span class="ml-2 text-ink-muted text-sm">
                {{ locale === 'ja' ? term.termEn : term.termJa }}
              </span>
            </div>
            <svg
              :class="['w-4 h-4 text-ink-muted transition-transform', activeId === term.id ? 'rotate-180' : '']"
              xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          <!-- アコーディオン展開コンテンツ -->
          <div v-show="activeId === term.id" class="px-4 pb-4 pt-0 border-t border-gold-muted/30 space-y-2">
            <p class="text-ink-primary text-sm">
              {{ locale === 'ja' ? term.definitionJa : term.definitionEn }}
            </p>
            <p v-if="locale !== 'ja'" class="text-ink-muted text-sm italic">
              {{ term.definitionJa }}
            </p>
            <ul v-if="(locale === 'ja' ? term.examplesJa : term.examplesEn)?.length" class="mt-2">
              <li
                v-for="(ex, i) in (locale === 'ja' ? term.examplesJa : term.examplesEn)"
                :key="i"
                class="text-ink-muted text-sm"
              >
                • {{ ex }}
              </li>
            </ul>
          </div>
        </li>
      </ul>

      <!-- 結果なし -->
      <p v-else class="text-center text-ink-muted py-12">
        {{ t('glossary.noResults') }}
      </p>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import AppHeader from '@/components/AppHeader.vue'
import { useGlossary } from '@/composables/useGlossary'
import type { GlossaryCategory } from '@/data/glossary'

const { t, locale } = useI18n()
const { filteredTerms, searchQuery, selectedCategory } = useGlossary()

const activeId = ref<string | null>(null)

const categories: GlossaryCategory[] = [
  'tasting-process', 'flavour-wheel', 'mouthfeel', 'finish', 'production', 'region', 'general'
]

function toggleTerm(id: string) {
  activeId.value = activeId.value === id ? null : id
}
</script>
