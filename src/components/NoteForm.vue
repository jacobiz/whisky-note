<template>
  <form class="space-y-6" @submit.prevent="handleSubmit">
    <!-- ボトル画像 -->
    <ImagePicker v-model="selectedImage" :existing-image-url="initialImageUrl" @update:compressing="isImageCompressing = $event" />

    <!-- 銘柄名（必須） -->
    <div>
      <label for="brandName" class="block text-sm font-medium text-gold mb-1">
        {{ t('notes.brandName') }} <span class="text-red-400">*</span>
      </label>
      <input
        id="brandName"
        v-model="form.brandName"
        type="text"
        :placeholder="t('form.brandNamePlaceholder')"
        class="w-full bg-surface-elevated border border-gold-muted rounded-lg px-4 py-3
               text-ink-primary placeholder-ink-muted focus:outline-none focus:border-gold
               focus:ring-1 focus:ring-gold transition-colors"
        maxlength="100"
      />
      <p v-if="errors.brandName" class="mt-1 text-sm text-red-400">{{ errors.brandName }}</p>
    </div>

    <!-- 蒸留所 -->
    <div>
      <label for="distillery" class="block text-sm font-medium text-ink-secondary mb-1">
        {{ t('notes.distillery') }}
      </label>
      <input
        id="distillery"
        v-model="form.distillery"
        type="text"
        :placeholder="t('form.distilleryPlaceholder')"
        class="input-field"
        maxlength="100"
      />
    </div>

    <!-- ヴィンテージ -->
    <div>
      <label for="vintage" class="block text-sm font-medium text-ink-secondary mb-1">
        {{ t('notes.vintage') }}
      </label>
      <input
        id="vintage"
        v-model="form.vintage"
        type="text"
        :placeholder="t('form.vintagePlaceholder')"
        class="input-field"
        maxlength="20"
      />
    </div>

    <!-- テキストエリア群 -->
    <TextareaField
      id="appearance"
      v-model="form.appearance"
      :label="t('notes.appearance')"
      :placeholder="t('form.appearancePlaceholder')"
    />
    <TextareaField
      id="nose"
      v-model="form.nose"
      :label="t('notes.nose')"
      :placeholder="t('form.nosePlaceholder')"
    />
    <TextareaField
      id="palate"
      v-model="form.palate"
      :label="t('notes.palate')"
      :placeholder="t('form.palatePlaceholder')"
    />
    <TextareaField
      id="finish"
      v-model="form.finish"
      :label="t('notes.finish')"
      :placeholder="t('form.finishPlaceholder')"
    />

    <!-- 総合評価 -->
    <div>
      <label for="rating" class="block text-sm font-medium text-ink-secondary mb-1">
        {{ t('notes.rating') }} (0–100)
      </label>
      <input
        id="rating"
        v-model.number="form.rating"
        type="number"
        min="0"
        max="100"
        :placeholder="t('form.ratingPlaceholder')"
        class="input-field w-32"
      />
      <p v-if="errors.rating" class="mt-1 text-sm text-red-400">{{ errors.rating }}</p>
    </div>

    <!-- メモ -->
    <TextareaField
      id="notes"
      v-model="form.notes"
      :label="t('notes.notes')"
      :placeholder="t('form.notesPlaceholder')"
    />

    <!-- 用語辞典を参照ボタン -->
    <button
      type="button"
      class="w-full flex items-center justify-center gap-2 py-2.5 border border-gold-muted
             rounded-lg text-ink-secondary hover:text-ink-primary hover:bg-surface-overlay
             transition-colors text-sm"
      @click="showGlossary = true"
    >
      <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
          d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
      {{ t('glossary.openGlossary') }}
    </button>

    <!-- 辞典モーダル -->
    <GlossaryModal :visible="showGlossary" @close="showGlossary = false" />

    <!-- 保存ボタン -->
    <button
      type="submit"
      :disabled="isImageCompressing"
      class="w-full bg-gold hover:bg-gold-light text-surface font-semibold py-3 px-6
             rounded-lg transition-colors shadow-gold-lg disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {{ isImageCompressing ? t('form.compressing') : t('common.save') }}
    </button>
  </form>
</template>

<script setup lang="ts">
import { reactive, ref, watch, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useDraftStore } from '@/stores/draft'
import TextareaField from './TextareaField.vue'
import ImagePicker from './ImagePicker.vue'
import GlossaryModal from './GlossaryModal.vue'
import type { TastingNote } from '@/db/types'
import { TEXT_FIELD_MAX_LENGTH } from '@/db/types'

interface Props {
  initialData?: Partial<TastingNote>
  initialImageUrl?: string | null
}

const props = withDefaults(defineProps<Props>(), { initialData: () => ({}), initialImageUrl: null })
const emit = defineEmits<{
  submit: [data: Partial<TastingNote>, imageFile?: File | null]
  change: []
}>()

const { t } = useI18n()
const draftStore = useDraftStore()
const selectedImage = ref<File | null>(null)
const isImageCompressing = ref(false)
const showGlossary = ref(false)

const form = reactive<Partial<Omit<TastingNote, 'id' | 'createdAt' | 'updatedAt'>>>({
  brandName: props.initialData.brandName ?? '',
  distillery: props.initialData.distillery ?? '',
  vintage: props.initialData.vintage ?? '',
  appearance: props.initialData.appearance ?? '',
  nose: props.initialData.nose ?? '',
  palate: props.initialData.palate ?? '',
  finish: props.initialData.finish ?? '',
  rating: props.initialData.rating,
  notes: props.initialData.notes ?? '',
})

const errors = reactive({ brandName: '', rating: '' })

// 入力変更時に変更通知（即時）＋下書き自動保存（500ms デバウンス）
let saveTimer: ReturnType<typeof setTimeout> | null = null

watch(form, (newVal) => {
  emit('change')
  if (saveTimer) clearTimeout(saveTimer)
  saveTimer = setTimeout(() => { draftStore.saveDraft(newVal) }, 500)
})

onUnmounted(() => {
  if (saveTimer) clearTimeout(saveTimer)
})

function validate(): boolean {
  errors.brandName = ''
  errors.rating = ''

  if (!form.brandName?.trim()) {
    errors.brandName = t('errors.brandNameRequired')
    return false
  }
  if (form.rating !== undefined && (form.rating < 0 || form.rating > 100 || !Number.isInteger(form.rating))) {
    errors.rating = t('errors.ratingOutOfRange')
    return false
  }
  return true
}

async function handleSubmit(): Promise<void> {
  if (!validate()) return
  emit('submit', { ...form }, selectedImage.value)
}
</script>

<style scoped>
.input-field {
  @apply w-full bg-surface-elevated border border-gold-muted rounded-lg px-4 py-3
         text-ink-primary placeholder-ink-muted focus:outline-none focus:border-gold
         focus:ring-1 focus:ring-gold transition-colors;
}
</style>
