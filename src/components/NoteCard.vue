<template>
  <div
    role="article"
    class="flex flex-row bg-surface-elevated border border-gold-muted rounded-xl overflow-hidden
           hover:border-gold transition-colors cursor-pointer shadow-gold-lg"
    @click="emit('click', note.id)"
  >
    <!-- 左エリア: 縦長サムネイル（縦:横 = 3:2） -->
    <div class="w-24 shrink-0 aspect-[2/3] bg-surface-overlay flex items-center justify-center overflow-hidden">
      <img
        v-if="thumbnailUrl"
        :src="thumbnailUrl"
        :alt="note.brandName"
        class="w-full h-full object-contain"
      />
      <div v-else class="text-3xl opacity-30">🥃</div>
    </div>

    <!-- 右エリア: ノート情報 -->
    <div class="flex flex-col justify-between flex-1 p-3 min-w-0">
      <!-- 銘柄名（1行省略） -->
      <h3 class="font-semibold text-ink-primary truncate text-sm">{{ note.brandName }}</h3>

      <!-- 評価（数値のみ、未入力は非表示） -->
      <div v-if="note.rating !== undefined" class="text-gold font-bold text-sm">
        {{ note.rating }}
      </div>

      <!-- テイスティングコメントプレビュー（最大2行） -->
      <p class="line-clamp-2 text-xs text-ink-secondary leading-relaxed">{{ commentPreview }}</p>

      <!-- 記録日時（YYYY/MM/DD） -->
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

// コメントプレビュー: 外観→香り→味わい→余韻→メモの優先順で最初の入力済みフィールドを返す
const commentPreview = computed(() =>
  [props.note.appearance, props.note.nose, props.note.palate, props.note.finish, props.note.notes]
    .find(v => v?.trim()) ?? ''
)

// 記録日時: YYYY/MM/DD 形式
const formattedDate = computed(() =>
  props.note.createdAt.toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
)
</script>
