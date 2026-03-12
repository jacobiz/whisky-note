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
      <h1 class="text-lg font-semibold text-ink-primary">{{ t('common.edit') }}</h1>
    </header>

    <!-- ローディング -->
    <div v-if="loading" class="flex items-center justify-center py-24">
      <div class="text-ink-muted">{{ t('common.loading') }}</div>
    </div>

    <!-- ノートが見つからない -->
    <div v-else-if="!note" class="flex items-center justify-center py-24">
      <p class="text-ink-muted">{{ t('errors.noteNotFound') }}</p>
    </div>

    <!-- フォーム -->
    <main v-else class="p-4 pb-safe">
      <NoteForm :initial-data="note" @submit="handleSubmit" />
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useNotesStore } from '@/stores/notes'
import NoteForm from '@/components/NoteForm.vue'
import type { TastingNote } from '@/db/types'

const router = useRouter()
const route = useRoute()
const { t } = useI18n()
const notesStore = useNotesStore()

const note = ref<TastingNote | null>(null)
const loading = ref(true)

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
})

async function handleSubmit(data: Partial<TastingNote>, imageFile?: File | null): Promise<void> {
  if (!note.value) return
  await notesStore.updateNote(note.value.id, data)
  if (imageFile) {
    await notesStore.saveImage(note.value.id, imageFile)
  } else if (imageFile === null) {
    // null は明示的な削除
    await notesStore.deleteImage(note.value.id)
  }
  router.push({ name: 'note-detail', params: { id: note.value.id } })
}
</script>
