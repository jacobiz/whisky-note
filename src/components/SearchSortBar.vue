<template>
  <div
    class="flex items-center gap-2 px-4 py-2 bg-surface sticky z-10 border-b border-gold-muted/30"
    style="top: calc(57px + env(safe-area-inset-top))"
  >
    <!-- 検索バー -->
    <div class="relative flex-1">
      <input
        v-model="store.query"
        type="search"
        :placeholder="t('search.placeholder')"
        class="w-full bg-surface-elevated border border-gold-muted rounded-lg pl-4 pr-8 py-2
               text-ink-primary placeholder-ink-muted text-sm
               focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold transition-colors"
      />
      <button
        v-if="store.query"
        type="button"
        :aria-label="t('search.clearLabel')"
        class="absolute right-2 top-1/2 -translate-y-1/2 text-ink-muted hover:text-ink-primary transition-colors"
        @click="store.query = ''"
      >
        ✕
      </button>
    </div>

    <!-- ソートセレクター -->
    <div class="flex items-center gap-1 shrink-0">
      <label :for="selectId" class="sr-only">{{ t('search.sortLabel') }}</label>
      <!-- visible label for non-SR users -->
      <span class="text-xs text-ink-muted whitespace-nowrap hidden sm:inline">{{ t('search.sortLabel') }}</span>
      <select
        :id="selectId"
        v-model="store.sortOption"
        :aria-label="t('search.sortLabel')"
        class="bg-surface-elevated border border-gold-muted rounded-lg px-2 py-2 text-sm
               text-ink-primary focus:outline-none focus:border-gold transition-colors"
      >
        <option value="date-desc">{{ t('search.sortDateDesc') }}</option>
        <option value="date-asc">{{ t('search.sortDateAsc') }}</option>
        <option value="rating-desc">{{ t('search.sortRatingDesc') }}</option>
        <option value="name-asc">{{ t('search.sortNameAsc') }}</option>
      </select>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useSearchSortStore } from '@/stores/searchSort'

const { t } = useI18n()
const store = useSearchSortStore()

// label の for と select の id を一致させるための固定値
const selectId = 'sort-select'
</script>
