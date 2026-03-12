<template>
  <div class="min-h-screen bg-surface">
    <!-- ヘッダー -->
    <AppHeader :title="t('common.newNote')" :show-back="true" :show-home="true" />

    <!-- フォーム -->
    <main class="p-4 pb-safe">
      <NoteForm :initial-data="draftData" @submit="handleSubmit" @change="isDirty = true" />
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, onBeforeRouteLeave } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useNotesStore } from '@/stores/notes'
import { useDraftStore } from '@/stores/draft'
import AppHeader from '@/components/AppHeader.vue'
import NoteForm from '@/components/NoteForm.vue'
import type { TastingNote } from '@/db/types'

const router = useRouter()
const { t } = useI18n()
const notesStore = useNotesStore()
const draftStore = useDraftStore()

const draftData = ref<Partial<TastingNote>>({})
const isDirty = ref(false)

onMounted(async () => {
  await draftStore.loadDraft()
  if (draftStore.draft) {
    draftData.value = draftStore.draft
  }
})

onBeforeRouteLeave(() => {
  if (isDirty.value) {
    return window.confirm(t('common.discardChanges'))
  }
})

async function handleSubmit(data: Partial<TastingNote>, imageFile?: File | null): Promise<void> {
  isDirty.value = false
  const noteId = await notesStore.createNote(data as Omit<TastingNote, 'id' | 'createdAt' | 'updatedAt'>)
  if (imageFile) {
    await notesStore.saveImage(noteId, imageFile)
  }
  await draftStore.clearDraft()
  router.push({ name: 'home' })
}
</script>
