<template>
  <div>
    <!-- 空状態 -->
    <div v-if="notes.length === 0" class="flex flex-col items-center justify-center py-24 space-y-4">
      <div class="text-6xl opacity-20">🥃</div>
      <p class="text-ink-secondary text-center">{{ t('common.noNotes') }}</p>
      <p class="text-ink-muted text-sm text-center">{{ t('common.noNotesHint') }}</p>
    </div>

    <!-- ノート一覧 -->
    <div v-else class="flex flex-col divide-y divide-gold-muted/20 px-4 py-2 space-y-2">
      <NoteCard
        v-for="note in notes"
        :key="note.id"
        :note="note"
        @click="router.push({ name: 'note-detail', params: { id: note.id } })"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import NoteCard from './NoteCard.vue'
import type { TastingNote } from '@/db/types'

defineProps<{ notes: TastingNote[] }>()

const { t } = useI18n()
const router = useRouter()
</script>
