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
      <h1 class="text-lg font-semibold text-ink-primary">{{ t('common.newNote') }}</h1>
    </header>

    <!-- フォーム -->
    <main class="p-4 pb-safe">
      <NoteForm :initial-data="draftData" @submit="handleSubmit" />
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useNotesStore } from '@/stores/notes'
import { useDraftStore } from '@/stores/draft'
import NoteForm from '@/components/NoteForm.vue'
import type { TastingNote } from '@/db/types'

const router = useRouter()
const { t } = useI18n()
const notesStore = useNotesStore()
const draftStore = useDraftStore()

const draftData = ref<Partial<TastingNote>>({})

onMounted(async () => {
  await draftStore.loadDraft()
  if (draftStore.draft) {
    draftData.value = draftStore.draft
  }
})

async function handleSubmit(data: Partial<TastingNote>, imageFile?: File | null): Promise<void> {
  const noteId = await notesStore.createNote(data as Omit<TastingNote, 'id' | 'createdAt' | 'updatedAt'>)
  if (imageFile) {
    await notesStore.saveImage(noteId, imageFile)
  }
  await draftStore.clearDraft()
  router.push({ name: 'home' })
}
</script>
