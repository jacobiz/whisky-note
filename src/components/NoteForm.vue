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
import { reactive, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useDraftStore } from '@/stores/draft'
import TextareaField from './TextareaField.vue'
import ImagePicker from './ImagePicker.vue'
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

// 入力変更時に下書き自動保存・変更通知
watch(form, async (newVal) => {
  await draftStore.saveDraft(newVal)
  emit('change')
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
