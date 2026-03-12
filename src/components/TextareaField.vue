<template>
  <div>
    <label :for="id" class="block text-sm font-medium text-ink-secondary mb-1">
      {{ label }}
    </label>
    <textarea
      :id="id"
      :value="modelValue"
      :placeholder="placeholder"
      :maxlength="maxLength"
      rows="3"
      class="w-full bg-surface-elevated border border-gold-muted rounded-lg px-4 py-3
             text-ink-primary placeholder-ink-muted focus:outline-none focus:border-gold
             focus:ring-1 focus:ring-gold transition-colors resize-none"
      @input="onInput"
    />
    <div class="flex justify-between mt-1">
      <p v-if="isOverLimit" class="text-sm text-red-400">
        {{ t('errors.textTooLong', { field: label, max: maxLength }) }}
      </p>
      <span v-else />
      <span class="text-xs text-ink-muted">{{ charCount }} / {{ maxLength }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { TEXT_FIELD_MAX_LENGTH } from '@/db/types'

const props = defineProps<{
  id: string
  label: string
  placeholder?: string
  modelValue?: string
  maxLength?: number
}>()

const emit = defineEmits<{ 'update:modelValue': [value: string] }>()
const { t } = useI18n()

const maxLength = props.maxLength ?? TEXT_FIELD_MAX_LENGTH
const charCount = computed(() => props.modelValue?.length ?? 0)
const isOverLimit = computed(() => charCount.value > maxLength)

function onInput(e: Event): void {
  emit('update:modelValue', (e.target as HTMLTextAreaElement).value)
}
</script>
