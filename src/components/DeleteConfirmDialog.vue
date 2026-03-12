<template>
  <Teleport to="body">
    <div
      v-if="modelValue"
      class="fixed inset-0 z-50 flex items-center justify-center p-4"
      @click.self="emit('update:modelValue', false)"
    >
      <!-- オーバーレイ -->
      <div class="absolute inset-0 bg-black/70" />

      <!-- ダイアログ -->
      <div class="relative w-full max-w-sm bg-surface-elevated border border-gold-muted rounded-2xl p-6 shadow-gold-lg space-y-4">
        <h2 class="text-lg font-semibold text-ink-primary">{{ t('delete.title') }}</h2>
        <p class="text-sm text-ink-secondary">{{ message || t('delete.message') }}</p>

        <div class="flex gap-3 pt-2">
          <button
            type="button"
            class="flex-1 py-2.5 px-4 border border-gold-muted rounded-lg text-ink-secondary
                   hover:border-gold transition-colors text-sm"
            @click="emit('update:modelValue', false)"
          >
            {{ t('delete.cancel') }}
          </button>
          <button
            type="button"
            class="flex-1 py-2.5 px-4 bg-red-700 hover:bg-red-600 text-white rounded-lg
                   transition-colors text-sm font-medium"
            @click="onConfirm"
          >
            {{ t('delete.confirm') }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'

defineProps<{
  modelValue: boolean
  message?: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  confirm: []
}>()

const { t } = useI18n()

function onConfirm(): void {
  emit('confirm')
  emit('update:modelValue', false)
}
</script>
