<template>
  <div class="min-h-screen bg-surface">
    <!-- ヘッダー -->
    <AppHeader :title="t('common.edit')" :show-back="true" :show-home="true" />

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
      <NoteForm
        :initial-data="note"
        :initial-image-url="existingImageUrl"
        @submit="handleSubmit"
        @change="isDirty = true"
      />
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute, onBeforeRouteLeave } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useNotesStore } from '@/stores/notes'
import { db } from '@/db'
import AppHeader from '@/components/AppHeader.vue'
import NoteForm from '@/components/NoteForm.vue'
import type { TastingNote } from '@/db/types'

const router = useRouter()
const route = useRoute()
const { t } = useI18n()
const notesStore = useNotesStore()

const note = ref<TastingNote | null>(null)
const loading = ref(true)
const existingImageUrl = ref<string | null>(null)
const isDirty = ref(false)
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
      existingImageUrl.value = objectUrl
    }
  }
})

onUnmounted(() => {
  if (objectUrl) URL.revokeObjectURL(objectUrl)
})

onBeforeRouteLeave(() => {
  if (isDirty.value) {
    return window.confirm(t('common.discardChanges'))
  }
})

async function handleSubmit(data: Partial<TastingNote>, imageFile?: File | null): Promise<void> {
  if (!note.value) return
  isDirty.value = false
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
