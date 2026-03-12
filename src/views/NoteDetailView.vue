<template>
  <div class="min-h-screen bg-surface">
    <!-- ヘッダー -->
    <header class="sticky top-0 z-10 bg-surface/90 backdrop-blur border-b border-gold-muted px-4 py-3 flex items-center gap-3">
      <button
        type="button"
        class="p-1 text-ink-secondary hover:text-gold transition-colors"
        :aria-label="t('common.back')"
        @click="router.back()"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <h1 class="flex-1 text-lg font-semibold text-ink-primary truncate">{{ note?.brandName }}</h1>
      <button
        type="button"
        class="p-1 text-ink-secondary hover:text-gold transition-colors"
        :aria-label="t('common.edit')"
        @click="router.push({ name: 'note-edit', params: { id: note?.id } })"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      </button>
      <button
        type="button"
        class="p-1 text-ink-secondary hover:text-red-400 transition-colors"
        :aria-label="t('delete.title')"
        @click="showDeleteDialog = true"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      </button>
    </header>

    <!-- ローディング -->
    <div v-if="loading" class="flex items-center justify-center py-24">
      <div class="text-ink-muted">{{ t('common.loading') }}</div>
    </div>

    <!-- ノートが見つからない -->
    <div v-else-if="!note" class="flex items-center justify-center py-24">
      <p class="text-ink-muted">{{ t('errors.noteNotFound') }}</p>
    </div>

    <!-- コンテンツ -->
    <main v-else class="p-4 space-y-6 pb-safe">
      <!-- サムネイル -->
      <div v-if="thumbnailUrl" class="rounded-xl overflow-hidden h-48">
        <img :src="thumbnailUrl" :alt="note.brandName" class="w-full h-full object-cover" />
      </div>

      <!-- 基本情報 -->
      <div class="bg-surface-elevated border border-gold-muted rounded-xl p-4 space-y-3">
        <div v-if="note.distillery" class="space-y-1">
          <p class="text-xs text-ink-muted uppercase tracking-wider">{{ t('notes.distillery') }}</p>
          <p class="text-ink-primary">{{ note.distillery }}</p>
        </div>
        <div v-if="note.vintage" class="space-y-1">
          <p class="text-xs text-ink-muted uppercase tracking-wider">{{ t('notes.vintage') }}</p>
          <p class="text-ink-primary">{{ note.vintage }}</p>
        </div>
        <div v-if="note.rating !== undefined" class="flex items-center gap-2">
          <span class="text-gold font-bold text-2xl">{{ note.rating }}</span>
          <span class="text-ink-muted">/ 100</span>
        </div>
      </div>

      <!-- テイスティングノート -->
      <div class="space-y-4">
        <NoteSection v-if="note.appearance" :label="t('notes.appearance')" :value="note.appearance" />
        <NoteSection v-if="note.nose" :label="t('notes.nose')" :value="note.nose" />
        <NoteSection v-if="note.palate" :label="t('notes.palate')" :value="note.palate" />
        <NoteSection v-if="note.finish" :label="t('notes.finish')" :value="note.finish" />
        <NoteSection v-if="note.notes" :label="t('notes.notes')" :value="note.notes" />
      </div>

      <!-- 記録日時 -->
      <p class="text-xs text-ink-muted text-right">{{ formattedDate }}</p>
    </main>

    <!-- 削除確認ダイアログ -->
    <DeleteConfirmDialog v-model="showDeleteDialog" @confirm="handleDelete" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useNotesStore } from '@/stores/notes'
import { db } from '@/db'
import DeleteConfirmDialog from '@/components/DeleteConfirmDialog.vue'
import type { TastingNote } from '@/db/types'

// シンプルなインラインコンポーネント（テキストセクション表示用）
const NoteSection = {
  props: ['label', 'value'],
  template: `
    <div class="bg-surface-elevated border border-gold-muted rounded-xl p-4 space-y-2">
      <p class="text-xs text-ink-muted uppercase tracking-wider">{{ label }}</p>
      <p class="text-ink-primary whitespace-pre-wrap leading-relaxed">{{ value }}</p>
    </div>
  `,
}

const router = useRouter()
const route = useRoute()
const { t } = useI18n()
const notesStore = useNotesStore()

const note = ref<TastingNote | null>(null)
const loading = ref(true)
const showDeleteDialog = ref(false)
const thumbnailUrl = ref<string | null>(null)
let objectUrl: string | null = null

onMounted(async () => {
  const id = route.params.id as string
  const found = notesStore.notes.find(n => n.id === id)
  if (found) {
    note.value = found
  } else {
    await notesStore.loadNotes()
    note.value = notesStore.notes.find(n => n.id === id) ?? null
  }
  loading.value = false

  if (note.value?.imageId) {
    const img = await db.bottleImages.get(note.value.imageId)
    if (img) {
      objectUrl = URL.createObjectURL(img.blob)
      thumbnailUrl.value = objectUrl
    }
  }
})

onUnmounted(() => {
  if (objectUrl) URL.revokeObjectURL(objectUrl)
})

const formattedDate = computed(() => {
  if (!note.value) return ''
  return note.value.createdAt.toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'short',
  })
})

async function handleDelete(): Promise<void> {
  if (!note.value) return
  await notesStore.deleteNote(note.value.id)
  router.push({ name: 'home' })
}
</script>
