<template>
  <div>
    <!-- 画像表示エリア（縦長 2:3 比率） -->
    <div v-if="displayUrl" class="relative flex justify-center mb-3">
      <div class="aspect-[2/3] max-w-[180px] w-full overflow-hidden rounded-xl bg-surface-overlay">
        <img :src="displayUrl" alt="ボトル画像プレビュー" class="w-full h-full object-contain" />
      </div>
      <!-- 操作ボタン群（右下に重ねて表示） -->
      <div class="absolute bottom-2 right-1/2 translate-x-[90px] flex gap-1">
        <!-- 変更ボタン -->
        <button
          type="button"
          class="w-8 h-8 bg-black/60 rounded-full flex items-center justify-center
                 text-white hover:bg-black/80 transition-colors"
          :aria-label="t('form.changePhoto')"
          @click="fileInput?.click()"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
              d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>
        <!-- 削除ボタン -->
        <button
          type="button"
          class="w-8 h-8 bg-black/60 rounded-full flex items-center justify-center
                 text-white hover:bg-black/80 transition-colors"
          :aria-label="t('form.removeImage')"
          @click="removeImage"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>

    <!-- 画像選択ボタン（画像なし時） -->
    <button
      v-else
      type="button"
      class="w-full h-32 border-2 border-dashed border-gold-muted rounded-xl flex flex-col items-center
             justify-center gap-2 text-ink-muted hover:border-gold hover:text-gold transition-colors"
      :disabled="isCompressing"
      @click="fileInput?.click()"
    >
      <svg xmlns="http://www.w3.org/2000/svg" class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
          d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
      <span class="text-sm">{{ isCompressing ? t('form.compressing') : t('form.addImage') }}</span>
    </button>

    <!-- 非表示ファイル入力 -->
    <input
      ref="fileInput"
      type="file"
      accept="image/*"
      capture="environment"
      class="hidden"
      @change="onFileChange"
    />

    <!-- エラーメッセージ -->
    <p v-if="compressionError" class="mt-1 text-sm text-red-400">{{ compressionError }}</p>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useImageCompression } from '@/composables/useImageCompression'

interface Props {
  existingImageUrl?: string | null
}

const props = withDefaults(defineProps<Props>(), { existingImageUrl: null })

const emit = defineEmits<{
  'update:modelValue': [file: File | null]
  'update:compressing': [value: boolean]
}>()

const { t } = useI18n()
const { compress, isCompressing, error: compressionError } = useImageCompression()

const fileInput = ref<HTMLInputElement | null>(null)
const previewUrl = ref<string | null>(null)
const imageDeleted = ref(false)  // 明示的に削除された場合は existingImageUrl にフォールバックしない
let objectUrl: string | null = null

// 新規選択 URL または既存 URL を表示（削除済みの場合は null）
const displayUrl = computed(() => {
  if (imageDeleted.value) return null
  return previewUrl.value || props.existingImageUrl || null
})

onUnmounted(() => {
  if (objectUrl) URL.revokeObjectURL(objectUrl)
})

async function onFileChange(event: Event): Promise<void> {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return

  emit('update:compressing', true)
  const compressed = await compress(file)
  emit('update:compressing', false)
  if (!compressed) return

  // 旧 URL を解放
  if (objectUrl) URL.revokeObjectURL(objectUrl)

  objectUrl = URL.createObjectURL(compressed)
  previewUrl.value = objectUrl
  emit('update:modelValue', compressed)
}

function removeImage(): void {
  if (objectUrl) {
    URL.revokeObjectURL(objectUrl)
    objectUrl = null
  }
  previewUrl.value = null
  imageDeleted.value = true
  emit('update:modelValue', null)
  if (fileInput.value) fileInput.value.value = ''
}
</script>
