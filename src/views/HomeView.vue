<template>
  <div class="min-h-screen bg-surface">
    <!-- ヘッダー -->
    <header
      class="sticky top-0 z-10 bg-surface/90 backdrop-blur border-b border-gold-muted px-4 py-3 flex items-center justify-between"
      style="padding-top: calc(0.75rem + env(safe-area-inset-top))"
    >
      <h1 class="text-xl font-bold text-gold tracking-wide">🥃 Whisky Note</h1>
      <button
        type="button"
        class="p-2 text-ink-secondary hover:text-gold transition-colors"
        :aria-label="t('settings.title')"
        @click="router.push({ name: 'settings' })"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      </button>
    </header>

    <!-- 検索・ソートバー -->
    <SearchSortBar />

    <!-- ノート一覧 -->
    <main>
      <NoteList :notes="filteredNotes" :is-filtered="!!searchSortStore.query.trim()" />
    </main>

    <!-- 新規作成FAB -->
    <RouterLink
      :to="{ name: 'note-create' }"
      class="fixed right-6 w-14 h-14 bg-gold hover:bg-gold-light text-surface
             rounded-full flex items-center justify-center shadow-gold-lg transition-colors
             text-2xl font-light"
      style="bottom: calc(1.5rem + env(safe-area-inset-bottom))"
      :aria-label="t('common.newNote')"
    >
      +
    </RouterLink>
  </div>
</template>

<script setup lang="ts">
import { onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useNotesStore } from '@/stores/notes'
import { useSearchSortStore } from '@/stores/searchSort'
import type { SortOption } from '@/stores/searchSort'
import NoteList from '@/components/NoteList.vue'
import SearchSortBar from '@/components/SearchSortBar.vue'
import type { TastingNote } from '@/db/types'

const router = useRouter()
const { t } = useI18n()
const notesStore = useNotesStore()
const searchSortStore = useSearchSortStore()

/** ソートロジック */
function sortNotes(notes: TastingNote[], option: SortOption): TastingNote[] {
  const result = [...notes]
  switch (option) {
    case 'date-desc':
      return result.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    case 'date-asc':
      return result.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
    case 'rating-desc':
      return result.sort((a, b) => {
        // 未設定は末尾
        if (a.rating === undefined && b.rating === undefined) return 0
        if (a.rating === undefined) return 1
        if (b.rating === undefined) return -1
        return b.rating - a.rating
      })
    case 'name-asc':
      return result.sort((a, b) => a.brandName.localeCompare(b.brandName, 'ja'))
  }
}

/** 検索フィルタ + ソートを適用したノートリスト */
const filteredNotes = computed(() => {
  let result = [...notesStore.notes]

  // 検索フィルタ（大文字小文字を区別しない部分一致）
  const q = searchSortStore.query.trim().toLowerCase()
  if (q) {
    result = result.filter(
      n =>
        n.brandName.toLowerCase().includes(q) ||
        (n.distillery ?? '').toLowerCase().includes(q),
    )
  }

  return sortNotes(result, searchSortStore.sortOption)
})

onMounted(async () => {
  await notesStore.loadNotes()
})
</script>
