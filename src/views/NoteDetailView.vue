<template>
  <div class="min-h-screen bg-surface">
    <!-- ヘッダー -->
    <AppHeader :title="note?.brandName ?? ''" :show-back="true" :show-home="true">
      <template #actions>
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
      </template>
    </AppHeader>

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
      <!-- サムネイル（縦長 2:3 比率） -->
      <div v-if="thumbnailUrl" class="flex justify-center">
        <div class="aspect-[2/3] w-full max-w-[240px] rounded-xl overflow-hidden">
          <img :src="thumbnailUrl" :alt="note.brandName" class="w-full h-full object-contain" />
        </div>
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
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useNotesStore } from '@/stores/notes'
import { useBottleImage } from '@/composables/useBottleImage'
import AppHeader from '@/components/AppHeader.vue'
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
const { imageUrl: thumbnailUrl, loadImage } = useBottleImage()

const note = ref<TastingNote | null>(null)
const loading = ref(true)
const showDeleteDialog = ref(false)

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
    await loadImage(note.value.imageId)
  }
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
