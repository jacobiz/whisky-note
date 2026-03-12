<template>
  <Teleport to="body">
    <div
      v-if="visible"
      role="dialog"
      :aria-label="t('import.confirmTitle')"
      class="fixed inset-0 z-50 flex items-center justify-center p-4"
      @click.self="emit('cancel')"
    >
      <!-- オーバーレイ -->
      <div class="absolute inset-0 bg-black/70" />

      <!-- ダイアログ -->
      <div class="relative w-full max-w-sm bg-surface-elevated border border-gold-muted rounded-2xl p-6 shadow-gold-lg space-y-4">
        <h2 class="text-lg font-semibold text-ink-primary">{{ t('import.confirmTitle') }}</h2>
        <p class="text-sm text-ink-secondary">
          {{ t('import.confirmMessage', { total: totalCount, skipped: skippedCount }) }}
        </p>

        <div class="flex gap-3 pt-2">
          <button
            type="button"
            class="flex-1 py-2.5 px-4 border border-gold-muted rounded-lg text-ink-secondary
                   hover:border-gold transition-colors text-sm"
            @click="emit('cancel')"
          >
            {{ t('import.cancelButton') }}
          </button>
          <button
            type="button"
            class="flex-1 py-2.5 px-4 bg-gold hover:bg-gold-dark text-ink-on-gold rounded-lg
                   transition-colors text-sm font-medium"
            @click="emit('confirm')"
          >
            {{ t('import.confirmButton') }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'

defineProps<{
  visible: boolean
  totalCount: number
  skippedCount: number
}>()

const emit = defineEmits<{
  confirm: []
  cancel: []
}>()

const { t } = useI18n()
</script>
