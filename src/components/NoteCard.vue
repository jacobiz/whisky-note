<template>
  <div
    class="bg-surface-elevated border border-gold-muted rounded-xl overflow-hidden
           hover:border-gold transition-colors cursor-pointer shadow-gold-lg"
    @click="emit('click', note.id)"
  >
    <!-- サムネイル画像 -->
    <div class="relative h-32 bg-surface-overlay flex items-center justify-center">
      <img
        v-if="thumbnailUrl"
        :src="thumbnailUrl"
        :alt="note.brandName"
        class="w-full h-full object-cover"
      />
      <div v-else class="text-4xl opacity-30">🥃</div>
    </div>

    <!-- コンテンツ -->
    <div class="p-4 space-y-2">
      <h3 class="font-semibold text-ink-primary truncate">{{ note.brandName }}</h3>

      <!-- 評価 -->
      <div v-if="note.rating !== undefined" class="flex items-center gap-2">
        <span class="text-gold font-bold text-lg">{{ note.rating }}</span>
        <span class="text-ink-muted text-sm">/ 100</span>
      </div>

      <!-- 記録日時 -->
      <p class="text-xs text-ink-muted">{{ formattedDate }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { db } from '@/db'
import type { TastingNote } from '@/db/types'

const props = defineProps<{ note: TastingNote }>()
const emit = defineEmits<{ click: [id: string] }>()

const thumbnailUrl = ref<string | null>(null)
let objectUrl: string | null = null

onMounted(async () => {
  if (props.note.imageId) {
    const img = await db.bottleImages.get(props.note.imageId)
    if (img) {
      objectUrl = URL.createObjectURL(img.blob)
      thumbnailUrl.value = objectUrl
    }
  }
})

onUnmounted(() => {
  if (objectUrl) URL.revokeObjectURL(objectUrl)
})

const formattedDate = computed(() =>
  props.note.createdAt.toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
)
</script>
